"""
Script de prueba para el endpoint de enrollment
Genera una imagen de prueba y hace una petición al endpoint
"""
import requests
import base64
import json
from PIL import Image, ImageDraw, ImageFont
import io
import sys


def create_test_face_image():
    """
    Crea una imagen de prueba con un rostro simple
    NOTA: Para pruebas reales, usa una foto real de un rostro
    """
    # Crear imagen de 640x480 con fondo blanco
    img = Image.new('RGB', (640, 480), color='white')
    draw = ImageDraw.Draw(img)
    
    # Dibujar un "rostro" simple (círculo + ojos + boca)
    # Cara
    draw.ellipse([170, 140, 470, 440], fill='#FFE4C4', outline='black', width=3)
    
    # Ojos
    draw.ellipse([240, 220, 290, 270], fill='white', outline='black', width=2)
    draw.ellipse([255, 235, 275, 255], fill='black')
    
    draw.ellipse([350, 220, 400, 270], fill='white', outline='black', width=2)
    draw.ellipse([365, 235, 385, 255], fill='black')
    
    # Nariz
    draw.line([320, 280, 320, 340], fill='black', width=2)
    draw.line([320, 340, 340, 360], fill='black', width=2)
    
    # Boca
    draw.arc([260, 320, 380, 400], start=0, end=180, fill='black', width=3)
    
    # Texto de advertencia
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    draw.text((120, 20), "IMAGEN DE PRUEBA - USA FOTO REAL", fill='red', font=font)
    
    return img


def image_to_base64(image):
    """Convierte una imagen PIL a Base64"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=95)
    img_bytes = buffered.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode()
    return f"data:image/jpeg;base64,{img_base64}"


def test_enrollment_endpoint(base_url="http://localhost:8000", use_test_image=True):
    """
    Prueba el endpoint de enrollment
    
    Args:
        base_url: URL base del servidor
        use_test_image: Si es True, usa imagen generada; si es False, debe haber un archivo 'test_face.jpg'
    """
    print("=" * 80)
    print("🧪 TEST DEL ENDPOINT DE ENROLLMENT")
    print("=" * 80)
    
    # Paso 1: Preparar la imagen
    print("\n📸 Paso 1: Preparando imagen...")
    
    if use_test_image:
        print("⚠️  Usando imagen de prueba generada (puede fallar en detección de rostro)")
        print("💡 Para pruebas reales, coloca una foto real en 'test_face.jpg'")
        image = create_test_face_image()
        # Guardar para inspección
        image.save("test_generated_face.jpg")
        print("✅ Imagen de prueba guardada como 'test_generated_face.jpg'")
    else:
        try:
            image = Image.open("test_face.jpg")
            print("✅ Imagen cargada desde 'test_face.jpg'")
        except FileNotFoundError:
            print("❌ No se encontró 'test_face.jpg'")
            print("💡 Coloca una foto de un rostro con ese nombre o usa use_test_image=True")
            return
    
    # Convertir a Base64
    image_base64 = image_to_base64(image)
    print(f"✅ Imagen convertida a Base64 ({len(image_base64)} caracteres)")
    
    # Paso 2: Preparar datos de prueba
    print("\n📝 Paso 2: Preparando datos de prueba...")
    
    payload = {
        "student_id": "TEST_001",
        "full_name": "Juan Pérez Prueba",
        "image_base64": image_base64
    }
    
    print(f"   Student ID: {payload['student_id']}")
    print(f"   Nombre: {payload['full_name']}")
    print(f"   Imagen Base64: {image_base64[:50]}...")
    
    # Paso 3: Hacer petición al endpoint
    print("\n🚀 Paso 3: Enviando petición al servidor...")
    print(f"   URL: {base_url}/api/enrollment/enroll-v2")
    
    try:
        response = requests.post(
            f"{base_url}/api/enrollment/enroll-v2",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        
        # Paso 4: Mostrar respuesta
        print("\n📊 Paso 4: Respuesta del servidor:")
        print("-" * 80)
        
        try:
            response_data = response.json()
            print(json.dumps(response_data, indent=2, ensure_ascii=False))
        except:
            print(response.text)
        
        print("-" * 80)
        
        # Paso 5: Análisis del resultado
        print("\n🔍 Paso 5: Análisis del resultado:")
        
        if response.status_code == 201:
            print("✅ ÉXITO: Estudiante registrado correctamente")
            print(f"   ID: {response_data.get('student_id')}")
            print(f"   Mensaje: {response_data.get('message')}")
        elif response.status_code == 400:
            print("⚠️  ERROR DE VALIDACIÓN:")
            print(f"   {response_data.get('detail', 'Error desconocido')}")
            print("\n💡 Sugerencias:")
            print("   - Verifica que la imagen contenga un rostro frontal")
            print("   - Asegúrate de que la iluminación sea buena")
            print("   - Usa una foto real en lugar de la imagen generada")
        elif response.status_code == 500:
            print("❌ ERROR DEL SERVIDOR:")
            print(f"   {response_data.get('detail', 'Error interno')}")
            print("\n💡 Posibles causas:")
            print("   - Base de datos no configurada")
            print("   - ID duplicado")
            print("   - Error en DeepFace")
        else:
            print(f"⚠️  CÓDIGO DE ESTADO INESPERADO: {response.status_code}")
        
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: No se pudo conectar al servidor")
        print(f"   Verifica que el servidor esté corriendo en {base_url}")
        print("\n💡 Para iniciar el servidor:")
        print("   cd Servidor")
        print("   python -m uvicorn app.main:app --reload")
    except requests.exceptions.Timeout:
        print("❌ ERROR: Timeout (el servidor tardó más de 30 segundos)")
        print("   Esto puede ser normal en la primera petición (cold start)")
    except Exception as e:
        print(f"❌ ERROR INESPERADO: {str(e)}")
    
    print("\n" + "=" * 80)
    print("🏁 TEST COMPLETADO")
    print("=" * 80)


def test_with_real_image(image_path):
    """
    Prueba el endpoint con una imagen real
    
    Args:
        image_path: Ruta a la imagen real
    """
    try:
        image = Image.open(image_path)
        print(f"✅ Imagen cargada: {image_path}")
        print(f"   Tamaño: {image.size}")
        print(f"   Formato: {image.format}")
        
        # Convertir a Base64
        image_base64 = image_to_base64(image)
        
        # Datos de prueba
        payload = {
            "student_id": "REAL_001",
            "full_name": "Estudiante Real",
            "image_base64": image_base64
        }
        
        # Hacer petición
        response = requests.post(
            "http://localhost:8000/api/enrollment/enroll-v2",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\n📊 Respuesta:")
        print(f"   Status: {response.status_code}")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    print("🎯 Script de Prueba del Endpoint de Enrollment\n")
    
    # Opción 1: Prueba básica con imagen generada
    print("Ejecutando prueba con imagen generada...")
    print("⚠️  NOTA: DeepFace probablemente rechazará la imagen porque no es un rostro real\n")
    test_enrollment_endpoint(use_test_image=True)
    
    # Opción 2: Prueba con imagen real (descomentar si tienes una)
    # print("\n\n")
    # print("Para probar con una imagen real:")
    # print("1. Coloca una foto de un rostro en 'test_face.jpg'")
    # print("2. Ejecuta: test_enrollment_endpoint(use_test_image=False)")
    # print("   O ejecuta: test_with_real_image('ruta/a/tu/imagen.jpg')")
    
    print("\n\n💡 INSTRUCCIONES PARA PRUEBAS REALES:")
    print("=" * 80)
    print("1. Consigue una foto de un rostro (puede ser tuya)")
    print("2. Guárdala como 'test_face.jpg' en este directorio")
    print("3. Ejecuta el script de nuevo con:")
    print("   python test_enrollment.py")
    print("4. O modifica el código para usar tu imagen")
    print("=" * 80)
