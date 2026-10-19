import { useCallback, useEffect, useState } from 'react'
import { claimItem, createItem, fetchItems } from '../utils/service'
import type { Item } from '../types'
export function useItems(onError: (message: string) => void) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { let alive = true; fetchItems().then(data => { if (alive) setItems(data) }).catch(() => onError('We couldn’t load the board. Please refresh to try again.')).finally(() => { if (alive) setLoading(false) }); return () => { alive = false } }, [])
  const add = useCallback(async (item: Item) => {
    const result = await createItem(item)
    setItems(current => [result.item, ...current.filter(existing => existing.id !== result.item.id)])
    if (result.imageFallback) onError('That photo was too large to save, so we used a clean placeholder instead.')
    return result.item
  }, [onError])
  const claim = useCallback(async (item: Item) => {
    await claimItem(item.id)
    setItems(current => current.map(existing => existing.id === item.id ? { ...existing, status: 'claimed' } : existing))
  }, [])
  return { items, setItems, loading, add, claim }
}