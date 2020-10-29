import React, { Ref } from 'react'

interface TextAreaProps {
  innerRef?: Ref<HTMLTextAreaElement>
  placeholder?: string
  label?: string
  labelClass?: string
  value: string
  tabIndex?: number
  onChange (value: string): void
  className?: string
  inputClass?: string
  required?: boolean
  id?: string
  rows?: number
}

export const TextArea = ({ innerRef, placeholder, label, labelClass = '', value, tabIndex, onChange, className = '', inputClass = '', required, id, rows = 3 }: TextAreaProps) => {
  return <div className={className}>
    <label htmlFor={label} className={labelClass}>
      {label} {label && required && <span className='text-secondary-400'>*</span>}
      <textarea
        rows={rows}
        ref={innerRef}
        id={id || label}
        className={`form-description ${inputClass}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        tabIndex={tabIndex}
        required={required}
      />
    </label>
  </div>
}
