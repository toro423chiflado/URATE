from fastapi import Header, HTTPException
import httpx, os, json
from jose import jwt, JWTError
from jose.utils import base64url_decode
import base64

MS1_URL = os.getenv("MS1_URL", "http://localhost:3001")

_jwks_cache = None

async def _get_public_key():
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    async with httpx.AsyncClient(timeout=5.0) as client:
        r = await client.get(f"{MS1_URL}/.well-known/jwks.json")
        r.raise_for_status()
        _jwks_cache = r.json()
    return _jwks_cache

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Token requerido")
    token = authorization.split(" ", 1)[1]
    try:
        jwks = await _get_public_key()
        key = jwks["keys"][0]
        # Build PEM from JWK
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.backends import default_backend
        from cryptography.hazmat.primitives import serialization
        import base64, struct

        def b64d(s):
            s = s.replace("-", "+").replace("_", "/")
            return base64.b64decode(s + "==")

        n = int.from_bytes(b64d(key["n"]), "big")
        e = int.from_bytes(b64d(key["e"]), "big")
        pub = rsa.RSAPublicNumbers(e, n).public_key(default_backend())
        pem = pub.public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)

        payload = jwt.decode(token, pem, algorithms=["RS256"])
        return payload
    except Exception as ex:
        raise HTTPException(401, f"Token inválido: {ex}")
