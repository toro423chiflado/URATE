from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class CalificacionCreate(BaseModel):
    profesor_curso_id: int = Field(..., description="ID del ProfesorCurso en MS2")
    estudiante_id: str = Field(..., description="UUID del estudiante en MS1")
    puntaje: float = Field(..., ge=1.0, le=5.0, description="Puntaje 1.0 a 5.0")
    comentario: Optional[str] = Field(None, max_length=500)
    anonimo: bool = Field(default=True)

    @field_validator("puntaje")
    @classmethod
    def redondear_puntaje(cls, v):
        return round(v * 2) / 2  # redondea a 0.5

class CalificacionResponse(BaseModel):
    id: str
    profesor_curso_id: int
    estudiante_id: Optional[str]  # null si anonimo
    puntaje: float
    comentario: Optional[str]
    anonimo: bool
    creado_en: datetime

class ResumenProfesor(BaseModel):
    profesor_id: str
    total_calificaciones: int
    promedio: float
    distribucion: dict  # {1: 5, 2: 10, ...}
