<div align="center">

# 🎓 Smart Classroom AI

### Plataforma de Asistencia Inteligente con Reconocimiento Facial y Análisis de Emociones

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.20-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Graduation%20Cap.png" alt="Graduation Cap" width="150" />

**Sistema inteligente para gestión de asistencia estudiantil mediante IA**

[Características](#-características) •
[Demo](#-demo) •
[Instalación](#-instalación) •
[Uso](#-uso) •
[API](#-api) •
[Tecnologías](#-tecnologías)

</div>

---

## 📋 Descripción

**Smart Classroom AI** es una plataforma integral diseñada para revolucionar la gestión de asistencia en instituciones educativas. Utiliza tecnología de reconocimiento facial de última generación y análisis de emociones en tiempo real para proporcionar una experiencia automatizada y enriquecida tanto para profesores como estudiantes.

### 🎯 Problema que Resuelve

- ⏰ Elimina el tiempo perdido en pasar lista manualmente
- 📊 Proporciona datos objetivos sobre el engagement estudiantil
- 🔒 Garantiza la autenticidad de la asistencia
- 📈 Genera reportes detallados automáticamente

---

## ✨ Características

<table>
<tr>
<td width="50%">

### 👤 Reconocimiento Facial
- Registro de estudiantes con foto
- Verificación de identidad en tiempo real
- Alta precisión con DeepFace
- Detección de múltiples rostros

</td>
<td width="50%">

### 😊 Análisis de Emociones
- Detección de 7 emociones básicas
- Monitoreo del engagement en clase
- Histórico emocional por sesión
- Alertas de bajo engagement

</td>
</tr>
<tr>
<td width="50%">

### 📊 Dashboard Interactivo
- Vista general de materias
- Estadísticas en tiempo real
- Gráficos de asistencia
- Reportes exportables

</td>
<td width="50%">

### 🔐 Gestión de Usuarios
- Rol de Administrador (Secretaría)
- Rol de Profesor
- Autenticación segura con Supabase
- Gestión de materias y estudiantes

</td>
</tr>
</table>

---

##  Instalación

### Requisitos Previos

- **Python** 3.11 o superior
- **Node.js** 18 o superior
- **Git**

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/smart-classroom-ai.git
cd smart-classroom-ai
```

### 2️⃣ Configurar el Backend

```bash
# Navegar al servidor
cd Servidor

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3️⃣ Configurar el Frontend

```bash
# Navegar al frontend
cd Vue-Front

# Instalar dependencias
npm install
```

### 4️⃣ Variables de Entorno

Crea un archivo `.env` en la carpeta `Servidor/`:

```env
# Supabase Configuration
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_KEY=tu_service_role_key

# App Configuration
DEBUG=True
ENVIRONMENT=development
```

---

## 💻 Uso

### Iniciar el Backend

```bash
cd Servidor
.\venv\Scripts\Activate.ps1  # Windows
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### Iniciar el Frontend

```bash
cd Vue-Front
npm run dev
```

### Acceder a la Aplicación

| Servicio | URL |
|----------|-----|
| 🌐 Frontend Vue | http://localhost:5173 |
| 🔧 Backend API | http://localhost:8080 |
| 📚 Documentación API | http://localhost:8080/docs |
| ❤️ Health Check | http://localhost:8080/health |

### Credenciales de Prueba

| Rol | Email | Descripción |
|-----|-------|-------------|
| 👩‍💼 Admin | `secretaria@uleam.com` | Acceso completo al sistema |
| 👨‍🏫 Profesor | Cualquier otro email | Gestión de sus materias |

---

## 📡 API

### Endpoints Principales

```
📁 /api/v1
├── 👥 /enrollment
│   ├── POST /enroll-v2      # Registrar estudiante
│   └── GET  /students       # Listar estudiantes
│
├── ✅ /attendance
│   ├── POST /verify         # Verificar asistencia
│   └── GET  /report/{id}    # Reporte de clase
│
├── 😊 /emotions
│   ├── POST /analyze        # Analizar emoción
│   └── GET  /summary/{id}   # Resumen emocional
│
├── 🏫 /classes
│   ├── POST /create         # Crear sesión
│   └── GET  /list           # Listar sesiones
│
└── ❤️ /health               # Estado del servidor
```

### Ejemplo de Uso

```python
import requests

# Verificar asistencia con imagen
response = requests.post(
    "http://localhost:8080/api/v1/attendance/verify",
    json={
        "class_id": "uuid-de-la-clase",
        "image_base64": "base64_de_la_imagen..."
    }
)

print(response.json())
# {
#   "success": true,
#   "data": {
#     "student_id": "2024001",
#     "student_name": "Juan Pérez",
#     "confidence": 0.95,
#     "timestamp": "2026-01-13T10:30:00"
#   }
# }
```

---

## 🛠️ Tecnologías

<div align="center">

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white)

### Frontend
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

### Base de Datos & Cloud
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

</div>

### Stack Completo

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Frontend** | Vue 3 + Vite | Interfaz de usuario reactiva |
| **Estilos** | Tailwind CSS + Element Plus | Diseño moderno y componentes |
| **Backend** | FastAPI | API REST de alto rendimiento |
| **IA/ML** | DeepFace + TensorFlow | Reconocimiento facial y emociones |
| **Database** | Supabase (PostgreSQL) | Almacenamiento y autenticación |
| **Storage** | Supabase Storage | Fotos de estudiantes |

---

## 📁 Estructura del Proyecto

```
📦 ProyectoCasaAbierta
├── 📂 Servidor/                 # Backend FastAPI
│   ├── 📂 app/
│   │   ├── 📂 api/              # Endpoints REST
│   │   ├── 📂 core/             # Configuración y schemas
│   │   ├── 📂 db/               # Modelos y conexión BD
│   │   ├── 📂 services/         # Lógica de negocio
│   │   └── 📄 main.py           # Punto de entrada
│   ├── 📂 docs/                 # Documentación técnica
│   ├── 📂 migrations/           # Scripts SQL
│   ├── 📄 requirements.txt
│   └── 📄 Dockerfile
│
├── 📂 Vue-Front/                # Frontend Vue 3
│   ├── 📂 src/
│   │   ├── 📂 views/            # Páginas
│   │   ├── 📂 components/       # Componentes reutilizables
│   │   ├── 📂 composables/      # Lógica compartida
│   │   ├── 📂 router/           # Rutas
│   │   └── 📂 stores/           # Estado global (Pinia)
│   ├── 📄 package.json
│   └── 📄 vite.config.ts
│
└── 📄 README.md
```

---

