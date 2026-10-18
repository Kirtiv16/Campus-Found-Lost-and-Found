import type { Category } from '../types'
export const categories: { value: Category; label: string }[] = [
  { value: 'electronics', label: 'Electronics' }, { value: 'id-card', label: 'ID cards' },
  { value: 'books', label: 'Books & notes' }, { value: 'clothing', label: 'Clothing' },
  { value: 'keys', label: 'Keys' }, { value: 'accessories', label: 'Accessories' }, { value: 'other', label: 'Other' }
]
export const categoryLabel = (value: string) => categories.find(c => c.value === value)?.label ?? value
