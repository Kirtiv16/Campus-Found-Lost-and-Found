import { useState } from 'react'
import type { Filters } from '../types'
export const initialFilters: Filters = { q: '', category: '', locationId: '', status: '', sort: 'newest', userLocationId: '' }
export function useFilters() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters(current => ({ ...current, [key]: value }))
  const reset = () => setFilters(initialFilters)
  return { filters, setFilters, update, reset }
}