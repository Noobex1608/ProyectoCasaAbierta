"""
Smart Classroom AI - Health Check Router
System health and status endpoints
"""
from fastapi import APIRouter, status
from datetime import datetime
from app.core.schemas import BaseResponse, HealthCheckResponse
from app.core.config import settings
from app.db.supabase_client import SupabaseClient
from app.core.logger import logger

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Check API health and service availability"
)
async def health_check():
    """
    Health check endpoint for monitoring and load balancers
    
    Returns system status and service availability.
    This endpoint responds IMMEDIATELY to allow Cloud Run to start serving traffic
    while models are still loading in the background.
    """
    # Health check responde inmediatamente (NO bloquea esperando modelos)
    # Esto permite que Cloud Run considere el contenedor "listo" rápidamente
    services = {
        "api": True,
        "database": False,
        "deepface": False
    }
    
    # Verificar base de datos (rápido, no bloqueante)
    try:
        db_status = await SupabaseClient.test_connection()
        services["database"] = db_status
    except Exception as e:
        logger.debug(f"Database health check failed: {str(e)}")
        # No fallar si la BD no responde inmediatamente
    
    # Verificar DeepFace (no bloqueante - solo verifica si está disponible)
    try:
        from deepface import DeepFace
        # Solo verificar importación, no cargar modelos
        services["deepface"] = True
    except Exception:
        # Los modelos pueden estar cargando aún - no es crítico para el health check
        services["deepface"] = False
    
    # Si la API responde, consideramos el servicio "healthy"
    # Los modelos pueden estar cargando en background
    overall_status = "healthy" if services["api"] else "unhealthy"
    
    return HealthCheckResponse(
        status=overall_status,
        version=settings.APP_VERSION,
        timestamp=datetime.utcnow(),
        services=services
    )


@router.get(
    "/",
    response_model=BaseResponse,
    summary="API root",
    description="Get API information"
)
async def root():
    """API root endpoint with basic information"""
    return BaseResponse(
        success=True,
        message=f"Welcome to {settings.APP_NAME}",
        data={
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "docs_url": f"{settings.API_PREFIX}/docs",
            "health_url": "/health"
        }
    )


@router.get(
    "/info",
    response_model=BaseResponse,
    summary="System information",
    description="Get detailed system configuration and capabilities"
)
async def system_info():
    """Get system configuration information"""
    return BaseResponse(
        success=True,
        message="System information",
        data={
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "features": {
                "emotion_analysis": settings.ENABLE_EMOTION_ANALYSIS,
                "multi_face_detection": settings.ENABLE_MULTI_FACE_DETECTION,
                "auto_reports": settings.ENABLE_AUTO_REPORTS
            },
            "models": {
                "face_recognition": settings.FACE_RECOGNITION_MODEL,
                "face_detector": settings.FACE_DETECTOR_BACKEND,
                "distance_metric": settings.DISTANCE_METRIC
            },
            "thresholds": {
                "face_match": settings.FACE_MATCH_THRESHOLD,
                "emotion_confidence": settings.EMOTION_CONFIDENCE_THRESHOLD,
                "min_face_size": settings.MIN_FACE_SIZE
            }
        }
    )
