import React, { StyleHTMLAttributes, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import Select from 'react-select'
import { TextInput, EditableFieldDefinition } from '../../components'
import { FIELD_TYPES, UPDATE_FORM_METADATA } from '../../graphql'
import { useLogError } from '../../hooks'
import { generatePropertyList, generateValidationList } from '../../utilities'

interface FormBuilderProps {
  className?: string
  style?: StyleHTMLAttributes<HTMLElement>
  form: {
    id?: number
    name?: string
    purpose?: string
    fields?: any[]
  }
  workspaceId: number
}

export const FormBuilder = ({ className = '', style = {}, form = {}, workspaceId }: FormBuilderProps) => {
  const [name, setName] = useState(form.name || '')
  const [purpose, setPurpose] = useState(form.purpose || '')
  const [newUnsavedField, setNewUnsavedField] = useState(null)

  const { data: { frenzine_field_type: fieldTypes = [] } = {}, error } = useQuery(FIELD_TYPES)

  const [updateFormMetadata] = useMutation(UPDATE_FORM_METADATA)

  const dirtyMetadata = name !== form.name || purpose !== form.purpose

  const addField = ({ value, label, name }: { value: number, label: string, name: string }) => {
    setNewUnsavedField({
      type_id: value,
      type: {
        id: value,
        display_name: label
      },
      description: '',
      label: `My ${label}`,
      name: `My ${label}`,
      properties: generatePropertyList(name),
      validation: generateValidationList(name)
    })
  }

  useLogError('field-types', error)

  useEffect(() => {
    if (form?.id) {
      setName(form.name)
      setPurpose(form.purpose)
      setNewUnsavedField(null)
    }
  }, [form?.id])

  return <section>
    <form
      onSubmit={async e => {
        e.preventDefault()

        await updateFormMetadata({
          variables: {
            id: form.id,
            name,
            purpose
          }
        })
      }}
      className='flex-center flex-col shadow-md rounded-lg p-2 max-w-md mx-auto mb-8'
    >
      <h2 className='mb-8 text-xl'>Form Metadata</h2>
      <TextInput value={name} onChange={setName} label='Form Name' className='mb-4 w-sm' />
      <TextInput value={purpose} onChange={setPurpose} label='Form Purpose' className='mb-4 w-sm' />
      <div className='flex mt-4 space-x-2'>
        <button type='submit' className='btn btn-primary' disabled={!dirtyMetadata}>Update Metadata</button>
        {dirtyMetadata && <button
          type='button'
          className='btn'
          onClick={e => {
            setName(form.name)
            setPurpose(form.purpose)
          }}
        >
          Reset
        </button>}
      </div>
    </form>
    <div className=''>
      <h2 className='text-xl text-center mb-4'>Form Fields</h2>
      <ul className='max-w-5xl mx-auto'>
        {form.fields?.map(field => <li className='shadow-md rounded-lg p-2' key={field.id}>
          <EditableFieldDefinition field={field} />
        </li>)}
        {newUnsavedField && <li className='shadow-md rounded-lg p-2'>
          <EditableFieldDefinition field={newUnsavedField} onSaveOrCancel={() => setNewUnsavedField(null)} />
        </li>}
      </ul>
      {!newUnsavedField && <Select
        className='max-w-48 mx-auto mt-4 block'
        value={null}
        onChange={(type) => addField(type)}
        options={fieldTypes.map(ft => ({ value: ft.id, label: ft.display_name, name: ft.name }))}
        placeholder='Add A Field'
      />}
    </div>
  </section>
}
