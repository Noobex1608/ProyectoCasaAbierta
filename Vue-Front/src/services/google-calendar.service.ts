/**
 * Google Calendar API Service
 * Maneja la integración con Google Calendar
 */

// Configuración de Google Calendar API
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const CALENDAR_ID = 'primary' // Calendario principal del usuario

interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  colorId?: string
  recurrence?: string[]
}

class GoogleCalendarService {
  private gapi: any = null
  private tokenClient: any = null
  private accessToken: string = ''

  /**
   * Verifica si las credenciales están configuradas
   */
  hasCredentials(): boolean {
    return !!GOOGLE_API_KEY && !!GOOGLE_CLIENT_ID
  }

  /**
   * Obtiene información sobre las credenciales faltantes
   */
  getMissingCredentials(): string[] {
    const missing: string[] = []
    if (!GOOGLE_API_KEY) missing.push('VITE_GOOGLE_API_KEY')
    if (!GOOGLE_CLIENT_ID) missing.push('VITE_GOOGLE_CLIENT_ID')
    return missing
  }

  /**
   * Inicializa el cliente de Google API
   */
  async initialize(): Promise<void> {
    if (!this.hasCredentials()) {
      const missing = this.getMissingCredentials()
      throw new Error(`Credenciales de Google Calendar no configuradas. Faltan: ${missing.join(', ')}`)
    }
    return new Promise((resolve, reject) => {
      // Cargar el script de Google API
      if (!document.getElementById('google-api-script')) {
        const script = document.createElement('script')
        script.id = 'google-api-script'
        script.src = 'https://apis.google.com/js/api.js'
        script.onload = () => {
          this.loadGoogleAPI().then(resolve).catch(reject)
        }
        script.onerror = reject
        document.body.appendChild(script)
      } else {
        this.loadGoogleAPI().then(resolve).catch(reject)
      }
    })
  }

  /**
   * Carga la API de Google Calendar
   */
  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      ;(window as any).gapi.load('client', async () => {
        try {
          await (window as any).gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          })
          this.gapi = (window as any).gapi
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * Inicializa el cliente de autenticación OAuth
   */
  initializeAuthClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cargar el script de Google Identity Services
      if (!document.getElementById('google-gsi-script')) {
        const script = document.createElement('script')
        script.id = 'google-gsi-script'
        script.src = 'https://accounts.google.com/gsi/client'
        script.onload = () => {
          this.setupTokenClient()
          resolve()
        }
        script.onerror = reject
        document.body.appendChild(script)
      } else {
        this.setupTokenClient()
        resolve()
      }
    })
  }

  /**
   * Configura el cliente de token OAuth
   */
  private setupTokenClient(): void {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('VITE_GOOGLE_CLIENT_ID no está configurado')
    }
    
    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar',
      callback: (response: any) => {
        if (response.access_token) {
          this.accessToken = response.access_token
          this.gapi.client.setToken({ access_token: response.access_token })
        }
      },
      // Configuración para evitar warnings de CORS
      ux_mode: 'popup',
      // Permitir que el popup se cierre automáticamente
      prompt: '',
    })
  }

  /**
   * Solicita autorización del usuario
   */
  async requestAuthorization(): Promise<void> {
    if (!this.tokenClient) {
      await this.initializeAuthClient()
    }
    
    return new Promise((resolve) => {
      // Agregar callback temporal
      const originalCallback = this.tokenClient.callback
      this.tokenClient.callback = (response: any) => {
        originalCallback(response)
        resolve()
      }
      this.tokenClient.requestAccessToken({ prompt: 'consent' })
    })
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  /**
   * Crea un evento de materia en Google Calendar
   */
  async createCourseEvent(courseData: {
    course_name: string
    course_code: string
    description?: string
    schedule?: Array<{
      day_of_week: number
      start_time: string
      end_time: string
    }>
  }): Promise<any[]> {
    console.log('📅 createCourseEvent llamado con:', {
      course_name: courseData.course_name,
      course_code: courseData.course_code,
      schedule_count: courseData.schedule?.length || 0
    })
    
    if (!this.isAuthenticated()) {
      console.log('❌ No autenticado, solicitando autorización...')
      await this.requestAuthorization()
    }

    // Si no hay horarios definidos, crear un evento simple
    if (!courseData.schedule || courseData.schedule.length === 0) {
      console.log('📝 Creando evento simple (sin horarios)')
      return [await this.createSingleEvent(courseData)]
    }

    // Crear eventos recurrentes para cada horario
    console.log(`📝 Creando ${courseData.schedule.length} eventos recurrentes`)
    const events = []
    for (const schedule of courseData.schedule) {
      console.log('➡️ Creando evento para:', schedule)
      const event = await this.createRecurringEvent(courseData, schedule)
      console.log('✅ Evento creado:', event.id)
      events.push(event)
    }
    console.log(`✅ Total de eventos creados: ${events.length}`)
    return events
  }

  /**
   * Crea un evento simple (sin horario definido)
   */
  private async createSingleEvent(courseData: {
    course_name: string
    course_code: string
    description?: string
  }): Promise<any> {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setHours(9, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(10, 30, 0, 0)

    const event: GoogleCalendarEvent = {
      summary: `📚 ${courseData.course_name}`,
      description: `Materia: ${courseData.course_name}\nCódigo: ${courseData.course_code}${
        courseData.description ? `\n\n${courseData.description}` : ''
      }`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: '9',
    }

    const response = await this.gapi.client.calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    })
    return response.result
  }

  /**
   * Crea un evento recurrente en Google Calendar
   */
  private async createRecurringEvent(
    courseData: {
      course_name: string
      course_code: string
      description?: string
    },
    schedule: {
      day_of_week: number
      start_time: string
      end_time: string
    }
  ): Promise<any> {
    // Encontrar la próxima ocurrencia del día especificado
    const startDate = this.getNextDayOfWeek(schedule.day_of_week)
    
    // Configurar hora de inicio
    const [startHour, startMinute] = schedule.start_time.split(':').map(Number)
    startDate.setHours(startHour, startMinute, 0, 0)
    
    // Configurar hora de fin
    const endDate = new Date(startDate)
    const [endHour, endMinute] = schedule.end_time.split(':').map(Number)
    endDate.setHours(endHour, endMinute, 0, 0)

    // Calcular fecha final (3 meses mínimo desde hoy)
    const untilDate = new Date()
    untilDate.setMonth(untilDate.getMonth() + 3)
    const untilString = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    // Día de la semana para RRULE (MO, TU, WE, TH, FR, SA)
    const daysMap = ['', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
    const dayCode = daysMap[schedule.day_of_week]

    const event: GoogleCalendarEvent = {
      summary: `📚 ${courseData.course_name}`,
      description: `Materia: ${courseData.course_name}\nCódigo: ${courseData.course_code}${
        courseData.description ? `\n\n${courseData.description}` : ''
      }\n\nHorario: ${schedule.start_time} - ${schedule.end_time}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      recurrence: [
        `RRULE:FREQ=WEEKLY;BYDAY=${dayCode};UNTIL=${untilString}`
      ],
      colorId: '9',
    }

    try {
      const response = await this.gapi.client.calendar.events.insert({
        calendarId: CALENDAR_ID,
        resource: event,
      })
      return response.result
    } catch (error) {
      console.error('Error creating recurring event:', error)
      throw error
    }
  }

  /**
   * Obtiene la próxima fecha para un día de la semana específico
   */
  private getNextDayOfWeek(dayOfWeek: number): Date {
    const today = new Date()
    const currentDay = today.getDay()
    
    // Convertir: domingo=0 a lunes=1, martes=2, etc.
    const targetDay = dayOfWeek === 7 ? 0 : dayOfWeek
    
    let daysUntilTarget = targetDay - currentDay
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7
    }
    
    const nextDate = new Date(today)
    nextDate.setDate(today.getDate() + daysUntilTarget)
    return nextDate
  }

  /**
   * Obtiene eventos del calendario
   */
  async getEvents(timeMin?: Date, timeMax?: Date): Promise<any[]> {
    if (!this.isAuthenticated()) {
      return []
    }

    const now = new Date()
    const min = timeMin || new Date(now.getFullYear(), now.getMonth(), 1)
    const max = timeMax || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    try {
      const response = await this.gapi.client.calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: min.toISOString(),
        timeMax: max.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      })
      return response.result.items || []
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return []
    }
  }

  /**
   * Busca eventos de una materia específica por código de curso
   */
  async findCourseEvents(courseCode: string): Promise<any[]> {
    if (!this.isAuthenticated()) {
      return []
    }

    try {
      // Buscar todos los eventos recientes
      const recurringResponse = await this.gapi.client.calendar.events.list({
        calendarId: CALENDAR_ID,
        showDeleted: false,
        singleEvents: false, // Para obtener eventos recurrentes maestros
        maxResults: 2500, // Aumentar el límite
        timeMin: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // Últimos 365 días
      })
      
      const allEvents = recurringResponse.result.items || []
      
      // Filtrar eventos que contengan el código del curso en la descripción
      const filteredEvents = allEvents.filter((event: any) => {
        const description = event.description || ''
        // Buscar el patrón "Código: XXX" en la descripción
        return description.includes(`Código: ${courseCode}`)
      })
      
      console.log(`🔍 Encontrados ${filteredEvents.length} eventos para código ${courseCode}`)
      if (filteredEvents.length > 0) {
        console.log('📋 Eventos encontrados:', filteredEvents.map((e: any) => ({
          id: e.id,
          summary: e.summary,
          recurring: !!e.recurrence
        })))
      }
      
      return filteredEvents
    } catch (error) {
      console.error('Error finding course events:', error)
      return []
    }
  }

  /**
   * Elimina todos los eventos de una materia específica
   */
  async deleteCourseEvents(courseCode: string): Promise<void> {
    if (!this.isAuthenticated()) {
      await this.requestAuthorization()
    }

    try {
      const events = await this.findCourseEvents(courseCode)
      
      console.log(`🗑️ Eliminando ${events.length} eventos de ${courseCode}...`)
      
      // Eliminar cada evento
      for (const event of events) {
        try {
          await this.gapi.client.calendar.events.delete({
            calendarId: CALENDAR_ID,
            eventId: event.id
          })
          console.log(`✅ Evento eliminado: ${event.summary}`)
        } catch (error) {
          console.error(`❌ Error eliminando evento ${event.id}:`, error)
        }
      }
      
      console.log(`✅ Eliminados todos los eventos de ${courseCode}`)
    } catch (error) {
      console.error('Error deleting course events:', error)
      throw error
    }
  }

  /**
   * Actualiza los eventos de una materia (elimina los antiguos y crea nuevos)
   */
  async updateCourseEvents(courseData: {
    course_name: string
    course_code: string
    description?: string
    schedule?: Array<{
      day_of_week: number
      start_time: string
      end_time: string
    }>
  }): Promise<any[]> {
    if (!this.isAuthenticated()) {
      await this.requestAuthorization()
    }

    try {
      // 1. Eliminar eventos antiguos
      await this.deleteCourseEvents(courseData.course_code)
      
      // 2. Crear nuevos eventos
      const newEvents = await this.createCourseEvent(courseData)
      
      return newEvents
    } catch (error) {
      console.error('Error updating course events:', error)
      throw error
    }
  }

  /**
   * Obtiene el ID del cliente de Google
   */
  getClientId(): string {
    return GOOGLE_CLIENT_ID
  }
}

export const googleCalendarService = new GoogleCalendarService()
