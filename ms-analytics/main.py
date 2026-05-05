from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3, os, httpx, json, csv, io
from datetime import datetime
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 MS5 ms-analytics iniciado")
    yield

app = FastAPI(
    title="MS5 — Analytics",
    description="Ingesta de datos a S3 y consultas con AWS Athena.",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config AWS
S3_BUCKET   = os.getenv("S3_BUCKET", "utecrate-analytics-data")
AWS_REGION  = os.getenv("AWS_REGION", "us-east-1")
ATHENA_DB   = os.getenv("ATHENA_DATABASE", "utecrate")
ATHENA_OUT  = os.getenv("ATHENA_OUTPUT", f"s3://{S3_BUCKET}/athena-results/")

MS1_URL = os.getenv("MS1_URL", "http://localhost:3001")
MS2_URL = os.getenv("MS2_URL", "http://localhost:3002")
MS3_URL = os.getenv("MS3_URL", "http://localhost:3003")

def get_s3():
    return boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

def get_athena():
    return boto3.client(
        "athena",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ms-analytics", "version": "1.0.0", "timestamp": datetime.utcnow()}

# ──────────────────────────────────────────────
# INGESTA — Pull de cada microservicio → S3
# ──────────────────────────────────────────────

@app.post("/ingest/usuarios")
async def ingest_usuarios():
    """Extrae usuarios del MS1 y los sube como CSV a S3."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(f"{MS1_URL}/usuarios?limite=50000")
        if r.status_code != 200:
            raise HTTPException(502, "Error obteniendo usuarios del MS1")
        data = r.json()

    usuarios = data if isinstance(data, list) else data.get("data", [])
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "nombre", "apellido", "correo", "rol", "activo", "createdAt"])
    writer.writeheader()
    for u in usuarios:
        writer.writerow({
            "id": u.get("id"), "nombre": u.get("nombre"), "apellido": u.get("apellido"),
            "correo": u.get("correo"), "rol": u.get("rol"),
            "activo": u.get("activo"), "createdAt": u.get("createdAt")
        })

    key = f"usuarios/usuarios_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    get_s3().put_object(Bucket=S3_BUCKET, Key=key, Body=output.getvalue(), ContentType="text/csv")
    return {"mensaje": f"{len(usuarios)} usuarios subidos a s3://{S3_BUCKET}/{key}"}

@app.post("/ingest/cursos")
async def ingest_cursos():
    """Extrae cursos del MS2 y los sube como CSV a S3."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(f"{MS2_URL}/cursos?pagina=1&limite=10000")
        if r.status_code != 200:
            raise HTTPException(502, "Error obteniendo cursos del MS2")
        data = r.json()

    cursos = data.get("data", [])
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "nombre", "codigo", "carreraId", "carreraNombre", "creditos", "activo"])
    writer.writeheader()
    for c in cursos:
        writer.writerow({
            "id": c.get("id"), "nombre": c.get("nombre"), "codigo": c.get("codigo"),
            "carreraId": c.get("carreraId"), "carreraNombre": c.get("carreraNombre"),
            "creditos": c.get("creditos"), "activo": c.get("activo")
        })

    key = f"cursos/cursos_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    get_s3().put_object(Bucket=S3_BUCKET, Key=key, Body=output.getvalue(), ContentType="text/csv")
    return {"mensaje": f"{len(cursos)} cursos subidos a s3://{S3_BUCKET}/{key}"}

@app.post("/ingest/calificaciones")
async def ingest_calificaciones():
    """Extrae calificaciones del MS3 y las sube como JSON a S3."""
    resultados = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        for pc_id in range(1, 50):
            r = await client.get(f"{MS3_URL}/calificaciones/profesor-curso/{pc_id}")
            if r.status_code == 200:
                resultados.extend(r.json())

    key = f"calificaciones/calificaciones_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    get_s3().put_object(
        Bucket=S3_BUCKET, Key=key,
        Body=json.dumps(resultados, default=str),
        ContentType="application/json"
    )
    return {"mensaje": f"{len(resultados)} calificaciones subidas a s3://{S3_BUCKET}/{key}"}

@app.post("/ingest/all")
async def ingest_all():
    """Corre los 3 ingestas en secuencia."""
    r1 = await ingest_usuarios()
    r2 = await ingest_cursos()
    r3 = await ingest_calificaciones()
    return {"usuarios": r1, "cursos": r2, "calificaciones": r3}

# ──────────────────────────────────────────────
# ATHENA — Consultas SQL sobre los datos en S3
# ──────────────────────────────────────────────

def run_athena_query(sql: str) -> list:
    athena = get_athena()
    response = athena.start_query_execution(
        QueryString=sql,
        QueryExecutionContext={"Database": ATHENA_DB},
        ResultConfiguration={"OutputLocation": ATHENA_OUT}
    )
    execution_id = response["QueryExecutionId"]

    import time
    for _ in range(30):
        status = athena.get_query_execution(QueryExecutionId=execution_id)
        state = status["QueryExecution"]["Status"]["State"]
        if state == "SUCCEEDED":
            break
        if state in ("FAILED", "CANCELLED"):
            raise HTTPException(500, f"Athena query falló: {state}")
        time.sleep(2)

    results = athena.get_query_results(QueryExecutionId=execution_id)
    rows = results["ResultSet"]["Rows"]
    if len(rows) < 2:
        return []
    headers = [c["VarCharValue"] for c in rows[0]["Data"]]
    return [dict(zip(headers, [c.get("VarCharValue", "") for c in row["Data"]])) for row in rows[1:]]

@app.get("/analytics/top-profesores")
async def top_profesores():
    """Top 10 profesores por promedio de calificaciones."""
    sql = """
    SELECT profesor_id_cache, AVG(CAST(puntaje AS DOUBLE)) as promedio, COUNT(*) as total
    FROM calificaciones
    GROUP BY profesor_id_cache
    ORDER BY promedio DESC
    LIMIT 10
    """
    return run_athena_query(sql)

@app.get("/analytics/cursos-mas-calificados")
async def cursos_mas_calificados():
    """Top 10 cursos con más calificaciones."""
    sql = """
    SELECT c.nombre as curso, COUNT(cal.id) as total_calificaciones,
           AVG(CAST(cal.puntaje AS DOUBLE)) as promedio
    FROM calificaciones cal
    JOIN cursos c ON cal.profesor_curso_id = c.id
    GROUP BY c.nombre
    ORDER BY total_calificaciones DESC
    LIMIT 10
    """
    return run_athena_query(sql)

@app.get("/analytics/distribucion-roles")
async def distribucion_roles():
    """Distribución de usuarios por rol."""
    sql = """
    SELECT rol, COUNT(*) as cantidad
    FROM usuarios
    GROUP BY rol
    ORDER BY cantidad DESC
    """
    return run_athena_query(sql)

@app.get("/analytics/calificaciones-por-semestre")
async def calificaciones_por_semestre():
    """Total de calificaciones agrupadas por año/mes."""
    sql = """
    SELECT substr(creado_en, 1, 7) as mes, COUNT(*) as total,
           AVG(CAST(puntaje AS DOUBLE)) as promedio
    FROM calificaciones
    GROUP BY substr(creado_en, 1, 7)
    ORDER BY mes DESC
    LIMIT 24
    """
    return run_athena_query(sql)
