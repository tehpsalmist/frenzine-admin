import { useQuery } from '@apollo/client'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Select from 'react-select'
import { FORM_NAMES } from '../graphql'
import { useLogError } from '../hooks'

const newOption = [{ id: 'new', name: 'Create New Form' }]

export const FormSelect = ({ className = '', style = {}, value, onChange, label = 'Select A Form' }) => {
  const history = useHistory()
  const { params: { workspaceId } } = useRouteMatch<{ workspaceId: string }>(`/workspace/:workspaceId`) ?? { params: {} }

  const { data: { frenzine_form: forms = [] } = {}, error } = useQuery(FORM_NAMES, {
    variables: {
      workspaceId
    }
  })

  useLogError('form-select', error)

  return <label className={`${className}`} style={style}>
    {label}
    <Select
      value={forms.find(form => form.id === value)}
      getOptionLabel={opt => opt.name}
      options={newOption.concat(forms)}
      onChange={({ id }) => id === 'new' ? history.push(`/workspace/${workspaceId}/forms/new`) : onChange(id)}
    />
  </label>
}
