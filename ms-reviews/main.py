from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.database import connect_db, close_db
from src.routes import calificaciones, health, repositorios

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    print("🚀 MS3 ms-reviews iniciado — MongoDB")
    yield
    await close_db()

app = FastAPI(
    title="MS3 — Reviews & Repositories",
    description="""
Microservicio de Reseñas y Repositorios. Usa MongoDB.

**Funcionalidades:**
- Estudiantes crean/editan reseñas de profesores
- Admin elimina reseñas
- Profesores y estudiantes suben contenido a repositorios de cursos
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

app.include_router(health.router)
app.include_router(calificaciones.router, prefix="/calificaciones")
app.include_router(repositorios.router, prefix="/repositorios")
