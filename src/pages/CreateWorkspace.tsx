import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { CREATE_WORKSPACE, WORKSPACE_NAMES } from '../graphql'
import { useLogError } from '../hooks'

export const CreateWorkspace = ({ className = '', style = {} }) => {
  const history = useHistory()
  const [workspaceName, setWorkspaceName] = useState('')
  const [createWorkspace, { data: { insert_workspace_one: { id = null } = {} } = {}, error }] = useMutation(CREATE_WORKSPACE, {
    update (cache, { data: { insert_workspace_one } }) {
      const { workspace: workspaces } = cache.readQuery({ query: WORKSPACE_NAMES })

      cache.writeQuery({
        query: WORKSPACE_NAMES, data: {
          workspace: [
            ...workspaces,
            insert_workspace_one
          ]
        }
      })
    }
  })

  useEffect(() => {
    if (id) {
      history.push(`/workspace/${id}`)
    }
  }, [id])

  useLogError('create-workspace', error)

  return <main className='min-h-content flex-center flex-col'>
    <label className='flex flex-col items-center'>
      Name Your Workspace:
      <input className='text-input' value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} />
    </label>
    <button className='btn btn-secondary mt-4' onClick={e => createWorkspace({ variables: { name: workspaceName } })}>Create Workspace</button>
  </main>
}
