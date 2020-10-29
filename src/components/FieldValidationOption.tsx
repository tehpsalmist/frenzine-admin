import React from 'react'
import { Checkbox } from './Checkbox'

export const FieldValidationOption = ({ className = '', style = {}, validationName, value, onChange, ...props }) => {
  if (typeof validationComponents[validationName] !== 'function') {
    console.error('invalid field validation:', validationName)

    return null
  }

  return validationComponents[validationName]({ value, onChange, className, style, ...props })
}

const validationComponents = {
  alpha: props => <Checkbox {...props} label='Alpha' />,
  alphaNumeric: props => <Checkbox {...props} label='Alpha-Numeric' />,
  currencyDollar: props => <Checkbox {...props} label='Currency In Dollars' />,
  emailAddress: props => <Checkbox {...props} label='Email' />,
  numeric: props => <Checkbox {...props} label='Numeric' />,
  required: props => <Checkbox {...props} label='Required' />,
  unique: props => <Checkbox {...props} label='Unique' />,
  zipCode: props => <Checkbox {...props} label='Zip Code' />
}