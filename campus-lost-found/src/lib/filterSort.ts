import type { Filters, Item, Location } from '../types'
import { haversineKm } from './geo'
export function filterAndSortItems(items: Item[], filters: Filters, locations: Location[]) {
  const byId = new Map(locations.map(l => [l.id, l]))
  const query = filters.q.trim().toLowerCase()
  const filtered = items.filter(item => {
    const haystack = `${item.title} ${item.description} ${item.contactName} ${item.category} ${byId.get(item.locationId)?.name ?? item.locationId}`.toLowerCase()
    return (!query || haystack.includes(query)) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.locationId || item.locationId === filters.locationId) &&
      (!filters.status || item.status === filters.status)
  })
  const userLoc = byId.get(filters.userLocationId)
  filtered.sort((a,b) => {
    if (filters.sort === 'nearest' && userLoc) {
      const la = byId.get(a.locationId), lb = byId.get(b.locationId)
      if (la && !lb) return -1
      if (!la && lb) return 1
      if (la && lb) {
        const delta = haversineKm(userLoc, la) - haversineKm(userLoc, lb)
        if (Math.abs(delta) > 0.001) return delta
      }
    }
    const delta = new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()
    return filters.sort === 'oldest' ? -delta : delta
  })
  return filtered
}
export function distanceFor(item: Item, filters: Filters, locations: Location[]) {
  const origin = locations.find(l => l.id === filters.userLocationId)
  const destination = locations.find(l => l.id === item.locationId)
  return origin && destination ? haversineKm(origin, destination) : null
}