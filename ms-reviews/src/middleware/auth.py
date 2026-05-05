from fastapi import HTTPException, Header
import httpx, os

MS1_URL = os.getenv("MS1_URL", "http://localhost:3001")

async def verify_token(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    token = authorization.split(" ")[1]
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(
                f"{MS1_URL}/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Token expirado o inválido")
        return r.json()
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="MS1 no disponible")

async def verify_estudiante(user: dict = Header(...)) -> dict:
    if user.get("rol") not in ["ESTUDIANTE", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Solo estudiantes pueden calificar")
    return user
