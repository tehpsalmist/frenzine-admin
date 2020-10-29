import React, { ReactElement, Ref } from 'react'

interface RadioInputProps {
  innerRef?: Ref<HTMLInputElement>,
  labelClass?: string,
  inputClass?: string,
  type?: string,
  options: { value: string, label: string }[],
  label?: string,
  value: string,
  onChange (val: string): void,
  className?: string,
  required?: boolean,
  id?: string,
  tabIndex?: number
  name: string
}

export const RadioButtons = ({ labelClass = '', inputClass = '', options, label: groupLabel, value: currentValue, onChange, className = '', required, id = '', tabIndex = 0, name }: RadioInputProps): ReactElement => {
  return <div className={className}>
    <span className={labelClass}>{groupLabel}</span>
    {options.map(({ value, label }, i) => <label key={value} className='flex items-center cursor-pointer'>
      <input
        tabIndex={tabIndex}
        id={`${id || name}-${i}`}
        className={`mr-2 ${inputClass}`}
        type='radio'
        name={name}
        checked={value === currentValue}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
      />
      {label}
    </label>)}
  </div>
}
