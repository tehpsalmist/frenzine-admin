import React, { useEffect, useMemo, useState } from 'react'
import { Checkbox } from './Checkbox'
import { FieldValue } from './FieldValue'
import { TextInput } from './TextInput'
import countries from '../data/countries.json'
import states from '../data/states.json'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import { TextArea } from './TextArea'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPencilAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useMutation } from '@apollo/client'
import { UPDATE_RECORD_VALUE } from '../graphql'
import { RadioButtons } from './RadioButtons'

interface StateOption {
  id: string
  state: string
  abbreviation: string
  country: {
    id: string
  }
}

interface CountryOption {
  id: string
  country: string
}

export const EditableFieldValue = ({ className = '', style = {}, editClass = 'w-full mr-2', editStyle = {}, field, value }) => {
  const canEdit = useMemo(() => {
    return editableField(field.type.name)
  }, [field.type?.name])
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value?.value)

  const [updateValue] = useMutation(UPDATE_RECORD_VALUE)

  useEffect(() => {
    setEditValue(value?.value)
  }, [value?.value])

  const saveFieldValue = async e => {
    const errorMaybe = await updateValue({ variables: { id: value.id, value: editValue } })

    if (errorMaybe.errors) {
      return console.error(errorMaybe.errors)
    }

    setEditing(s => !s)
  }

  return <div className={`flex items-center ${className}`} style={style}>
    {canEdit && editing
      ? <FieldEditor withLabel={false} className={editClass} valueId={value.id} style={editStyle} value={editValue} field={field} onChange={setEditValue} />
      : <FieldValue value={value?.value} field={field} />}
    <button
      className={`w-6 h-6 rounded ml-auto text-white ${editing ? 'bg-red-500' : 'bg-gray-200 hover:bg-gray-400'}`}
      onClick={e => setEditing(s => !s)}
    >
      {editing
        ? <FontAwesomeIcon icon={faTimes} />
        : <FontAwesomeIcon icon={faPencilAlt} />}
    </button>
    {editing && <button
      className={`w-6 h-6 rounded ml-1 text-white bg-green-500`}
      onClick={saveFieldValue}
    >
      <FontAwesomeIcon icon={faCheck} />
    </button>}
  </div>
}

export const FieldEditor = ({ withLabel = true, field, value, valueId, onChange, ...props }) => {
  switch (field?.type.name) {
    case 'checkbox':
      return <label>
        {withLabel ? <span>{field.label}</span> : undefined}
        {field.properties.choices.map(choice => <Checkbox
          value={!!value && value.some(val => val === choice.value)}
          onChange={val => {
            const valuesWithout = value && value.filter(v => v !== choice.value)

            onChange(val ? valuesWithout ? valuesWithout.concat(choice.value) : [choice.value] : valuesWithout)
          }}
          label={choice.label}
        />)}
      </label>
    case 'country-select':
      return withLabel
        ? <label>
          {field.label}
          <Select
            {...props}
            menuPortalTarget={document.body}
            value={countries.find(co => co.id === value)}
            options={countries}
            getOptionValue={opt => opt.id}
            getOptionLabel={opt => opt.country}
            onChange={(opt: CountryOption) => onChange(opt.id)}
            required={field.validation.required}
          />
        </label>
        : <Select
          {...props}
          menuPortalTarget={document.body}
          value={countries.find(co => co.id === value)}
          options={countries}
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => opt.country}
          onChange={(opt: CountryOption) => onChange(opt.id)}
          required={field.validation.required}
        />
    case 'date-picker':
      return withLabel
        ? <label>
          <span>{field.label}</span>
          <DatePicker
            className='text-input'
            wrapperClassName='block'
            isClearable
            showYearDropdown
            showMonthDropdown
            showPopperArrow={false}
            selected={value && new Date(value)}
            dateFormat='yyyy/MM/dd'
            onChange={(date: Date) => onChange(date && new Date(date).toLocaleDateString('en-ZA'))}
          />
        </label>
        : <DatePicker
          className='text-input'
          wrapperClassName='block'
          isClearable
          showYearDropdown
          showMonthDropdown
          showPopperArrow={false}
          selected={value && new Date(value)}
          dateFormat='yyyy/MM/dd'
          onChange={(date: Date) => onChange(date && new Date(date).toLocaleDateString('en-ZA'))}
        />
    case 'dropdown':
      return withLabel
        ? <label>
          {field.label}
          {field.properties.multiple
            ? <Select
              {...props}
              menuPortalTarget={document.body}
              isMulti
              value={field.properties.choices.filter(ch => value && value.some(v => ch.value === v))}
              options={field.properties.choices}
              onChange={val => onChange((val && val.length) ? val.map(v => v.value) : null)}
              required={field.validation.required}
            />
            : <Select
              {...props}
              menuPortalTarget={document.body}
              value={field.properties.choices.find(ch => ch.value === value)}
              options={field.properties.choices}
              onChange={choice => onChange(choice.value)}
              required={field.validation.required}
            />}
        </label>
        : field.properties.multiple
          ? <Select
            {...props}
            menuPortalTarget={document.body}
            isMulti
            value={field.properties.choices.filter(ch => value && value.some(v => ch.value === v))}
            options={field.properties.choices}
            onChange={val => onChange((val && val.length) ? val.map(v => v.value) : null)}
            required={field.validation.required}
          />
          : <Select
            {...props}
            menuPortalTarget={document.body}
            value={field.properties.choices.find(ch => ch.value === value)}
            options={field.properties.choices}
            onChange={choice => onChange(choice.value)}
            required={field.validation.required}
          />
    case 'file-upload':
      return <></>
    case 'numeric':
      return <TextInput
        {...props}
        type='number'
        value={value === null ? '' : value}
        onChange={val => onChange(val === '' ? null : Number(val))} label={withLabel ? field.label : undefined}
        required={field.validation.required}
      />
    case 'radio':
      return <RadioButtons
        value={value}
        options={field.properties.choices}
        label={withLabel ? field.label : undefined}
        name={`radio-${valueId}`}
        onChange={onChange}
      />
    case 'state-select':
      return withLabel
        ? <label>
          {field.label}
          <Select
            {...props}
            menuPortalTarget={document.body}
            value={states.find(st => st.id === value)}
            options={states}
            getOptionValue={opt => opt.id}
            getOptionLabel={opt => opt.state}
            onChange={(opt: StateOption) => onChange(opt.id)}
            required={field.validation.required}
          />
        </label>
        : <Select
          {...props}
          menuPortalTarget={document.body}
          value={states.find(st => st.id === value)}
          options={states}
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => opt.state}
          onChange={(opt: StateOption) => onChange(opt.id)}
          required={field.validation.required}
        />
    case 'text-area':
      return <TextArea
        {...props}
        value={value == null ? '' : value}
        label={withLabel ? field.label : undefined}
        onChange={onChange}
        required={field.validation.required}
      />
    case 'text-input':
    default:
      return <TextInput
        {...props}
        value={value == null ? '' : value}
        label={withLabel ? field.label : undefined}
        onChange={onChange}
        required={field.validation.required}
      />
  }
}

function editableField (fieldName) {
  switch (fieldName) {
    case 'checkbox':
    case 'country-select':
    case 'date-picker':
    case 'dropdown':
    case 'file-upload':
    case 'numeric':
    case 'radio':
    case 'state-select':
    case 'text-area':
    case 'text-input':
      return true
    default:
      return false
  }
}
