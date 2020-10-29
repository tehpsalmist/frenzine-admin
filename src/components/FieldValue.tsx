import React from 'react'
import countries from '../data/countries.json'
import states from '../data/states.json'

export const FieldValue = ({ field, value }) => {
  if (!value && value !== 0) return ''

  switch (field.type?.name) {
    case 'file-upload':
      return value.downloadUrl || ''
    case 'dropdown':
      return value?.map(v => field.properties.choices.find(c => c.value === v)?.label).filter(Boolean).join(', ') ?? ''
    case 'checkbox':
      if (field.properties.multiple) {
        return value?.map(v => field.properties.choices.find(c => c.value === v)?.label).filter(Boolean).join(', ') ?? ''
      }

      return field.properties.choices.find(c => c.value === value)?.label ?? ''
    case 'date-picker':
      return new Date(value).toLocaleDateString('en-ZA')
    case 'text-area':
      return <span className='truncate max-w-xs'>{value}</span>
    case 'state-select':
      return states.find(state => state.id === value)?.state ?? ''
    case 'country-select':
      return countries.find(country => country.id === value)?.country ?? ''
    default:
      if ((typeof value === 'string' || typeof value === 'number')) {
        return value
      }
  }

  return String(value)
}
