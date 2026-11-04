import { describe, it, expect } from 'vitest'
import { fieldClass } from '@/lib/fieldStyles'

describe('fieldClass', () => {
  it('returns default styling when no error', () => {
    const result = fieldClass()
    expect(result).toContain('border-slate-200')
    expect(result).toContain('focus:ring-sda-blue')
  })

  it('returns error styling when error provided', () => {
    const result = fieldClass({ message: 'Required' })
    expect(result).toContain('border-red-200')
    expect(result).toContain('focus:ring-red-500')
  })
})
