from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import httpx, os
from datetime import datetime
from typing import Optional

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 MS4 ms-content iniciado — sin BD, agrega MS1+MS2+MS3")
    yield

app = FastAPI(
    title="MS4 — Content (Orquestador)",
    description="""
Microservicio orquestador sin BD propia.
Agrega datos de MS1 (Usuarios), MS2 (Académico) y MS3 (Reviews+Repos).

**Funcionalidades:**
- Perfil completo de profesor (datos + cursos + calificaciones)
- Resumen de curso (datos + profesores + calificaciones + repositorio)
- Búsqueda de cursos con filtros
- Top profesores por calificación
- Listar carreras y cursos
""",
    version="2.0.0",
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
    return {"status": "ok", "service": "ms-content", "version": "2.0.0", "timestamp": datetime.utcnow()}

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

# ── Perfil completo de profesor ───────────────────────────────
@app.get("/perfil-profesor/{profesor_id}", tags=["Perfiles"])
async def perfil_profesor(profesor_id: str, authorization: Optional[str] = Header(None)):
    """Agrega: usuario MS1 + cursos MS2 + calificaciones MS3"""
    token = authorization
    try:
        usuario = await get(f"{MS1_URL}/usuarios/{profesor_id}", token)
        if not usuario:
            raise HTTPException(404, f"Profesor {profesor_id} no encontrado")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "MS1 no disponible")

    cursos = []
    try:
        cursos = await get(f"{MS2_URL}/profesores/{profesor_id}/cursos", token) or []
    except Exception:
        pass

    resumen = {"total": 0, "promedio": 0, "distribucion": {}}
    try:
        r = await get(f"{MS3_URL}/calificaciones/resumen/profesor/{profesor_id}")
        if r:
            resumen = r
    except Exception:
        pass

    return {
        "profesor": {
            "id": usuario.get("id"),
            "nombre": usuario.get("nombre"),
            "apellido": usuario.get("apellido"),
            "correo": usuario.get("correo"),
            "foto": usuario.get("foto"),
            "github": usuario.get("github"),
            "linkedin": usuario.get("linkedin"),
        },
        "cursos": cursos,
        "calificaciones": resumen,
    }

# ── Resumen completo de un curso ──────────────────────────────
@app.get("/resumen-curso/{curso_id}", tags=["Cursos"])
async def resumen_curso(curso_id: int, authorization: Optional[str] = Header(None)):
    """Agrega: curso MS2 + profesores con calificaciones MS3 + repositorio MS3"""
    token = authorization
    try:
        curso = await get(f"{MS2_URL}/cursos/{curso_id}", token)
        if not curso:
            raise HTTPException(404, f"Curso {curso_id} no encontrado")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "MS2 no disponible")

    profesores = []
    try:
        profesores = await get(f"{MS2_URL}/cursos/{curso_id}/profesores", token) or []
    except Exception:
        pass

    for pc in profesores:
        try:
            cals = await get(f"{MS3_URL}/calificaciones/profesor-curso/{pc.get('id')}")
            if isinstance(cals, list) and cals:
                puntajes = [c["puntaje"] for c in cals if "puntaje" in c]
                pc["calificaciones"] = {"total": len(puntajes), "promedio": round(sum(puntajes)/len(puntajes), 2) if puntajes else 0}
            else:
                pc["calificaciones"] = {"total": 0, "promedio": 0}
        except Exception:
            pc["calificaciones"] = {"total": 0, "promedio": 0}

    repositorio = {"total_archivos": 0, "por_tipo": {}}
    try:
        stats = await get(f"{MS3_URL}/repositorios/stats/curso/{curso_id}")
        if stats:
            repositorio = stats
    except Exception:
        pass

    return {"curso": curso, "profesores": profesores, "repositorio": repositorio}

# ── Listar carreras ───────────────────────────────────────────
@app.get("/carreras", tags=["Exploración"])
async def listar_carreras():
    try:
        return await get(f"{MS2_URL}/carreras")
    except Exception:
        raise HTTPException(503, "MS2 no disponible")

# ── Buscar cursos ─────────────────────────────────────────────
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
async def top_profesores(authorization: Optional[str] = Header(None)):
    token = authorization
    try:
        cursos_page = await get(f"{MS2_URL}/cursos?pagina=1&limite=100", token)
        cursos = cursos_page.get("data", []) if isinstance(cursos_page, dict) else []
    except Exception:
        raise HTTPException(503, "MS2 no disponible")

    profesores_map = {}
    for curso in cursos[:15]:
        try:
            pcs = await get(f"{MS2_URL}/cursos/{curso['id']}/profesores", token)
            if isinstance(pcs, list):
                for pc in pcs:
                    pid = pc.get("profesorId")
                    if pid not in profesores_map:
                        profesores_map[pid] = {
                            "profesorId": pid,
                            "nombre": pc.get("profesorNombre", "—"),
                            "apellido": pc.get("profesorApellido", "—"),
                            "foto": pc.get("profesorFoto"),
                            "total_puntajes": [],
                        }
                    cals = await get(f"{MS3_URL}/calificaciones/profesor-curso/{pc['id']}")
                    if isinstance(cals, list):
                        profesores_map[pid]["total_puntajes"].extend([c["puntaje"] for c in cals if "puntaje" in c])
        except Exception:
            continue

    resultado = []
    for pid, data in profesores_map.items():
        puntajes = data.pop("total_puntajes")
        data["total_calificaciones"] = len(puntajes)
        data["promedio"] = round(sum(puntajes)/len(puntajes), 2) if puntajes else 0
        resultado.append(data)

    resultado.sort(key=lambda x: x["promedio"], reverse=True)
    return resultado[:10]

# ── Repositorio de un curso (proxy MS3) ──────────────────────
@app.get("/repositorio/curso/{curso_id}", tags=["Repositorios"])
async def repositorio_curso(
    curso_id: int,
    tipo: Optional[str] = None,
    pagina: int = 1,
    limite: int = 20
):
    """Lista el repositorio de archivos de un curso (proxy de MS3)."""
    url = f"{MS3_URL}/repositorios/curso/{curso_id}?pagina={pagina}&limite={limite}"
    if tipo:
        url += f"&tipo={tipo}"
    try:
        return await get(url)
    except Exception:
        raise HTTPException(503, "MS3 no disponible")
