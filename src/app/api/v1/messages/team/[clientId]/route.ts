import { NextRequest } from 'next/server'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk } from '@/lib/api/v1/response'
import { ApiClientMessage, canAccessClientThread, getAuthenticatedAgencyMessageContext } from '@/lib/api/v1/messages-access'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const agency = await getAuthenticatedAgencyMessageContext(context.supabase, context.userId)
  if (!agency) return apiError(403, 'forbidden', 'Only agency team members can access client threads')

  const { clientId } = await params
  const hasAccess = await canAccessClientThread(context.supabase, agency, clientId)
  if (!hasAccess) {
    return apiError(403, 'forbidden', 'You do not have access to this client conversation')
  }

  const { data: messages, error } = await context.supabase
    .from('client_messages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) return apiError(500, 'internal_error', error.message)
  return apiOk((messages || []) as ApiClientMessage[])
}
