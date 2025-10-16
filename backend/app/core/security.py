# [#] ProofBench Backend - API Security
# API key authentication for endpoint protection

from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from app.core.config import settings


# [#] API Key Header Dependency
api_key_header_scheme = APIKeyHeader(
    name=settings.API_KEY_HEADER,
    auto_error=True,
    description="API key for authentication"
)


async def api_key_auth(api_key: str = Security(api_key_header_scheme)) -> str:
    """
    FastAPI dependency for API key authentication.

    Args:
        api_key: API key from request header

    Returns:
        str: Validated API key

    Raises:
        HTTPException: 403 Forbidden if API key is invalid

    Usage in endpoints:
        @router.get("/protected")
        async def protected_endpoint(api_key: str = Depends(api_key_auth)):
            # This endpoint requires valid API key
            pass
    """
    if api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return api_key


# [T] Optional: Future enhancements for JWT-based authentication

# from datetime import datetime, timedelta
# from jose import JWTError, jwt
# from passlib.context import CryptContext
#
# SECRET_KEY = "your-secret-key-here"
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30
#
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#
# def create_access_token(data: dict) -> str:
#     """Create JWT access token"""
#     to_encode = data.copy()
#     expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     return encoded_jwt
#
# def verify_token(token: str) -> dict:
#     """Verify and decode JWT token"""
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Could not validate credentials"
#         )
