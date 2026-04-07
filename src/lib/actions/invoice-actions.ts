'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ServiceCategory, ServiceUnit } from '@/types/lab'

export interface InvoiceItemData {
  description: string
  quantity: number
  rate: number
}

export interface InvoiceFormData {
  client_id: string
  project_id?: string | null
  due_date: string
  items: InvoiceItemData[]
  tax_rate: number
  notes?: string | null
}

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export async function createInvoice(data: InvoiceFormData): Promise<{ success: boolean; error?: string; invoiceId?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    // Generate invoice number
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
    
    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(4, '0')}`

    // Calculate amounts
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
    const taxAmount = subtotal * (data.tax_rate / 100)
    const total = subtotal + taxAmount

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id: data.client_id,
        project_id: data.project_id || null,
        status: 'draft',
        subtotal,
        tax_rate: data.tax_rate,
        tax_amount: taxAmount,
        total,
        due_date: data.due_date,
        notes: data.notes || null,
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Create invoice items
    if (data.items.length > 0) {
      const itemsToInsert = data.items.map((item, index) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
        sort_order: index
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
      }
    }

    // Log activity
    try {
      await supabase.from('activities').insert({
        user_id: userId,
        action: 'created invoice',
        entity_type: 'invoice',
        entity_id: invoice.id,
        metadata: { invoice_number: invoiceNumber, total }
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    revalidatePath('/lab/invoices')

    return { success: true, invoiceId: invoice.id }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateInvoice(id: string, data: Partial<InvoiceFormData>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const updateData: Partial<{
      client_id: string
      project_id: string | null
      due_date: string
      tax_rate: number
      notes: string | null
      subtotal: number
      tax_amount: number
      total: number
      updated_at: string
    }> = {
      updated_at: new Date().toISOString()
    }

    if (data.client_id) updateData.client_id = data.client_id
    if (data.project_id !== undefined) updateData.project_id = data.project_id
    if (data.due_date) updateData.due_date = data.due_date
    if (data.tax_rate !== undefined) updateData.tax_rate = data.tax_rate
    if (data.notes !== undefined) updateData.notes = data.notes

    // Recalculate totals if items provided
    if (data.items) {
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
      const taxAmount = subtotal * ((data.tax_rate || 0) / 100)
      const total = subtotal + taxAmount
      
      updateData.subtotal = subtotal
      updateData.tax_amount = taxAmount
      updateData.total = total
    }

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Update items if provided
    if (data.items) {
      // Delete existing items
      await supabase.from('invoice_items').delete().eq('invoice_id', id)

      // Insert new items
      if (data.items.length > 0) {
        const itemsToInsert = data.items.map((item, index) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
          sort_order: index
        }))

        await supabase.from('invoice_items').insert(itemsToInsert)
      }
    }

    revalidatePath('/lab/invoices')
    revalidatePath(`/lab/invoices/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating invoice:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteInvoice(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    // Delete items first
    await supabase.from('invoice_items').delete().eq('invoice_id', id)

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/invoices')

    return { success: true }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const updateData: {
      status: string
      updated_at: string
      paid_date?: string
    } = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'paid') {
      updateData.paid_date = new Date().toISOString()
    }

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/invoices')
    revalidatePath(`/lab/invoices/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating invoice status:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getClientsForInvoiceForm() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('clients')
    .select('id, company_name, contact_name, email')
    .order('company_name', { ascending: true })

  return data || []
}

export async function getProjectsForInvoiceForm() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('projects')
    .select('id, name, status, client_id')
    .order('name', { ascending: true })

  return data || []
}

export async function getServicesForInvoice(projectId?: string | null) {
  const supabase = await createClient()
  
  type ServiceBase = {
    id: string
    name: string
    category: string
    default_rate: number
    unit: string
    description: string | null
    created_at?: string
    isProjectSpecific?: boolean
  }

  let services: ServiceBase[] = []
  
  // Get all default services
  const { data: defaultServices } = await supabase
    .from('services')
    .select('id, name, category, default_rate, unit, description')
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  
  services = defaultServices || []
  
  // If project is selected, get project-specific services (from project_expenses)
  if (projectId) {
    const { data: projectExpenses } = await supabase
      .from('project_expenses')
      .select(`
        id,
        description,
        quantity,
        rate,
        service:services(id, name, category, default_rate, unit)
      `)
      .eq('project_id', projectId)
    
    // Add unique project services that aren't in the default list
    if (projectExpenses) {
      const existingIds = new Set(services.map(s => s.id))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projectExpenses.forEach((expense: any) => {
        if (expense.service && !existingIds.has(expense.service.id)) {
          services.push({
            ...expense.service,
            isProjectSpecific: true
          })
        }
      })
    }
  }
  
  return services.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category as ServiceCategory,
    default_rate: s.default_rate,
    unit: s.unit as ServiceUnit,
    description: s.description,
    created_at: s.created_at || new Date().toISOString(),
    isProjectSpecific: s.isProjectSpecific || false
  }))
}