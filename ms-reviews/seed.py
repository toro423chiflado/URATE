"""
Seed script: inserta 20,000+ calificaciones y archivos de repositorio ficticios en MongoDB.
Ejecutar: python seed.py
"""
import asyncio, random, os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB  = os.getenv("MONGO_DB",  "reviews_db")

COMENTARIOS = [
    "Excelente profesor, explica muy claro.",
    "Buen dominio del tema.",
    "Las clases son dinámicas y prácticas.",
    "Podría mejorar el feedback.",
    "Muy exigente pero justo.",
    "Recomienda recursos útiles.",
    "Clases un poco aburridas.",
    "Muy puntual y organizado.",
    "Se nota que domina el tema.",
    "Buena predisposición para resolver dudas.",
]

NOMBRES_ARCHIVOS = [
    "Semana1_Intro.pdf", "Practica1.docx", "Semana2_Teoria.pdf",
    "Lab1_Guia.pdf", "Ejercicios.xlsx", "Diagrama_ER.png",
    "Proyecto_Final.pdf", "Notas_Clase.pdf", "Recurso_Extra.pdf",
    "Evaluacion1.docx",
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB]

    # Calificaciones
    if await db.calificaciones.count_documents({}) < 1000:
        print("🌱 Insertando 20,000 calificaciones...")
        batch = []
        for i in range(20000):
            pc_id = random.randint(1, 100)
            batch.append({
                "profesor_curso_id": pc_id,
                "estudiante_id": f"student-{random.randint(1, 500):04d}",
                "puntaje": round(random.uniform(1, 5) * 2) / 2,
                "comentario": random.choice(COMENTARIOS) if random.random() > 0.3 else None,
                "anonimo": random.random() > 0.5,
                "profesor_id_cache": f"prof-{random.randint(1, 30):03d}",
                "creado_en": datetime.utcnow() - timedelta(days=random.randint(0, 365)),
                "actualizado_en": None,
            })
            if len(batch) == 1000:
                await db.calificaciones.insert_many(batch)
                batch = []
                print(f"  ...{i+1}/20000")
        if batch:
            await db.calificaciones.insert_many(batch)
        print("✅ Calificaciones insertadas")
    else:
        print("⏭  Calificaciones ya existen")

    # Repositorios
    if await db.repositorios.count_documents({}) < 1000:
        print("🌱 Insertando 5,000 archivos de repositorio...")
        tipos = ["documento", "imagen", "video", "otro"]
        roles = ["PROFESOR", "ESTUDIANTE"]
        batch = []
        for i in range(5000):
            batch.append({
                "nombre": random.choice(NOMBRES_ARCHIVOS),
                "url": f"https://storage.example.com/curso-{random.randint(1,50)}/{i}.pdf",
                "tipo": random.choice(tipos),
                "descripcion": f"Material de clase semana {random.randint(1,16)}",
                "curso_id": random.randint(1, 50),
                "profesor_curso_id": random.randint(1, 100) if random.random() > 0.4 else None,
                "subido_por": f"user-{random.randint(1, 300):04d}",
                "rol_subidor": random.choice(roles),
                "creado_en": datetime.utcnow() - timedelta(days=random.randint(0, 180)),
            })
            if len(batch) == 500:
                await db.repositorios.insert_many(batch)
                batch = []
        if batch:
            await db.repositorios.insert_many(batch)
        print("✅ Repositorios insertados")
    else:
        print("⏭  Repositorios ya existen")

    await db.calificaciones.create_index([("profesor_curso_id", 1)])
    await db.calificaciones.create_index([("estudiante_id", 1)])
    await db.repositorios.create_index([("curso_id", 1)])
    print("✅ Índices creados")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
