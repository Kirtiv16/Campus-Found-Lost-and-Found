import type { Item } from '../types'
const ITEMS_KEY = 'campus-found-items-v1'
const OVERRIDES_KEY = 'campus-found-status-v1'
export function readStoredItems(seed: Item[]): Item[] {
  try {
    const stored = localStorage.getItem(ITEMS_KEY)
    const overrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}') as Record<string, Item['status']>
    const base = stored ? JSON.parse(stored) as Item[] : seed
    return base.map(item => overrides[item.id] ? { ...item, status: overrides[item.id] } : item)
  } catch { return seed }
}
export function persistItems(items: Item[]) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}
export function persistStatus(id: string, status: Item['status']) {
  const current = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}')
  current[id] = status
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(current))
}
export function isQuotaError(error: unknown) {
  return error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)
}