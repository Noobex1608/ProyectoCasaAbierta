/**
 * QR Service - Frontend service for QR attendance
 */
import apiClient from './api'

const BASE_PATH = '/qr'

export interface QRGenerateRequest {
  class_id: string
  period_number?: number
  base_url?: string
}

export interface QRGenerateResponse {
  success: boolean
  token: string
  class_id: string
  period_number: number
  qr_url: string
  qr_image: string
  expires_at: string
  class_name: string
  // Rotating code
  current_code: string
  code_valid_until: string
  code_remaining_seconds: number
}

export interface ClassPeriod {
  period_number: number
  start_time: string
  end_time: string
  late_threshold: string
  duration_minutes: number
  status_if_now?: string
}

export interface ClassPeriodsResponse {
  class_id: string
  class_name: string
  total_periods: number
  periods: ClassPeriod[]
  current_period: ClassPeriod | null
  current_time: string
}

export interface TokenValidationResponse {
  success: boolean
  valid: boolean
  class_id?: string
  period_number?: number
  class_name?: string
  expires_at?: string
  message?: string
}

export interface PublicVerificationRequest {
  token: string
  cedula: string
  code: string  // 6-digit code (NO SELFIE)
}

export interface PublicVerificationResponse {
  success: boolean
  already_registered?: boolean
  message: string
  student_id?: string
  student_name?: string
  status?: string
  period_number?: number
  confidence?: number
  timestamp?: string
  class_name?: string
}

export interface PeriodAttendance {
  period_number: number
  start_time: string
  end_time: string
  attendance_records: any[]
  present_count: number
  late_count: number
  absent_count: number
  total_registered: number
}

export const qrService = {
  /**
   * Generate QR code for a class period
   */
  async generateQR(request: QRGenerateRequest): Promise<QRGenerateResponse> {
    const response = await apiClient.post(`${BASE_PATH}/generate`, {
      class_id: request.class_id,
      period_number: request.period_number || 1,
      base_url: request.base_url || window.location.origin
    })
    return response.data.data
  },

  /**
   * Get all periods for a class
   */
  async getClassPeriods(classId: string): Promise<ClassPeriodsResponse> {
    const response = await apiClient.get(`${BASE_PATH}/class/${classId}/periods`)
    return response.data.data
  },

  /**
   * Validate a QR token (public)
   */
  async validateToken(token: string): Promise<TokenValidationResponse> {
    const response = await apiClient.get(`${BASE_PATH}/validate/${token}`)
    return response.data
  },

  /**
   * Verify attendance via code (public - no auth, NO SELFIE)
   */
  async verifyPublic(request: PublicVerificationRequest): Promise<PublicVerificationResponse> {
    const response = await apiClient.post(`${BASE_PATH}/verify-code`, request)
    return response.data
  },

  /**
   * Get attendance grouped by period
   */
  async getAttendanceByPeriod(classId: string): Promise<{ periods: PeriodAttendance[] }> {
    const response = await apiClient.get(`${BASE_PATH}/attendance/${classId}/by-period`)
    return response.data.data
  }
}

export default qrService
