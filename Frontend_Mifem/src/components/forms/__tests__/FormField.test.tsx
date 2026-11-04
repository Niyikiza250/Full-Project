import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from '@/components/forms/FormField'

describe('FormField', () => {
  it('renders label', () => {
    render(
      <FormField label="Test Label">
        <input />
      </FormField>
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('shows required indicator when required', () => {
    render(
      <FormField label="Required Field" required>
        <input />
      </FormField>
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('shows error message when provided', () => {
    render(
      <FormField label="Field" error="This field is required">
        <input />
      </FormField>
    )
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('shows hint text when provided', () => {
    render(
      <FormField label="Field" hint="Optional">
        <input />
      </FormField>
    )
    expect(screen.getByText('(Optional)')).toBeInTheDocument()
  })
})
