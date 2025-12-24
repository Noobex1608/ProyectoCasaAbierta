# 🗄️ Esquema de Base de Datos - Supabase

## 📋 Estructura de Tablas

### Tabla: `students`

```sql
CREATE TABLE public.students (
  id integer NOT NULL DEFAULT nextval('students_id_seq'::regclass),
  student_id character varying NOT NULL UNIQUE,  -- ID único del estudiante (matrícula)
  name character varying NOT NULL,               -- Nombre completo
  email character varying,                        -- Email (opcional)
  face_embedding vector(512) NOT NULL,           -- Vector de embedding facial (Facenet512)
  enrolled_at timestamp without time zone NOT NULL DEFAULT now(),  -- Fecha de registro
  is_active boolean NOT NULL DEFAULT true,       -- Estado activo/inactivo
  metadata jsonb,                                -- Datos adicionales (opcional)
  CONSTRAINT students_pkey PRIMARY KEY (id)
);

-- Índice para búsquedas por student_id
CREATE INDEX idx_students_student_id ON public.students(student_id);

-- Índice para búsquedas vectoriales rápidas (IVFFlat o HNSW)
CREATE INDEX ON public.students USING ivfflat (face_embedding vector_cosine_ops);
```

**Dimensiones del vector:**
- ✅ Facenet512: `vector(512)` 
- ✅ Facenet: `vector(128)`
- ✅ VGG-Face: `vector(2622)`

---

### Tabla: `attendance`

```sql
CREATE TABLE public.attendance (
  id integer NOT NULL DEFAULT nextval('attendance_id_seq'::regclass),
  student_id character varying NOT NULL,
  class_id character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'present'::character varying,  -- present, absent, late
  timestamp timestamp without time zone NOT NULL DEFAULT now(),
  confidence double precision,           -- Confianza de la IA (0.0 - 1.0)
  match_distance double precision,       -- Distancia euclidiana del match
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) 
    REFERENCES public.students(student_id)
);

-- Índice compuesto para consultas por clase y fecha
CREATE INDEX idx_attendance_class_timestamp ON public.attendance(class_id, timestamp);
```

---

### Tabla: `class_sessions`

```sql
CREATE TABLE public.class_sessions (
  id integer NOT NULL DEFAULT nextval('class_sessions_id_seq'::regclass),
  class_id character varying NOT NULL UNIQUE,
  class_name character varying NOT NULL,
  instructor character varying,
  room character varying,
  start_time timestamp without time zone NOT NULL,
  end_time timestamp without time zone,
  total_students integer DEFAULT 0,
  present_count integer DEFAULT 0,
  attendance_rate double precision DEFAULT 0.0,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  metadata jsonb,
  CONSTRAINT class_sessions_pkey PRIMARY KEY (id)
);
```

---

### Tabla: `emotion_events`

```sql
CREATE TABLE public.emotion_events (
  id integer NOT NULL DEFAULT nextval('emotion_events_id_seq'::regclass),
  student_id character varying NOT NULL,
  class_id character varying NOT NULL,
  dominant_emotion character varying NOT NULL,  -- happy, sad, angry, neutral, etc.
  confidence double precision NOT NULL,
  emotion_scores text,                          -- JSON string con todos los scores
  detected_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT emotion_events_pkey PRIMARY KEY (id),
  CONSTRAINT emotion_events_student_id_fkey FOREIGN KEY (student_id) 
    REFERENCES public.students(student_id)
);

-- Índice para análisis temporal
CREATE INDEX idx_emotion_events_detected_at ON public.emotion_events(detected_at);
```

---

## 🔄 Mapeo de Campos (Schema → Código)

### Enrollment: Frontend → Backend → BD

| Frontend (Payload) | Backend (Schema) | Base de Datos (students) | Tipo |
|-------------------|------------------|--------------------------|------|
| `student_id` | `payload.student_id` | `student_id` | VARCHAR (UNIQUE) |
| `full_name` | `payload.full_name` | `name` ⚠️ | VARCHAR (NOT NULL) |
| `image_base64` | `payload.image_base64` | `face_embedding` | vector(512) |
| - | - | `email` | VARCHAR (NULL) |
| - | - | `is_active` | BOOLEAN (default true) |
| - | - | `enrolled_at` | TIMESTAMP (auto) |
| - | - | `metadata` | JSONB (NULL) |

⚠️ **IMPORTANTE:** El frontend envía `full_name` pero la BD espera `name`.

---

## 🛠️ Scripts de Configuración

### 1. Crear extensión pgvector (si no existe)

```sql
-- En Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Verificar dimensión del vector

```sql
-- Ver el tipo actual
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'students' AND column_name = 'face_embedding';

-- Cambiar dimensión si es necesario
ALTER TABLE students ALTER COLUMN face_embedding TYPE vector(512);
```

### 3. Crear índice para búsquedas vectoriales

```sql
-- Opción 1: IVFFlat (rápido, buena precisión)
CREATE INDEX students_face_embedding_idx 
ON students 
USING ivfflat (face_embedding vector_cosine_ops)
WITH (lists = 100);

-- Opción 2: HNSW (más rápido, requiere más memoria)
-- CREATE INDEX students_face_embedding_idx 
-- ON students 
-- USING hnsw (face_embedding vector_cosine_ops);
```

### 4. Verificar estructura de la tabla

```sql
\d students
```

---

## 📊 Consultas Útiles

### Ver estudiantes registrados

```sql
SELECT 
    id,
    student_id,
    name,
    email,
    array_length(face_embedding::real[], 1) as embedding_dimension,
    enrolled_at,
    is_active
FROM students
ORDER BY enrolled_at DESC
LIMIT 10;
```

### Buscar estudiante por ID

```sql
SELECT 
    student_id,
    name,
    email,
    enrolled_at,
    is_active
FROM students
WHERE student_id = 'A00123456';
```

### Buscar rostro similar (reconocimiento)

```sql
-- Buscar el rostro más similar a un embedding dado
-- Nota: [0.123, -0.98, ...] debe ser reemplazado con el embedding real
SELECT 
    student_id,
    name,
    1 - (face_embedding <=> '[0.123, -0.98, ...]') AS similarity
FROM students
WHERE is_active = true
ORDER BY face_embedding <=> '[0.123, -0.98, ...]'
LIMIT 5;
```

### Estadísticas de asistencia

```sql
SELECT 
    s.student_id,
    s.name,
    COUNT(a.id) as total_attendance,
    AVG(a.confidence) as avg_confidence
FROM students s
LEFT JOIN attendance a ON s.student_id = a.student_id
GROUP BY s.student_id, s.name
ORDER BY total_attendance DESC;
```

### Análisis de emociones por clase

```sql
SELECT 
    class_id,
    dominant_emotion,
    COUNT(*) as count,
    AVG(confidence) as avg_confidence
FROM emotion_events
WHERE detected_at >= NOW() - INTERVAL '7 days'
GROUP BY class_id, dominant_emotion
ORDER BY class_id, count DESC;
```

---

## 🔒 Políticas de Seguridad (Row Level Security)

### Habilitar RLS

```sql
-- Habilitar RLS en la tabla students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (opcional)
CREATE POLICY "Allow public read access" 
ON students FOR SELECT 
TO public 
USING (true);

-- Política para escritura solo con service_role
CREATE POLICY "Allow insert for service role" 
ON students FOR INSERT 
TO service_role 
WITH CHECK (true);
```

---

## ⚠️ Problemas Comunes

### Error: "extension vector does not exist"

**Solución:**
```sql
CREATE EXTENSION vector;
```

### Error: "dimension of vector does not match"

**Causa:** El modelo genera 512 valores pero la BD espera 128 (o viceversa).

**Solución:**
```sql
-- Verificar dimensión actual
SELECT pg_typeof(face_embedding) FROM students LIMIT 1;

-- Cambiar a 512 para Facenet512
ALTER TABLE students ALTER COLUMN face_embedding TYPE vector(512);

-- O cambiar a 128 para Facenet
ALTER TABLE students ALTER COLUMN face_embedding TYPE vector(128);
```

### Error: "column name does not exist"

**Causa:** El código usa `full_name` pero la BD espera `name`.

**Solución:** Ya está corregido en el endpoint `/enroll-v2`.

### Error: "unique constraint violation"

**Causa:** Ya existe un estudiante con ese `student_id`.

**Solución:**
```sql
-- Verificar si existe
SELECT * FROM students WHERE student_id = 'A00123456';

-- Eliminar si es necesario
DELETE FROM students WHERE student_id = 'A00123456';

-- O actualizar el registro existente
UPDATE students 
SET name = 'Nuevo Nombre', 
    face_embedding = '[...]'::vector 
WHERE student_id = 'A00123456';
```

---

## 📈 Optimización de Rendimiento

### Índices recomendados

```sql
-- Para búsquedas por student_id
CREATE INDEX idx_students_student_id ON students(student_id);

-- Para filtros por is_active
CREATE INDEX idx_students_is_active ON students(is_active) WHERE is_active = true;

-- Para búsquedas vectoriales (IVFFlat)
CREATE INDEX students_face_embedding_idx 
ON students 
USING ivfflat (face_embedding vector_cosine_ops)
WITH (lists = 100);
```

### Configuración de pgvector

```sql
-- Ver configuración actual
SHOW shared_preload_libraries;

-- Ajustar parámetros (en postgresql.conf o Supabase Dashboard)
-- shared_buffers = 256MB
-- work_mem = 64MB
-- maintenance_work_mem = 256MB
```

---

## 🔗 Referencias

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Supabase Vector Guide](https://supabase.com/docs/guides/database/extensions/pgvector)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)

---

**✅ Esquema de base de datos documentado y listo para usar.**
