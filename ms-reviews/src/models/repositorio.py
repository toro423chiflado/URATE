from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class ArchivoCreate(BaseModel):
    nombre: str = Field(..., max_length=200, description="Nombre del archivo")
    url: str = Field(..., description="URL del archivo (S3, Drive, etc.)")
    tipo: Literal["documento", "imagen", "video", "otro"] = Field(default="documento")
    descripcion: Optional[str] = Field(None, max_length=500)
    curso_id: int = Field(..., description="ID del curso en MS2")
    profesor_curso_id: Optional[int] = Field(None, description="ID del ProfesorCurso si aplica")

class ArchivoResponse(BaseModel):
    id: str
    nombre: str
    url: str
    tipo: str
    descripcion: Optional[str]
    curso_id: int
    profesor_curso_id: Optional[int]
    subido_por: str
    rol_subidor: str
    creado_en: datetime
