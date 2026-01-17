# Smart Classroom AI - Frontend

Frontend Vue.js para el sistema de gestión de aula inteligente con reconocimiento facial y análisis de emociones.

## 🚀 Características

- 👤 **Gestión de Estudiantes**: Registro y administración con reconocimiento facial
- 📚 **Gestión de Materias**: Creación y administración de cursos
- ✅ **Control de Asistencia**: Asistencia automática mediante reconocimiento facial y QR
- 😊 **Análisis de Emociones**: Monitoreo del estado emocional de los estudiantes
- 📊 **Estadísticas**: Dashboards con métricas y reportes
- 📅 **Google Calendar**: Integración con Google Calendar para sincronizar eventos de materias

## 🛠️ Tecnologías

- **Vue 3** - Framework JavaScript progresivo
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Build tool de nueva generación
- **Vue Router** - Enrutamiento oficial para Vue.js
- **Tailwind CSS** - Framework CSS utility-first
- **FontAwesome** - Biblioteca de iconos
- **Axios** - Cliente HTTP para peticiones API
- **Supabase** - Backend as a Service (autenticación y base de datos)
- **Google Calendar API** - Integración con calendario de Google

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de Supabase
- Credenciales de Google Calendar API (opcional, para integración de calendario)

## 🔧 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd Vue-Front
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` basado en `.env.example`:

```bash
copy .env.example .env
```

Edita `.env` y configura tus credenciales:

```env
# Google Calendar API (Opcional)
VITE_GOOGLE_API_KEY=tu_api_key_aqui
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
```

Para obtener las credenciales de Google Calendar, sigue la guía en [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)

4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 🗂️ Estructura del Proyecto

```
Vue-Front/
├── src/
│   ├── assets/          # Recursos estáticos
│   ├── components/      # Componentes reutilizables
│   │   ├── AlertMessage.vue
│   │   ├── GoogleCalendar.vue
│   │   ├── LoadingSpinner.vue
│   │   └── ...
│   ├── composables/     # Composables de Vue
│   │   └── useAuth.ts
│   ├── router/          # Configuración de rutas
│   │   └── index.ts
│   ├── services/        # Servicios API
│   │   ├── api.ts
│   │   ├── attendance.service.ts
│   │   ├── classes.service.ts
│   │   ├── courses.service.ts
│   │   ├── google-calendar.service.ts
│   │   └── ...
│   ├── types/           # Definiciones TypeScript
│   │   └── index.ts
│   ├── views/           # Vistas/Páginas
│   │   ├── Dashboard.vue
│   │   ├── Login.vue
│   │   └── ...
│   ├── App.vue          # Componente raíz
│   ├── main.ts          # Punto de entrada
│   └── style.css        # Estilos globales
├── public/              # Archivos públicos
├── .env.example         # Ejemplo de variables de entorno
├── index.html           # HTML principal
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración TypeScript
├── vite.config.ts       # Configuración Vite
└── README.md            # Este archivo
```

## 🔌 Integración con Google Calendar

La aplicación incluye integración con Google Calendar para:

- Visualizar el calendario del usuario en el Dashboard
- Crear automáticamente eventos cuando se agregan nuevas materias
- Sincronizar eventos entre la aplicación y Google Calendar

### Configuración

1. Sigue la guía detallada en [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)
2. Configura las variables de entorno en `.env`
3. Reinicia el servidor de desarrollo

### Uso

1. En el Dashboard, haz clic en "Conectar Google Calendar"
2. Autoriza la aplicación en la ventana emergente de Google
3. El calendario se sincronizará automáticamente
4. Al crear una nueva materia, se creará un evento en Google Calendar

## 🎨 Características de la Interfaz

### Dashboard
- Vista general con accesos rápidos
- Lista de materias del usuario
- Calendario integrado de Google
- Estadísticas rápidas

### Gestión de Estudiantes
- Registro con captura de foto
- Búsqueda y filtrado
- Edición de información
- Vista detallada de estudiante

### Gestión de Materias
- Creación de materias con código automático
- Vista de detalles de materia
- Lista de estudiantes inscritos
- Gestión de clases

### Control de Asistencia
- Asistencia mediante reconocimiento facial
- Asistencia mediante código QR
- Visualización en tiempo real
- Historial de asistencias

### Análisis de Emociones
- Detección de emociones en tiempo real
- Gráficos de estado emocional
- Historial de emociones por clase

## 🔐 Autenticación

La aplicación utiliza Supabase para la autenticación:

- Login con email y contraseña
- Sesión persistente
- Rutas protegidas
- Perfiles de usuario

## 🌐 API Backend

El frontend se comunica con el backend FastAPI ubicado en `../Servidor`

Base URL por defecto: `http://localhost:8000`

## 🐛 Solución de Problemas

### Error de CORS

Si experimentas errores de CORS, verifica que el backend esté configurado correctamente para permitir peticiones desde `http://localhost:5173`

### Google Calendar no carga

1. Verifica que las credenciales en `.env` sean correctas
2. Revisa la consola del navegador para errores específicos
3. Asegúrate de haber autorizado la aplicación
4. Consulta [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)

## 📄 Licencia

Este proyecto es parte del sistema Smart Classroom AI.

## 🤝 Contribuciones

Para contribuir al proyecto:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

