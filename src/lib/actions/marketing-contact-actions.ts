'use server'

import { sendContactInquiry } from '@/lib/email'

interface ContactFormParams {
  name: string
  email: string
  company?: string
  projectType: string
  timeline: string
  budget?: string
  message: string
  website?: string
}

export async function submitContactInquiry(formData: ContactFormParams): Promise<{ success: boolean; error?: string }> {
  if (formData.website) {
    return { success: true }
  }

  if (!formData.name?.trim()) {
    return { success: false, error: 'Name is required' }
  }

  if (!formData.email?.trim()) {
    return { success: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  if (!formData.message?.trim()) {
    return { success: false, error: 'Project details are required' }
  }

  if (formData.message.length > 5000) {
    return { success: false, error: 'Message is too long (max 5000 characters)' }
  }

  try {
    const result = await sendContactInquiry({
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: formData.company?.trim() || undefined,
      projectType: formData.projectType,
      timeline: formData.timeline,
      budget: formData.budget?.trim() || undefined,
      message: formData.message.trim(),
    })

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to send inquiry' }
    }

    return { success: true }
  } catch (error) {
    console.error('Contact inquiry error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
