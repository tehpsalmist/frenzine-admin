import React, { useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import { SAVE_RECORD } from '../graphql'
import deepEqual from 'fast-deep-equal'
import { FieldEditor } from './EditableFieldValue'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export const RecordEditor = ({ className = '', style = {}, record, fields, formId }) => {
  const history = useHistory()
  const { params: { workspaceId } } = useRouteMatch<{ workspaceId: string }>('/workspace/:workspaceId') ?? { params: {} }

  const recordValues = useMemo(() => {
    const valuesMap = record?.values?.reduce((map, value) => ({ ...map, [value.field?.id || value.frenzine_field_id]: value }), {}) ?? {}

    return fields.reduce((map, field) => ({ ...map, [field.id]: valuesMap[field.id] ?? { value: null } }), {})
  }, [record, fields])

  const [editingValues, setEditingValues] = useState(recordValues)

  const [saveRecord, { loading }] = useMutation(SAVE_RECORD)

  const isDirty = !deepEqual(recordValues, editingValues)

  return <form onSubmit={async e => {
    e.preventDefault()

    const errorMaybe = await saveRecord({
      variables: {
        recordId: record?.id,
        formId,
        is_complete: true,
        values: Object.keys(editingValues).map(fieldId => ({ fieldId, value: editingValues[fieldId].value }))
      }
    })

    if (errorMaybe.errors) {
      return console.error('oh noes', errorMaybe)
    }

    history.push(`/workspace/${workspaceId}/data/${formId}`)
  }}>
    {fields.map(field => <FieldEditor
      className='mb-4'
      key={field.id}
      valueId={editingValues[field.id]?.id || 'new-record'}
      field={field}
      value={editingValues[field.id]?.value ?? null}
      onChange={val => {
        const newValue = (val === undefined || (Array.isArray(val) && !val.length)) ? null : val

        setEditingValues(({ [field.id]: v, ...values }) => ({ ...values, [field.id]: { ...v, value: newValue } }))
      }}
    />)}
    <button type='submit' className='btn btn-primary mt-4 mx-auto block' disabled={!isDirty || loading}>
      Save Record
      {loading && <FontAwesomeIcon icon={faSpinner} spin className='ml-2' />}
    </button>
  </form>
}
