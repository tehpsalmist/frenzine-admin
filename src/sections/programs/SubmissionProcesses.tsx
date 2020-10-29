import { useMutation } from '@apollo/client'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { NavLink, useHistory, useRouteMatch } from 'react-router-dom'
import { TextInput } from '../../components'
import { CREATE_SUBMISSION_PROCESS } from '../../graphql'

const navClasses = `flex-center w-64 h-48 m-2 border border-secondary-300 bg-secondary-100 text-secondary-600 rounded-lg text-center hover:bg-secondary-200 hover:text-secondary-700 shadow-lg transition-all duration-300`

export const SubmissionProcesses = ({ className = '', style = {}, program }) => {
  const { params: { workspaceId, id } } = useRouteMatch<{ workspaceId: string, id: string }>([
    `/workspace/:workspaceId/programs/:programId/submission-processes/:id`,
    `/workspace/:workspaceId`
  ]) ?? { params: {} }
  const history = useHistory()
  const [name, setName] = useState('')

  const [createSubmissionProcess] = useMutation(CREATE_SUBMISSION_PROCESS)

  return <div>
    <h2 className='text-center text-2xl mb-16'>Submission Processes</h2>
    {program?.submission_processes?.length && id !== 'new'
      ? <ul className='flex flex-wrap justify-evenly'>
        {program.submission_processes.map(proc => (
          <NavLink
            key={proc.id}
            to={`/workspace/${workspaceId}/programs/${program.id}/submission-processes/${proc.id}`}
            className={navClasses}
          >
            {proc.name}
          </NavLink>
        ))}
        <NavLink
          to={`/workspace/${workspaceId}/programs/${program.id}/submission-processes/new`}
          className={navClasses}
        >
          <FontAwesomeIcon icon={faPlus} className='mr-2' />
          New Submission Process
        </NavLink>
      </ul>
      : <form className='flex-center flex-col space-y-4 mt-24' onSubmit={async e => {
        e.preventDefault()

        const errorMaybe = await createSubmissionProcess({
          variables: {
            name,
            programId: program?.id
          }
        })

        if (errorMaybe.errors) {
          return console.error(errorMaybe)
        }

        const id = errorMaybe.data?.insert_submission_process_one?.id

        history.push(`/workspace/${workspaceId}/programs/${program.id}/submission-processes/${id}`)
      }}>
        <h3 className='text-xl'>Create A Submission Process</h3>
        <TextInput value={name} onChange={setName} placeholder='Name your process' />
        <button type='submit' className='btn btn-secondary'>Create</button>
      </form>}
  </div>
}
