'use client'

type Props = {
  iso: string
  variant?: 'datetime' | 'date' | 'time'
  locale?: string
  timeZone?: string
  /** Opzioni extra per personalizzare la formattazione */
  options?: Intl.DateTimeFormatOptions
}

export default function FormatDate({
  iso,
  variant = 'datetime',
  locale = 'it-IT',
  timeZone = 'Europe/Rome',
  options = {}
}: Props) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return <span>-</span>

  const base: Intl.DateTimeFormatOptions =
    variant === 'date'
      ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : variant === 'time'
      ? { hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }

  const text = new Intl.DateTimeFormat(locale, { timeZone, ...base, ...options }).format(d)

  return <time dateTime={iso}>{text}</time>
}
