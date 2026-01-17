/**
 * Smart Classroom AI - Courses Service
 */

import { supabase } from './supabase'
import type { Course, CourseSchedule } from '@/types'

// Storage key para horarios en localStorage
const SCHEDULES_STORAGE_KEY = 'course_schedules'

// Funciones auxiliares para localStorage
const getStoredSchedules = (): Record<string, CourseSchedule[]> => {
  try {
    const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const saveScheduleForCourse = (courseId: string, schedule: CourseSchedule[]) => {
  const schedules = getStoredSchedules()
  schedules[courseId] = schedule
  localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules))
}

const getScheduleForCourse = (courseId: string): CourseSchedule[] | undefined => {
  const schedules = getStoredSchedules()
  return schedules[courseId]
}

export const coursesService = {
  /**
   * Create a new course (Supabase)
   */
  async createCourse(data: { 
    course_name: string
    course_code: string
    description?: string
    schedule?: CourseSchedule[]
  }): Promise<Course> {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        course_name: data.course_name,
        course_code: data.course_code,
        description: data.description,
        teacher_id: user?.id
      })
      .select()
      .single()

    if (error) throw error
    
    // Guardar schedule en localStorage si existe
    if (data.schedule && data.schedule.length > 0) {
      saveScheduleForCourse(course.id, data.schedule)
      course.schedule = data.schedule
    }
    
    return course
  },

  /**
   * Get all courses for current teacher
   */
  async getMyCourses(): Promise<Course[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Agregar schedules desde localStorage
    const courses = (data || []).map(course => {
      const schedule = getScheduleForCourse(course.id)
      if (schedule) {
        return { ...course, schedule }
      }
      return course
    })
    
    return courses
  },

  /**
   * Get a specific course
   */
  async getCourse(courseId: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (error) throw error
    
    // Agregar schedule desde localStorage
    const schedule = getScheduleForCourse(courseId)
    if (schedule) {
      data.schedule = schedule
    }
    
    return data
  },

  /**
   * Update course
   */
  async updateCourse(courseId: string, updates: Partial<Course> & { schedule?: CourseSchedule[] }): Promise<Course> {
    // Separar schedule de los otros campos
    const { schedule, ...courseUpdates } = updates
    
    const { data, error } = await supabase
      .from('courses')
      .update(courseUpdates)
      .eq('id', courseId)
      .select()
      .single()

    if (error) throw error
    
    // Actualizar schedule en localStorage si se proporciona
    if (schedule !== undefined) {
      if (schedule && schedule.length > 0) {
        saveScheduleForCourse(courseId, schedule)
        data.schedule = schedule
      } else {
        // Eliminar schedule si está vacío
        const schedules = getStoredSchedules()
        delete schedules[courseId]
        localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules))
      }
    } else {
      // Mantener el schedule existente
      const existingSchedule = getScheduleForCourse(courseId)
      if (existingSchedule) {
        data.schedule = existingSchedule
      }
    }
    
    return data
  },

  /**
   * Delete course
   */
  async deleteCourse(courseId: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) throw error
    
    // Eliminar schedule de localStorage
    const schedules = getStoredSchedules()
    delete schedules[courseId]
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules))
  }
}
