import React, { ReactElement, Ref } from 'react'

interface TextInputProps {
  innerRef?: Ref<HTMLInputElement>,
  labelClass?: string,
  inputClass?: string,
  type?: string,
  placeholder?: string,
  pattern?: string,
  label?: string,
  value: string,
  onChange (val: string): void,
  className?: string,
  required?: boolean,
  id?: string,
  tabIndex?: number
}

export const TextInput = ({ innerRef, labelClass = '', inputClass = '', type = 'text', placeholder, pattern, label, value, onChange, className = '', required, id, tabIndex = 0 }: TextInputProps): ReactElement => {
  return <div className={className}>
    <label htmlFor={id || label} className={labelClass}>
      {label} {label && required && <span className='text-secondary-400'>*</span>}
    </label>
    <input
      tabIndex={tabIndex}
      ref={innerRef}
      id={id || label}
      className={`text-input ${inputClass}`}
      pattern={pattern}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required} />
  </div>
}
