export type ItemType = 'lost' | 'found'
export type Category = 'electronics' | 'id-card' | 'books' | 'clothing' | 'keys' | 'accessories' | 'other'
export type ItemStatus = 'open' | 'claimed' | 'returned'

export interface Item {
  id: string
  type: ItemType
  title: string
  description: string
  category: Category
  locationId: string
  dateOccurred: string
  dateReported: string
  status: ItemStatus
  imageUrl: string
  contactName: string
  contactEmail: string
}
