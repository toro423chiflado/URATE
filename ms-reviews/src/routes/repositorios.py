from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from datetime import datetime
import httpx, os
from src.models.repositorio import ArchivoCreate
from src.middleware.auth import verify_token
from src.database import get_db

router = APIRouter(tags=["Repositorios de Contenido"])
MS2_URL = os.getenv("MS2_URL", "http://localhost:3002")

def fmt(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.post("/", status_code=201, summary="Subir archivo al repositorio de un curso")
async def subir_archivo(
    body: ArchivoCreate,
    user: dict = Depends(verify_token)
):
    """
    Profesores y estudiantes pueden subir contenido al repositorio de un curso.
    Solo ADMIN, PROFESOR o ESTUDIANTE autenticados.
    """
    if user["rol"] not in ["ADMIN", "PROFESOR", "ESTUDIANTE"]:
        raise HTTPException(403, "Sin permiso para subir archivos")

    # Validar que el curso existe en MS2
    async with httpx.AsyncClient(timeout=5.0) as client:
        r = await client.get(f"{MS2_URL}/cursos/{body.curso_id}")
        if r.status_code != 200:
            raise HTTPException(404, f"Curso {body.curso_id} no encontrado en MS2")

    db = get_db()
    doc = {
        "nombre": body.nombre,
        "url": body.url,
        "tipo": body.tipo,
        "descripcion": body.descripcion,
        "curso_id": body.curso_id,
        "profesor_curso_id": body.profesor_curso_id,
        "subido_por": user["sub"],
        "rol_subidor": user["rol"],
        "creado_en": datetime.utcnow(),
    }
    result = await db.repositorios.insert_one(doc)
    doc["_id"] = result.inserted_id
    return fmt(doc)

@router.get("/curso/{curso_id}", summary="Listar contenido del repositorio de un curso")
async def listar_por_curso(
    curso_id: int,
    tipo: str = Query(None, description="Filtrar por tipo: documento, imagen, video, otro"),
    pagina: int = Query(1, ge=1),
    limite: int = Query(20, ge=1, le=100)
):
    """Lista todos los archivos subidos en el repositorio de un curso."""
    db = get_db()
    filtro = {"curso_id": curso_id}
    if tipo:
        filtro["tipo"] = tipo

    skip = (pagina - 1) * limite
    total = await db.repositorios.count_documents(filtro)
    docs = await db.repositorios.find(filtro).skip(skip).limit(limite).sort("creado_en", -1).to_list(limite)
    return {
        "data": [fmt(d) for d in docs],
        "meta": {"total": total, "pagina": pagina, "limite": limite, "paginas": -(-total // limite)}
    }

@router.get("/{id}", summary="Obtener un archivo del repositorio")
async def obtener_archivo(id: str):
    db = get_db()
    doc = await db.repositorios.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Archivo no encontrado")
    return fmt(doc)

@router.delete("/{id}", summary="Eliminar archivo del repositorio")
async def eliminar_archivo(id: str, user: dict = Depends(verify_token)):
    """Admin puede eliminar cualquier archivo. El dueño puede eliminar el suyo."""
    db = get_db()
    doc = await db.repositorios.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Archivo no encontrado")
    if user["rol"] != "ADMIN" and doc["subido_por"] != user["sub"]:
        raise HTTPException(403, "Sin permiso para eliminar este archivo")
    await db.repositorios.delete_one({"_id": ObjectId(id)})
    return {"mensaje": "Archivo eliminado del repositorio"}

@router.get("/stats/curso/{curso_id}", summary="Estadísticas del repositorio de un curso")
async def stats_curso(curso_id: int):
    db = get_db()
    pipeline = [
        {"$match": {"curso_id": curso_id}},
        {"$group": {
            "_id": "$tipo",
            "cantidad": {"$sum": 1}
        }}
    ]
    result = await db.repositorios.aggregate(pipeline).to_list(10)
    total = await db.repositorios.count_documents({"curso_id": curso_id})
    return {
        "curso_id": curso_id,
        "total_archivos": total,
        "por_tipo": {r["_id"]: r["cantidad"] for r in result}
    }
