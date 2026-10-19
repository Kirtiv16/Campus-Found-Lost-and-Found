export function formatItemDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', options)
}
