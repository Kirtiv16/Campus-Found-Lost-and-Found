export type ItemType = 'lost' | 'found'
export type Category = 'electronics' | 'id-card' | 'books' | 'clothing' | 'keys' | 'accessories' | 'other'
export type ItemStatus = 'open' | 'claimed' | 'returned'
export interface Item {
  id: string; type: ItemType; title: string; description: string; category: Category
  locationId: string; dateOccurred: string; dateReported: string; status: ItemStatus
  imageUrl: string; contactName: string; contactEmail: string
}
export interface Location { id: string; name: string; lat: number; lng: number }
export interface Filters {
  q: string; category: Category | ''; locationId: string; status: ItemStatus | ''
  sort: 'newest' | 'oldest' | 'nearest'; userLocationId: string
}