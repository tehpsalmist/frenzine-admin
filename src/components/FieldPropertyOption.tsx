import React from 'react'
import { Checkbox } from './Checkbox'
import { FieldChoicesOptions } from './FieldChoicesOptions'
import { TextInput } from './TextInput'

export const FieldPropertyOption = ({ className = '', style = {}, propName, value, onChange, ...props }) => {
  if (typeof propertyComponents[propName] !== 'function') {
    console.error('invalid field property:', propName)

    return null
  }

  return propertyComponents[propName]({ value, onChange, className, style, ...props })
}

const propertyComponents = {
  // aggregation: props => ,
  calculation: props => <TextInput {...props} label='Calculation' />,
  choices: props => <FieldChoicesOptions {...props} label='Choices' />,
  currency: props => <TextInput {...props} label='Currency' />,
  decimal: props => <TextInput {...props} type='number' label='Decimal' />,
  // displayFields: null,
  // extensions: null,
  // filter: null,
  markdown: props => <Checkbox {...props} label='Markdown' />,
  maxNumber: props => <TextInput {...props} type='number' label='Maximum' />,
  maxlength: props => <TextInput {...props} type='number' label='Max Length' />,
  maxwordcount: props => <TextInput {...props} type='number' label='Max Word Count' />,
  minNumber: props => <TextInput {...props} type='number' label='Minimum' />,
  minwordcount: props => <TextInput {...props} type='number' label='Min Word Count' />,
  multiple: props => <Checkbox {...props} label='Multiple' />,
  placeholder: props => <TextInput {...props} label='Placeholder' />,
  provinces: props => <Checkbox {...props} label='Provinces' />,
  // showAllChoices: boolean,
  // summarizedForm: null,
}
