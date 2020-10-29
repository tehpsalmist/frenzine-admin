import { useMutation } from '@apollo/client'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import deepEqual from 'fast-deep-equal'
import { useParams } from 'react-router-dom'
import { FieldPropertyOption, FieldValidationOption, TextInput } from '.'
import { CREATE_FIELD, UPDATE_FIELD } from '../graphql'

const rotateClasses = 'transform rotate-90'

export const EditableFieldDefinition = ({ className = '', style = {}, field, onSaveOrCancel = () => { } }) => {
  const { formId } = useParams<{ formId: string }>()
  const [edit, setEdit] = useState(!field.id)

  const [label, setLabel] = useState(field.label)
  const [description, setDescription] = useState(field.description)
  const [name, setName] = useState(field.name)
  const [properties, setProperties] = useState(field.properties)
  const [validation, setValidation] = useState(field.validation)

  const [createField] = useMutation(CREATE_FIELD)
  const [updateField] = useMutation(UPDATE_FIELD)

  const isDirty = !deepEqual(
    { label, description, name, properties, validation },
    {
      label: field.label,
      description: field.description,
      name: field.name,
      properties: field.properties,
      validation: field.validation
    }
  )

  return <div className='transition-all duration-300'>
    <div className='flex'>
      {field.id && <button
        className={`${edit ? rotateClasses : ''} transition-all duration-300 w-6 h-6 mr-4 focus:outline-none`}
        onClick={e => setEdit(ed => !ed)}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>}
      <span className={`${edit ? 'opacity-0' : 'opacity-100'} transition-all duration-300 font-semibold w-48`}>{field?.type?.display_name}</span>
      <span className={`mx-auto ${edit ? 'opacity-0' : 'opacity-100'} transition-all duration-300`}>{field.label}</span>
    </div>
    {edit && <form
      className={`${edit ? 'opacity-100' : 'opacity-0'} transition-all duration-300`}
      onSubmit={async e => {
        e.preventDefault()

        const { errors } = field.id
          ? await updateField({
            variables: {
              name,
              label,
              description,
              validation,
              properties,
              id: field.id
            }
          })
          : await createField({
            variables: {
              name,
              label,
              description,
              validation,
              properties,
              type_id: field.type_id,
              formId
            }
          })

        if (!errors) {
          setEdit(false)
          onSaveOrCancel()
        }
      }}
    >
      <h5 className='font-semibold mt-4 text-center'>Display</h5>
      <TextInput label='Label' value={label} onChange={setLabel} required />
      <TextInput label='Short Name' value={name} onChange={setName} required />
      <TextInput label='Description' value={description} onChange={setDescription} />
      {!!Object.keys(properties || {}).length && <h5 className='font-semibold mt-8 text-center'>Properties</h5>}
      <ul className='space-y-2'>
        {Object.keys(properties || {}).map(propName => {
          const value = properties[propName]

          return <FieldPropertyOption
            key={propName}
            propName={propName}
            value={value}
            onChange={val => setProperties(p => ({ ...p, [propName]: val }))}
          />
        })}
      </ul>
      {!!Object.keys(validation || {}).length && <h5 className='font-semibold mt-8 text-center'>Validations</h5>}
      <ul className='space-y-2'>
        {Object.keys(validation || {}).map(validationName => {
          const value = validation[validationName]

          return <FieldValidationOption
            key={validationName}
            validationName={validationName}
            value={value}
            onChange={val => setValidation(v => ({ ...v, [validationName]: val }))}
          />
        })}
      </ul>
      <div className='mt-4 flex-center'>
        <button type='submit' disabled={!isDirty} className='btn btn-primary'>Save Field</button>
        {!field.id && <button type='button' className='btn ml-2' onClick={e => onSaveOrCancel()}>Cancel</button>}
      </div>
    </form>}
  </div>
}
