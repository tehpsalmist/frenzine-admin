import React, { useMemo } from 'react'
import { useSubscription } from '@apollo/client'
import Select from 'react-select'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FRENZINE_FORMS_DATA_FIELDS, FRENZINE_RECORDS } from '../graphql'
import { useLogError } from '../hooks'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { EditableFieldValue, RecordEditor } from '../components'

export const DataPage = ({ className = '', style = {}, workspaceId }) => {
  const history = useHistory()
  const { params } = useRouteMatch<{ formId: string, recordId: string }>([
    `/workspace/${workspaceId}/data/:formId/:recordId`,
    `/workspace/${workspaceId}/data/:formId`
  ]) ?? { params: { formId: null, recordId: null } }

  const { data: { frenzine_form: forms = [] } = {}, error: formsError } = useSubscription(FRENZINE_FORMS_DATA_FIELDS, {
    variables: {
      workspaceId
    }
  })

  const currentForm = useMemo(() => {
    return forms.find(f => f.id === Number(params.formId))
  }, [forms, params.formId])

  const setCurrentForm = (newFormId: number | string) => {
    if (newFormId !== params.formId && newFormId !== Number(params.formId)) {
      history.push(`/workspace/${workspaceId}/data/${newFormId}`)
    }
  }

  const { data: { frenzine_record: records = [] } = {}, error: recordsError } = useSubscription(FRENZINE_RECORDS, {
    variables: {
      formId: currentForm?.id
    },
    skip: !currentForm?.id
  })

  const currentRecord = useMemo(() => {
    return records.find(r => r.id === Number(params.recordId))
  }, [records, params.recordId])

  const setCurrentRecord = (newRecordId: number | string) => {
    if (newRecordId !== params.recordId && newRecordId !== Number(params.recordId)) {
      history.push(`/workspace/${workspaceId}/data/${currentForm.id}/${newRecordId}`)
    }
  }

  useLogError('frenzine-forms', formsError)
  useLogError('frenzine-records', recordsError)

  return <main className='h-content p-2 overflow-y-scroll'>
    <div className='flex'>
      <label className='block min-w-64'>
        Select a Form to View:
        <Select
          value={currentForm && { value: currentForm.id, label: currentForm.name }}
          options={forms.map(f => ({ value: f.id, label: f.name }))}
          onChange={({ value }: { value: number, label: string }) => setCurrentForm(value)}
        />
      </label>
      {currentForm && params.recordId !== 'new' && <button
        className='btn btn-secondary ml-auto self-center'
        onClick={e => setCurrentRecord('new')}
      >
        <FontAwesomeIcon icon={faPlus} className='mr-2' />
        New {currentForm.name} Record
      </button>}
    </div>
    {currentForm && (currentRecord || params.recordId === 'new'
      ? <div className='max-w-6xl shadow-md mx-auto p-2 sm:p-4 mt-2 flex-grow'>
        <RecordEditor formId={currentForm.id} record={currentRecord} fields={currentForm.fields} />
      </div>
      : <div className='overflow-x-scroll mt-2 flex-grow'>
        <table className='min-w-full'>
          <thead>
            <tr>
              {currentForm.fields?.map(field => <th key={field.id}>{field.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {records.map(record => {
              const valueMap = record.values?.reduce((map, value) => ({ ...map, [value.field.id]: value }), {})

              return <tr key={record.id}>
                {currentForm.fields.map((field) => <td key={field.id}>
                  <EditableFieldValue value={valueMap[field.id]} field={field} />
                </td>)}
              </tr>
            })}
          </tbody>
        </table>
      </div>)}
    {currentForm && !records.length && <div className='flex-center mt-24'>No {currentForm.name} Records Found</div>}
  </main>
}
