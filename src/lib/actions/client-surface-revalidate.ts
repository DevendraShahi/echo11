import { revalidatePath } from 'next/cache'

interface ClientSurfaceRevalidateOptions {
  projectId?: string | null
}

export function revalidateClientSurface(options?: ClientSurfaceRevalidateOptions): void {
  revalidatePath('/client')
  revalidatePath('/client/projects')
  revalidatePath('/client/invoices')
  revalidatePath('/client/contracts')
  revalidatePath('/client/meetings')
  revalidatePath('/client/messages')
  revalidatePath('/client/settings')

  if (options?.projectId) {
    revalidatePath(`/client/projects/${options.projectId}`)
  }
}

export function revalidateLegacyPortalSurface(): void {
  revalidatePath('/client')
  revalidatePath('/client/projects')
  revalidatePath('/client/invoices')
  revalidatePath('/client/contracts')
  revalidatePath('/client/messages')
  revalidatePath('/client/settings')
}
