import type { Location } from '../types'
const rad = (n: number) => n * Math.PI / 180
export function haversineKm(a: Pick<Location, 'lat'|'lng'>, b: Pick<Location, 'lat'|'lng'>): number {
  const dLat = rad(b.lat-a.lat), dLng = rad(b.lng-a.lng)
  const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}