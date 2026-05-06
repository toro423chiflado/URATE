from fastapi import APIRouter, Depends, HTTPException, Header
from bson import ObjectId
from datetime import datetime
import httpx, os
from src.models.calificacion import CalificacionCreate, CalificacionUpdate
from src.middleware.auth import verify_token
from src.database import get_db

router = APIRouter(tags=["Calificaciones (Reseñas)"])
MS2_URL = os.getenv("MS2_URL", "http://localhost:3002")

def fmt(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.post("/", status_code=201, summary="Estudiante crea reseña")
async def crear_calificacion(
    body: CalificacionCreate,
    user: dict = Depends(verify_token)
):
    """Solo ESTUDIANTE o ADMIN pueden crear reseñas."""
    if user["rol"] not in ["ESTUDIANTE", "ADMIN"]:
        raise HTTPException(403, "Solo estudiantes pueden calificar")

    db = get_db()
    async with httpx.AsyncClient(timeout=5.0) as client:
        r = await client.get(f"{MS2_URL}/profesor-curso/{body.profesor_curso_id}/existe")
        if r.status_code != 200 or not r.json().get("existe"):
            raise HTTPException(404, f"ProfesorCurso {body.profesor_curso_id} no existe en MS2")

    existe = await db.calificaciones.find_one({
        "profesor_curso_id": body.profesor_curso_id,
        "estudiante_id": user["sub"]
    })
    if existe:
        raise HTTPException(409, "Ya calificaste a este profesor en este curso")

    doc = {
        "profesor_curso_id": body.profesor_curso_id,
        "estudiante_id": user["sub"],
        "puntaje": body.puntaje,
        "comentario": body.comentario,
        "anonimo": body.anonimo,
        "creado_en": datetime.utcnow(),
        "actualizado_en": None,
    }
    result = await db.calificaciones.insert_one(doc)
    doc["_id"] = result.inserted_id
    return fmt(doc)

@router.put("/{id}", summary="Estudiante edita su reseña")
async def editar_calificacion(
    id: str,
    body: CalificacionUpdate,
    user: dict = Depends(verify_token)
):
    """El estudiante puede editar su propia reseña. Admin puede editar cualquiera."""
    db = get_db()
    cal = await db.calificaciones.find_one({"_id": ObjectId(id)})
    if not cal:
        raise HTTPException(404, "Calificación no encontrada")

    if user["rol"] != "ADMIN" and cal["estudiante_id"] != user["sub"]:
        raise HTTPException(403, "Solo puedes editar tus propias reseñas")

    update_data = {"actualizado_en": datetime.utcnow()}
    if body.puntaje is not None:
        update_data["puntaje"] = body.puntaje
    if body.comentario is not None:
        update_data["comentario"] = body.comentario
    if body.anonimo is not None:
        update_data["anonimo"] = body.anonimo

    await db.calificaciones.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    cal.update(update_data)
    cal["_id"] = ObjectId(id)
    return fmt(cal)

@router.delete("/{id}", summary="Admin elimina reseña")
async def eliminar(id: str, user: dict = Depends(verify_token)):
    """Solo ADMIN puede eliminar reseñas."""
    if user["rol"] != "ADMIN":
        raise HTTPException(403, "Solo admins pueden eliminar reseñas")
    db = get_db()
    result = await db.calificaciones.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Calificación no encontrada")
    return {"mensaje": "Reseña eliminada"}

@router.get("/profesor-curso/{pc_id}", summary="Listar reseñas de un ProfesorCurso")
async def listar_por_profesor_curso(pc_id: int):
    db = get_db()
    docs = await db.calificaciones.find({"profesor_curso_id": pc_id}).to_list(500)
    return [fmt(d) for d in docs]

@router.get("/resumen/profesor/{profesor_id}", summary="Resumen de calificaciones de un profesor")
async def resumen_profesor(profesor_id: str):
    db = get_db()
    pipeline = [
        {"$match": {"profesor_id_cache": profesor_id}},
        {"$group": {
            "_id": "$profesor_id_cache",
            "total": {"$sum": 1},
            "promedio": {"$avg": "$puntaje"},
            "dist1": {"$sum": {"$cond": [{"$eq": ["$puntaje", 1]}, 1, 0]}},
            "dist2": {"$sum": {"$cond": [{"$eq": ["$puntaje", 2]}, 1, 0]}},
            "dist3": {"$sum": {"$cond": [{"$eq": ["$puntaje", 3]}, 1, 0]}},
            "dist4": {"$sum": {"$cond": [{"$eq": ["$puntaje", 4]}, 1, 0]}},
            "dist5": {"$sum": {"$cond": [{"$eq": ["$puntaje", 5]}, 1, 0]}},
        }}
    ]
    result = await db.calificaciones.aggregate(pipeline).to_list(1)
    if not result:
        return {"profesor_id": profesor_id, "total": 0, "promedio": 0, "distribucion": {}}
    r = result[0]
    return {
        "profesor_id": profesor_id,
        "total": r["total"],
        "promedio": round(r["promedio"], 2),
        "distribucion": {1: r["dist1"], 2: r["dist2"], 3: r["dist3"], 4: r["dist4"], 5: r["dist5"]}
    }
