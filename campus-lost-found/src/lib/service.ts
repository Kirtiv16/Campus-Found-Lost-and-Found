import type { Item } from '../types'

const apiUrl = (
  (import.meta as ImportMeta & { readonly env: { readonly VITE_API_URL?: string } }).env.VITE_API_URL ?? ''
).replace(/\/$/, '')

interface ApiErrorResponse {
  error?: {
    message?: string
  }
}

function withApiUrl(item: Item): Item {
  return item.imageUrl.startsWith('/')
    ? { ...item, imageUrl: `${apiUrl}${item.imageUrl}` }
    : item
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiUrl}${url}`, init)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed.'
    throw new Error(message)
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`
    try {
      const body = await response.json() as ApiErrorResponse
      if (typeof body.error?.message === 'string') message = body.error.message
    } catch {
      // Use the HTTP status message when the server response is not JSON.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function fetchItems(): Promise<Item[]> {
  const items = await request<Item[]>('/api/items')
  return items.map(withApiUrl)
}

export async function createItem(item: Item): Promise<{ item: Item; imageFallback: boolean }> {
  const form = new FormData()
  form.set('type', item.type)
  form.set('title', item.title)
  form.set('category', item.category)
  form.set('locationId', item.locationId)
  form.set('dateOccurred', item.dateOccurred)
  form.set('description', item.description)
  form.set('contactName', item.contactName)
  form.set('contactEmail', item.contactEmail)

  if (item.imageUrl.startsWith('data:')) {
    const image = await fetch(item.imageUrl)
    const blob = await image.blob()
    const extension = blob.type === 'image/jpeg' ? 'jpg'
      : blob.type === 'image/webp' ? 'webp'
        : 'png'
    form.set('image', blob, `image.${extension}`)
  }

  const created = await request<Item>('/api/items', { method: 'POST', body: form })
  return { item: withApiUrl(created), imageFallback: false }
}

export async function claimItem(id: string): Promise<void> {
  await request<Item>(`/api/items/${encodeURIComponent(id)}/claim`, { method: 'PATCH' })
}
