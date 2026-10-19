import { useEffect, useRef, useState } from 'react'
import {
  ImagePlus,
  UploadCloud,
  X,
  AlertCircle,
  CalendarDays,
  MapPin,
  UserRound,
  Mail,
  Check,
  ShieldCheck,
} from 'lucide-react'
import type { Category, Item, ItemType, Location } from '../../types'
import { categories } from '../../data/categories'
import { itemSchema, validateField, type ItemFormValues } from '../../utils/validation'
import Button from '../common/Button'

interface PostItemFormProps {
  locations: Location[]
  onSubmit: (item: Item) => Promise<void>
  onCancel: () => void
}

const initial: ItemFormValues = {
  type: 'lost',
  title: '',
  category: '' as Category,
  locationId: '',
  dateOccurred: new Date().toISOString().slice(0, 10),
  contactName: '',
  contactEmail: '',
  description: '',
}

export default function PostItemForm({ locations, onSubmit, onCancel }: PostItemFormProps) {
  const [values, setValues] = useState<ItemFormValues>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormValues, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ItemFormValues, boolean>>>({})
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [dragging, setDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const fieldRefs = useRef<Partial<Record<keyof ItemFormValues, HTMLElement | null>>>({})

  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const setField = <K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (touched[key]) {
      setErrors((e) => ({ ...e, [key]: validateField(key, value) }))
    }
  }

  const blur = <K extends keyof ItemFormValues>(key: K) => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors((e) => ({ ...e, [key]: validateField(key, values[key]) }))
  }

  const chooseFile = (f?: File) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, description: 'Please choose an image file (JPG, PNG, WEBP).' }))
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, description: 'That image is over 5 MB. Try a smaller photo.' }))
      return
    }
    setErrors((e) => ({ ...e, description: '' }))
    setFile(f)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const result = itemSchema.safeParse(values)
    const nextErrors: Partial<Record<keyof ItemFormValues, string>> = {}

    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ItemFormValues
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
    }

    setErrors(nextErrors)
    setTouched({
      type: true,
      title: true,
      category: true,
      locationId: true,
      dateOccurred: true,
      contactName: true,
      contactEmail: true,
      description: true,
    })

    if (!result.success) {
      const firstInvalid = Object.keys(nextErrors)[0] as keyof ItemFormValues
      fieldRefs.current[firstInvalid]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      fieldRefs.current[firstInvalid]?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const imageUrl = file
        ? await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = () => reject(new Error('Could not read image'))
            reader.readAsDataURL(file)
          })
        : ''

      const now = new Date()
      await onSubmit({
        id: `itm_${now.getTime()}`,
        type: values.type as ItemType,
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category as Category,
        locationId: values.locationId,
        dateOccurred: values.dateOccurred,
        dateReported: now.toISOString(),
        status: 'open',
        imageUrl,
        contactName: values.contactName.trim(),
        contactEmail: values.contactEmail.trim(),
      })
    } catch {
      setErrors((e) => ({ ...e, description: 'We couldn’t save this post. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldError = (key: keyof ItemFormValues) => errors[key]
  const common = (key: keyof ItemFormValues) => ({
    id: key,
    'aria-invalid': Boolean(fieldError(key)),
    'aria-describedby': fieldError(key) ? `${key}-error` : undefined,
    onBlur: () => blur(key),
    ref: (el: HTMLElement | null) => {
      fieldRefs.current[key] = el
    },
  })

  // Live counter color calculation
  const descLength = values.description.length
  const descCounterColor =
    descLength >= 300
      ? 'text-rose-600 font-bold'
      : descLength >= 240
      ? 'text-amber-600 font-semibold'
      : 'text-zinc-400'

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {/* Intro */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <ImagePlus className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
            Help something find its way
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Post an item
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Share a few details and let the campus community help.
          </p>
        </div>
      </div>

      {/* Type Choice - Segmented Control */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-zinc-800 tracking-tight">
          What are you posting? <span className="text-rose-500">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Lost Option */}
          <button
            type="button"
            onClick={() => setField('type', 'lost')}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
              values.type === 'lost'
                ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300 text-rose-900 shadow-xs'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  values.type === 'lost' ? 'bg-rose-600' : 'bg-zinc-300'
                }`}
              />
              <div>
                <strong className="block text-xs sm:text-sm font-semibold">I lost something</strong>
                <small className="block text-[11px] text-zinc-500 font-normal">
                  Help me find it
                </small>
              </div>
            </div>
            {values.type === 'lost' && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
          </button>

          {/* Found Option */}
          <button
            type="button"
            onClick={() => setField('type', 'found')}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
              values.type === 'found'
                ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-300 text-sky-900 shadow-xs'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  values.type === 'found' ? 'bg-sky-600' : 'bg-zinc-300'
                }`}
              />
              <div>
                <strong className="block text-xs sm:text-sm font-semibold">I found something</strong>
                <small className="block text-[11px] text-zinc-500 font-normal">
                  Help it get home
                </small>
              </div>
            </div>
            {values.type === 'found' && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
          </button>
        </div>
      </fieldset>

      {/* Section 1: Item details */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Item details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="title" className="block text-xs font-semibold text-zinc-700 tracking-tight">
              Item name <span className="text-rose-500">*</span>
            </label>
            <input
              {...common('title')}
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g. Blue Hydro Flask with stickers"
              maxLength={60}
              className={`w-full h-10 px-3 text-sm bg-white border rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-colors ${
                fieldError('title')
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
              }`}
            />
            <FieldError value={fieldError('title')} id="title-error" />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="category" className="block text-xs font-semibold text-zinc-700 tracking-tight">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...common('category')}
              value={values.category}
              onChange={(e) => setField('category', e.target.value as Category)}
              className={`w-full h-10 px-3 text-sm bg-white border rounded-lg text-zinc-800 focus:outline-none transition-colors cursor-pointer ${
                fieldError('category')
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
              }`}
            >
              <option value="">Choose category</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <FieldError value={fieldError('category')} id="category-error" />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label htmlFor="locationId" className="block text-xs font-semibold text-zinc-700 tracking-tight">
              Campus location <span className="text-rose-500">*</span>
            </label>
            <select
              {...common('locationId')}
              value={values.locationId}
              onChange={(e) => setField('locationId', e.target.value)}
              className={`w-full h-10 px-3 text-sm bg-white border rounded-lg text-zinc-800 focus:outline-none transition-colors cursor-pointer ${
                fieldError('locationId')
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
              }`}
            >
              <option value="">Where was it?</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <FieldError value={fieldError('locationId')} id="locationId-error" />
          </div>

          {/* Date */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="dateOccurred" className="block text-xs font-semibold text-zinc-700 tracking-tight">
              Date lost / found <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              <input
                {...common('dateOccurred')}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={values.dateOccurred}
                onChange={(e) => setField('dateOccurred', e.target.value)}
                className={`w-full h-10 pl-9 pr-3 text-sm bg-white border rounded-lg text-zinc-900 focus:outline-none transition-colors ${
                  fieldError('dateOccurred')
                    ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                }`}
              />
            </div>
            <FieldError value={fieldError('dateOccurred')} id="dateOccurred-error" />
          </div>

          {/* Photo Dropzone */}
          <div className="sm:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 tracking-tight">
                Photo <span className="text-zinc-400 font-normal ml-1">Optional</span>
              </label>
              <span className="text-[11px] text-zinc-400">Up to 5 MB (JPG, PNG, WEBP)</span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                chooseFile(e.dataTransfer.files[0])
              }}
              className={`border-2 border-dashed rounded-xl transition-all p-4 ${
                dragging
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : preview
                  ? 'border-zinc-200 bg-zinc-50/50'
                  : 'border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/20'
              }`}
            >
              {preview ? (
                <div className="flex items-center gap-3">
                  <img
                    src={preview}
                    alt="Uploaded preview"
                    className="w-14 h-14 rounded-lg object-cover border border-zinc-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-800 truncate">{file?.name}</p>
                    <p className="text-[11px] text-zinc-400">{file && formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="Remove photo"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 text-center">
                  <UploadCloud className="w-8 h-8 text-zinc-400 mb-1 stroke-[1.6]" />
                  <p className="text-xs font-medium text-zinc-700">
                    Drop a photo here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      browse files
                    </button>
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => chooseFile(e.target.files?.[0])}
              />
            </div>
            {errors.description &&
              (errors.description.includes('image') || errors.description.includes('5 MB')) && (
                <ErrorText>{errors.description}</ErrorText>
              )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="block text-xs font-semibold text-zinc-700 tracking-tight">
                Description <span className="text-zinc-400 font-normal ml-1">Optional</span>
              </label>
              <span className={`text-[11px] tabular-nums ${descCounterColor}`} id="description-count">
                {descLength}/300
              </span>
            </div>
            <textarea
              {...common('description')}
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Colour, brand, distinguishing marks, or contents…"
              className={`w-full p-3 text-sm bg-white border rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-colors resize-y min-h-[80px] ${
                fieldError('description')
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
              }`}
            />
            <FieldError value={fieldError('description')} id="description-error" />
          </div>
        </div>
      </div>

      {/* Section 2: Contact Info */}
      <div className="space-y-4 pt-4 border-t border-zinc-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <UserRound className="w-3.5 h-3.5 text-zinc-400" />
          <span>Contact details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="contactName" className="block text-xs font-semibold text-zinc-700 tracking-tight">
              Your name <span className="text-rose-500">*</span>
            </label>
            <input
              {...common('contactName')}
              value={values.contactName}
              onChange={(e) => setField('contactName', e.target.value)}
              placeholder="Name classmates know you by"
              className={`w-full h-10 px-3 text-sm bg-white border rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-colors ${
                fieldError('contactName')
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
              }`}
            />
            <FieldError value={fieldError('contactName')} id="contactName-error" />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="contactEmail" className="block text-xs font-semibold text-zinc-700 tracking-tight">
              Campus email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              <input
                {...common('contactEmail')}
                type="email"
                value={values.contactEmail}
                onChange={(e) => setField('contactEmail', e.target.value)}
                placeholder="you@campus.edu"
                className={`w-full h-10 pl-9 pr-3 text-sm bg-white border rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-colors ${
                  fieldError('contactEmail')
                    ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                }`}
              />
            </div>
            <FieldError value={fieldError('contactEmail')} id="contactEmail-error" />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your contact details help classmates reach you. Only share an email you’re comfortable using for campus messages.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
        <Button variant="secondary" size="lg" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isSubmitting}
          icon={<ImagePlus className="w-4 h-4" />}
        >
          Publish item
        </Button>
      </div>
    </form>
  )
}

function ErrorText({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <span id={id} className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {children}
    </span>
  )
}

function FieldError({ value, id }: { value?: string; id: string }) {
  return value ? <ErrorText id={id}>{value}</ErrorText> : null
}