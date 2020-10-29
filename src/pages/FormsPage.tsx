import React, { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import { useSubscription } from '@apollo/client'
import { FRENZINE_FORMS } from '../graphql'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { FormBuilder, NewForm } from '../sections/forms'
import { useLogError } from '../hooks'

export const FormsPage = ({ className = '', style = {}, workspaceId }) => {
  const history = useHistory()
  const { params } = useRouteMatch<{ formId: string | null }>(`/workspace/${workspaceId}/forms/:formId`) ?? { params: { formId: null } }

  const { data: { frenzine_form: forms = [] } = {}, error } = useSubscription(FRENZINE_FORMS, {
    variables: {
      workspaceId
    }
  })

  useLogError('forms-subscription', error)

  const currentForm = useMemo(() => {
    return params.formId !== 'new' && forms.find(f => f.id === Number(params.formId))
  }, [forms, params.formId])

  const setCurrentForm = (newFormId: number | string) => {
    if (newFormId !== params.formId && newFormId !== Number(params.formId)) {
      history.push(`/workspace/${workspaceId}/forms/${newFormId}`)
    }
  }

  return <main className='h-content p-2 overflow-y-scroll'>
    {params.formId !== 'new' && <div className='flex'>
      <label className='block min-w-64'>
        Select a Form to Manage:
        <Select
          value={currentForm && { value: currentForm.id, label: currentForm.name }}
          options={forms.map(f => ({ value: f.id, label: f.name }))}
          onChange={({ value }: { value: number, label: string }) => setCurrentForm(value)}
        />
      </label>
      <button className='btn btn-secondary ml-auto self-center' onClick={e => setCurrentForm('new')}>
        <FontAwesomeIcon icon={faPlus} className='mr-2' />
        Create A New Form
      </button>
    </div>}
    <Switch>
      <Route path={`/workspace/${workspaceId}/forms/new`}>
        <NewForm workspaceId={workspaceId} onNewForm={f => setCurrentForm(f.id)} />
      </Route>
      <Route path={`/workspace/${workspaceId}/forms/:formId`} >
        {currentForm && <FormBuilder form={currentForm} workspaceId={workspaceId} />}
      </Route>
    </Switch>
  </main>
}
