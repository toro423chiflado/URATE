"""
Seed de MongoDB para ms-reviews
Genera 25,000+ calificaciones fake
Correr: python seed.py
"""
import asyncio
import random
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB  = os.getenv("MONGO_DB",  "reviews_db")

# UUIDs de profesores del seed del MS1
PROFESORES = [
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
    "00000000-0000-0000-0000-000000000003",
]

COMENTARIOS = [
    "Excelente profesor, explica muy bien.",
    "Muy buen manejo del curso.",
    "Las clases son dinámicas y entretenidas.",
    "Podría mejorar la atención a los alumnos.",
    "Las evaluaciones son justas.",
    "Demasiada teoría, poca práctica.",
    "Muy exigente pero se aprende mucho.",
    "El profesor llega tarde frecuentemente.",
    "Muy buen dominio del tema.",
    "Las diapositivas son confusas.",
    "Responde bien las dudas en clase.",
    "Muy buen profesor, lo recomiendo.",
    None, None, None  # algunos sin comentario
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB]
    
    print("🧹 Limpiando colección calificaciones...")
    await db.calificaciones.drop()
    
    print("🌱 Generando 25,000 calificaciones...")
    
    # IDs de profesor_curso en MS2 (los del data.sql)
    pc_ids = list(range(1, 18))
    
    batch = []
    TOTAL = 25000
    
    for i in range(TOTAL):
        profesor_id = random.choice(PROFESORES)
        pc_id       = random.choice(pc_ids)
        puntaje     = random.choice([1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0])
        anonimo     = random.random() > 0.3
        
        doc = {
            "profesor_curso_id":  pc_id,
            "profesor_id_cache":  profesor_id,
            "estudiante_id":      None if anonimo else f"estudiante-fake-{i % 5000}",
            "puntaje":            puntaje,
            "comentario":         random.choice(COMENTARIOS),
            "anonimo":            anonimo,
            "creado_en":          datetime.utcnow() - timedelta(days=random.randint(0, 365))
        }
        batch.append(doc)
        
        if len(batch) == 500:
            await db.calificaciones.insert_many(batch)
            batch = []
            print(f"   {i+1}/{TOTAL}...")
    
    if batch:
        await db.calificaciones.insert_many(batch)
    
    # Índices para queries rápidas
    await db.calificaciones.create_index("profesor_curso_id")
    await db.calificaciones.create_index("profesor_id_cache")
    await db.calificaciones.create_index("estudiante_id")
    
    total = await db.calificaciones.count_documents({})
    print(f"\n✅ Seed completado — {total} calificaciones en MongoDB")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
