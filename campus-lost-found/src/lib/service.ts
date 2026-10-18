import seedItems from '../data/items.json'
import type { Item } from '../types'
import { isQuotaError, persistItems, persistStatus, readStoredItems } from './storage'
const delay = (ms = 700) => new Promise(resolve => window.setTimeout(resolve, ms))
export async function fetchItems(): Promise<Item[]> {
  await delay()
  return readStoredItems(seedItems as Item[])
}
export async function createItem(item: Item): Promise<{ item: Item; imageFallback: boolean }> {
  await delay(180)
  const items = readStoredItems(seedItems as Item[])
  let next = item, imageFallback = false
  try { persistItems([next, ...items]) }
  catch (error) {
    if (!isQuotaError(error)) throw error
    next = { ...item, imageUrl: '' }
    imageFallback = true
    try { persistItems([next, ...items]) } catch { /* keep the current session usable */ }
  }
  return { item: next, imageFallback }
}
export async function claimItem(id: string): Promise<void> {
  await delay(160)
  try { persistStatus(id, 'claimed') }
  catch (error) { if (!isQuotaError(error)) throw error }
}