<template>
  <div class="public-attendance">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">📚</span>
          <span class="logo-text">Smart Classroom</span>
        </div>
        <div class="subtitle">Verificación de Asistencia</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Validando código QR...</p>
      </div>

      <!-- Invalid Token -->
      <div v-else-if="!tokenValid" class="error-state">
        <div class="error-icon">❌</div>
        <h2>Código QR Inválido</h2>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Valid Token - Show Verification Form -->
      <div v-else-if="!showResult" class="verification-container">
        <!-- Class Info Card -->
        <div class="class-info-card">
          <div class="class-header">
            <span class="class-icon">📖</span>
            <div class="class-details">
              <h2>{{ className }}</h2>
              <p class="period-info">Período {{ periodNumber }}</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="verifyAttendance" class="verification-form">
          <!-- Cédula -->
          <div class="input-group">
            <label for="cedula">
              <span class="input-icon">🪪</span>
              Tu Cédula
            </label>
            <input
              id="cedula"
              v-model="cedula"
              type="text"
              placeholder="Ej: 1234567890"
              maxlength="10"
              pattern="[0-9]*"
              inputmode="numeric"
              required
              autocomplete="off"
            />
          </div>

          <!-- Código de Verificación -->
          <div class="input-group">
            <label for="code">
              <span class="input-icon">🔐</span>
              Código de Asistencia
            </label>
            <input
              id="code"
              v-model="verificationCode"
              type="text"
              placeholder="Ej: 123456"
              maxlength="6"
              pattern="[0-9]*"
              inputmode="numeric"
              required
              autocomplete="off"
              class="code-input"
            />
            <p class="input-hint">
              Ingresa el código de 6 dígitos que muestra el profesor
            </p>
          </div>

          <!-- Submit -->
          <button 
            type="submit"
            class="btn btn-primary"
            :disabled="!canSubmit || verifying"
          >
            <span v-if="verifying" class="btn-loading">
              <span class="spinner-small"></span>
              Verificando...
            </span>
            <span v-else>
              ✅ Registrar Asistencia
            </span>
          </button>
        </form>
      </div>

      <!-- Result -->
      <div v-else class="result-container">
        <div :class="['result-card', resultSuccess ? 'success' : 'error']">
          <div class="result-icon">
            {{ resultSuccess ? '✅' : '❌' }}
          </div>
          <h3>{{ resultMessage }}</h3>
          <div v-if="resultData" class="result-details">
            <p v-if="resultData.student_name">
              <strong>Estudiante:</strong> {{ resultData.student_name }}
            </p>
            <p v-if="resultData.status">
              <strong>Estado:</strong> 
              <span :class="['status-badge', resultData.status]">
                {{ resultData.status === 'present' ? '✅ Presente' : '⚠️ Atrasado' }}
              </span>
            </p>
            <p v-if="resultData.period_number">
              <strong>Período:</strong> {{ resultData.period_number }}
            </p>
            <p v-if="resultData.timestamp">
              <strong>Hora:</strong> {{ formatTime(resultData.timestamp) }}
            </p>
          </div>
        </div>
        
        <button @click="resetForm" class="btn btn-secondary">
          Registrar otro estudiante
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>Smart Classroom AI © 2026</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { qrService, type PublicVerificationResponse } from '@/services/qr.service'

const route = useRoute()

// State
const loading = ref(true)
const tokenValid = ref(false)
const errorMessage = ref('')
const showResult = ref(false)

// Token info
const token = ref('')
const className = ref('')
const periodNumber = ref(1)

// Form data
const cedula = ref('')
const verificationCode = ref('')
const verifying = ref(false)

// Result
const resultSuccess = ref(false)
const resultMessage = ref('')
const resultData = ref<PublicVerificationResponse | null>(null)

// Can submit
const canSubmit = computed(() => {
  return cedula.value.length >= 10 && verificationCode.value.length === 6
})

// Validate token on mount
onMounted(async () => {
  const queryToken = route.query.token as string
  
  if (!queryToken) {
    loading.value = false
    tokenValid.value = false
    errorMessage.value = 'No se proporcionó un código QR válido'
    return
  }
  
  token.value = queryToken
  
  try {
    const result = await qrService.validateToken(queryToken)
    
    if (result.valid) {
      tokenValid.value = true
      className.value = result.class_name || 'Clase'
      periodNumber.value = result.period_number || 1
    } else {
      tokenValid.value = false
      errorMessage.value = result.message || 'Código QR inválido o expirado'
    }
  } catch {
    tokenValid.value = false
    errorMessage.value = 'Error al validar el código QR. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

// Reset form
const resetForm = () => {
  cedula.value = ''
  verificationCode.value = ''
  showResult.value = false
  resultSuccess.value = false
  resultMessage.value = ''
  resultData.value = null
}

// Verify attendance
const verifyAttendance = async () => {
  if (!canSubmit.value || !token.value) return
  
  verifying.value = true
  
  try {
    const result = await qrService.verifyPublic({
      token: token.value,
      cedula: cedula.value,
      code: verificationCode.value
    })
    
    resultSuccess.value = result.success
    resultMessage.value = result.message
    resultData.value = result
    showResult.value = true
    
  } catch (error: any) {
    resultSuccess.value = false
    resultMessage.value = error.response?.data?.message || 'Error en la verificación'
    resultData.value = error.response?.data || null
    showResult.value = true
  } finally {
    verifying.value = false
  }
}

// Format time
const formatTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Guayaquil'
  })
}
</script>

<style scoped>
/* Base */
.public-attendance {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* Header */
.header {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 1.5rem;
  max-width: 450px;
  margin: 0 auto;
  width: 100%;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Class Info Card */
.class-info-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.class-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.class-icon {
  font-size: 2.5rem;
}

.class-details h2 {
  font-size: 1.25rem;
  margin: 0 0 0.25rem 0;
}

.period-info {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

/* Form */
.verification-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Input Group */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.input-icon {
  font-size: 1.1rem;
}

.input-group input {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: border-color 0.3s, background 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #4facfe;
  background: rgba(255, 255, 255, 0.15);
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.code-input {
  text-align: center;
  font-size: 1.5rem !important;
  letter-spacing: 0.3em;
  font-family: monospace;
}

.input-hint {
  font-size: 0.75rem;
  opacity: 0.6;
  margin: 0;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: #1a1a2e;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(79, 172, 254, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 1rem;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Result */
.result-container {
  text-align: center;
}

.result-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1rem;
}

.result-card.success {
  border: 2px solid #22c55e;
  background: rgba(34, 197, 94, 0.15);
}

.result-card.error {
  border: 2px solid #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.result-card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
}

.result-details {
  text-align: left;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
}

.result-details p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.status-badge.present {
  background: rgba(34, 197, 94, 0.3);
}

.status-badge.late {
  background: rgba(251, 191, 36, 0.3);
}

/* Footer */
.footer {
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
  opacity: 0.6;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
  }
  
  .class-info-card {
    padding: 1rem;
  }
}
</style>
