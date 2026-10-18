import { z } from 'zod'
export const itemSchema = z.object({
  type: z.enum(['lost','found'], { required_error: 'Choose whether it is lost or found.' }),
  title: z.string().trim().min(3, 'Use at least 3 characters.').max(60, 'Keep the title under 60 characters.'),
  category: z.string().min(1, 'Choose a category.'),
  locationId: z.string().min(1, 'Choose a campus location.'),
  dateOccurred: z.string().min(1, 'Choose the date it happened.').refine(v => !!v && v <= new Date().toISOString().slice(0,10), 'Date cannot be in the future.'),
  contactName: z.string().trim().min(2, 'Add a name so people know who to contact.'),
  contactEmail: z.string().trim().email('Enter a valid email address.'),
  description: z.string().max(300, 'Keep the description under 300 characters.')
})
export type ItemFormValues = z.infer<typeof itemSchema>
export function validateField<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
  const result = itemSchema.shape[key].safeParse(value)
  return result.success ? '' : result.error.issues[0]?.message ?? 'Check this field.'
}