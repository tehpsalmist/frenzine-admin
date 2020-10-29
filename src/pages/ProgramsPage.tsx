import React, { useMemo, useState } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import Select, { OptionsType, OptionTypeBase } from 'react-select'
import { faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLogError } from '../hooks'
import { NavLink, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { ProgramMetaData, SubmissionProcess, SubmissionProcesses } from '../sections/programs'
import { FULL_PROGRAM, PROGRAM_NAMES } from '../graphql'

const navClasses = `w-full py-3 hover:bg-primary-600`
const activeNavClass = `bg-primary-700`

export const ProgramsPage = ({ className = '', style = {}, workspaceId }) => {
  const [navOpen, setNavOpen] = useState(true)
  const history = useHistory()
  const { params: { programId } } = useRouteMatch<{ programId: string }>(`/workspace/${workspaceId}/programs/:programId`) ?? { params: {} }

  const { data: { program: programs = [] } = {}, error } = useQuery(PROGRAM_NAMES, {
    variables: {
      workspaceId
    }
  })

  const currentProgram = useMemo(() => {
    return programs.find(p => p.id === Number(programId))
  }, [programs, programId])

  const setCurrentProgram = (newProgramId: number | string) => {
    if (newProgramId !== programId && newProgramId !== Number(programId)) {
      history.push(`/workspace/${workspaceId}/programs/${newProgramId}`)
    }
  }

  const { data: { program_by_pk: program } = {}, error: programSubError } = useSubscription(FULL_PROGRAM, {
    variables: {
      id: programId
    },
    skip: !currentProgram?.id
  })

  useLogError('program-names', error)
  useLogError('program-sub', programSubError)

  return <main className={`h-content program-grid ${navOpen ? 'nav-open' : ''}`}>
    <aside className='bg-primary-500 text-white flex flex-col sidenav relative transition-all duration-300'>
      <button className='self-start ml-4 mt-2 mb-8 focus:outline-none text-2xl' onClick={e => setNavOpen(n => !n)}>
        <FontAwesomeIcon icon={faChevronRight} className={`duration-300 transition-all transform ${navOpen ? 'rotate-180' : ''}`} />
      </button>
      <label className={`mb-8 px-1 ${navOpen ? 'w-full' : 'z-30 w-56 absolute left-12 text-primary-600'}`}>
        Program
        <Select
          className='text-primary-600'
          value={programs.find(p => p.id === Number(programId))}
          options={[{ id: 'new', name: '+ Create New Program' }].concat(programs)}
          getOptionLabel={opt => opt.name}
          getOptionValue={opt => String(opt.id)}
          onChange={({ id }) => setCurrentProgram(id)}
        />
      </label>
      {navOpen && program && <ul className='flex flex-col'>
        <NavLink to={`/workspace/${workspaceId}/programs/${programId}`} className={`${navClasses} pl-1`}>
          Submission Processes
        </NavLink>
        {program.submission_processes.map(proc => <NavLink
          key={proc.id}
          className={`${navClasses} pl-4`}
          activeClassName={activeNavClass}
          to={`/workspace/${workspaceId}/programs/${programId}/submission-processes/${proc.id}`}
        >
          {proc.name}
        </NavLink>)}
      </ul>}
    </aside>
    <Switch>
      <Route path={`/workspace/${workspaceId}/programs/:id/submission-processes/new`}>
        <div className='content'>
          <ProgramMetaData program={program} className='max-w-xl mx-auto my-16' />
          <SubmissionProcesses program={program} />
        </div>
      </Route>
      <Route path={`/workspace/${workspaceId}/programs/:programId/submission-processes/:id`}>
        <SubmissionProcess program={program} className='content' />
      </Route>
      <Route path={`/workspace/${workspaceId}/programs/new`}>
        <div className='max-w-3xl my-auto rounded-md shadow-md mx-auto p-2 sm:p-4 content'>
          <ProgramMetaData workspaceId={workspaceId} />
        </div>
      </Route>
      <Route path={`/workspace/${workspaceId}/programs/:id`}>
        <div className='content'>
          <ProgramMetaData program={program} className='max-w-xl mx-auto my-16' />
          <SubmissionProcesses program={program} />
        </div>
      </Route>
      <Route path={`/workspace/${workspaceId}/programs`}>
        <div className='flex-center mt-24 content'>Choose A Program or Create a New One</div>
      </Route>
    </Switch>
  </main>
}
