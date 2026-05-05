from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import httpx, os
from datetime import datetime
from typing import Optional

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 MS4 ms-content iniciado — sin base de datos")
    yield

app = FastAPI(
    title="MS4 — Content",
    description="Microservicio orquestador sin BD. Agrega datos de MS1, MS2 y MS3.",
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

MS1_URL = os.getenv("MS1_URL", "http://localhost:3001")
MS2_URL = os.getenv("MS2_URL", "http://localhost:3002")
MS3_URL = os.getenv("MS3_URL", "http://localhost:3003")

# ── Helper para llamar otros MS ───────────────────────────────
async def get(url: str, token: str = None) -> dict | list:
    headers = {"Authorization": token} if token else {}
    async with httpx.AsyncClient(timeout=8.0) as client:
        r = await client.get(url, headers=headers)
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return r.json()

# ── Health ────────────────────────────────────────────────────
@app.get("/health", tags=["Sistema"])
async def health():
    return {
        "status": "ok",
        "service": "ms-content",
        "version": "1.0.0",
        "timestamp": datetime.utcnow(),
        "nota": "Sin base de datos — consume MS1, MS2, MS3"
    }

# ── Estado de los otros microservicios ───────────────────────
@app.get("/status", tags=["Sistema"])
async def status_microservicios():
    resultados = {}
    for nombre, url in [("ms-users", MS1_URL), ("ms-academic", MS2_URL), ("ms-reviews", MS3_URL)]:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                r = await client.get(f"{url}/health")
                resultados[nombre] = "ok" if r.status_code == 200 else "error"
        except Exception:
            resultados[nombre] = "no disponible"
    return resultados

# ── Perfil completo de un profesor ───────────────────────────
# Agrega: datos MS1 + cursos MS2 + promedio calificaciones MS3
@app.get("/perfil-profesor/{profesor_id}", tags=["Perfiles"])
async def perfil_profesor(
    profesor_id: str,
    authorization: Optional[str] = Header(None)
):
    token = authorization

    # Datos del profesor desde MS1
    try:
        usuario = await get(f"{MS1_URL}/usuarios/{profesor_id}", token)
        if not usuario:
            raise HTTPException(404, f"Profesor {profesor_id} no encontrado en MS1")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "MS1 no disponible")

    # Cursos del profesor desde MS2
    try:
        cursos = await get(f"{MS2_URL}/profesores/{profesor_id}/cursos", token)
        if not isinstance(cursos, list):
            cursos = []
    except Exception:
        cursos = []

    # Resumen de calificaciones desde MS3
    try:
        resumen = await get(f"{MS3_URL}/calificaciones/resumen/profesor/{profesor_id}")
        if not resumen:
            resumen = {"total": 0, "promedio": 0, "distribucion": {}}
    except Exception:
        resumen = {"total": 0, "promedio": 0, "distribucion": {}}

    return {
        "profesor": {
            "id":       usuario.get("id"),
            "nombre":   usuario.get("nombre"),
            "apellido": usuario.get("apellido"),
            "correo":   usuario.get("correo"),
            "foto":     usuario.get("foto"),
            "github":   usuario.get("github"),
            "linkedin": usuario.get("linkedin"),
        },
        "cursos":  cursos,
        "calificaciones": resumen,
    }

# ── Resumen completo de un curso ──────────────────────────────
# Agrega: datos del curso MS2 + profesores con nombre MS1 + calificaciones MS3
@app.get("/resumen-curso/{curso_id}", tags=["Cursos"])
async def resumen_curso(
    curso_id: int,
    authorization: Optional[str] = Header(None)
):
    token = authorization

    try:
        curso = await get(f"{MS2_URL}/cursos/{curso_id}", token)
        if not curso:
            raise HTTPException(404, f"Curso {curso_id} no encontrado")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "MS2 no disponible")

    try:
        profesores = await get(f"{MS2_URL}/cursos/{curso_id}/profesores", token)
        if not isinstance(profesores, list):
            profesores = []
    except Exception:
        profesores = []

    # Para cada profesor-curso obtener calificaciones del MS3
    for pc in profesores:
        try:
            cals = await get(f"{MS3_URL}/calificaciones/profesor-curso/{pc.get('id')}")
            if isinstance(cals, list) and cals:
                puntajes = [c["puntaje"] for c in cals if "puntaje" in c]
                pc["calificaciones"] = {
                    "total":    len(puntajes),
                    "promedio": round(sum(puntajes) / len(puntajes), 2) if puntajes else 0
                }
            else:
                pc["calificaciones"] = {"total": 0, "promedio": 0}
        except Exception:
            pc["calificaciones"] = {"total": 0, "promedio": 0}

    return {
        "curso":      curso,
        "profesores": profesores,
    }

# ── Listar carreras (proxy MS2) ───────────────────────────────
@app.get("/carreras", tags=["Exploración"])
async def listar_carreras():
    try:
        return await get(f"{MS2_URL}/carreras")
    except Exception:
        raise HTTPException(503, "MS2 no disponible")

# ── Buscar cursos (proxy MS2 con filtros) ─────────────────────
@app.get("/buscar", tags=["Exploración"])
async def buscar_cursos(
    q: Optional[str] = None,
    carrera_id: Optional[int] = None,
    pagina: int = 1,
    limite: int = 20
):
    url = f"{MS2_URL}/cursos?pagina={pagina}&limite={limite}"
    if q:
        url += f"&q={q}"
    if carrera_id:
        url += f"&carreraId={carrera_id}"
    try:
        return await get(url)
    except Exception:
        raise HTTPException(503, "MS2 no disponible")

# ── Top profesores por calificación ──────────────────────────
@app.get("/top-profesores", tags=["Rankings"])
async def top_profesores(
    authorization: Optional[str] = Header(None)
):
    token = authorization

    # Obtener todos los profesor_curso del MS2
    try:
        cursos_page = await get(f"{MS2_URL}/cursos?pagina=1&limite=100", token)
        cursos = cursos_page.get("data", []) if isinstance(cursos_page, dict) else []
    except Exception:
        raise HTTPException(503, "MS2 no disponible")

    # Para cada curso obtener profesores
    profesores_map = {}
    for curso in cursos[:10]:  # limitamos para no sobrecargar
        try:
            pcs = await get(f"{MS2_URL}/cursos/{curso['id']}/profesores", token)
            if isinstance(pcs, list):
                for pc in pcs:
                    pid = pc.get("profesorId")
                    if pid not in profesores_map:
                        profesores_map[pid] = {
                            "profesorId":      pid,
                            "nombre":          pc.get("profesorNombre", "—"),
                            "apellido":        pc.get("profesorApellido", "—"),
                            "foto":            pc.get("profesorFoto"),
                            "total_puntajes":  [],
                        }
                    # Calificaciones del MS3
                    cals = await get(f"{MS3_URL}/calificaciones/profesor-curso/{pc['id']}")
                    if isinstance(cals, list):
                        profesores_map[pid]["total_puntajes"].extend(
                            [c["puntaje"] for c in cals if "puntaje" in c]
                        )
        except Exception:
            continue

    resultado = []
    for pid, data in profesores_map.items():
        puntajes = data.pop("total_puntajes")
        data["total_calificaciones"] = len(puntajes)
        data["promedio"] = round(sum(puntajes) / len(puntajes), 2) if puntajes else 0
        resultado.append(data)

    resultado.sort(key=lambda x: x["promedio"], reverse=True)
    return resultado[:10]
