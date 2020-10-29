import { useQuery } from '@apollo/client'
import React, { ReactElement, useMemo } from 'react'
import { NavLink, Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import Select from 'react-select'
import { WORKSPACE_NAMES } from './graphql'
import { useLogError } from './hooks'
import { CreateWorkspace, Welcome, Workspace } from './pages'

const navClasses = `h-full flex-center px-2 md:px-4 hover:bg-secondary-100 transition-all duration-300`
const activeNavClass = `bg-secondary-300`

export const App = (): ReactElement => {
  const { params } = useRouteMatch<{ id: string | null }>('/workspace/:id') ?? { params: { id: null } }

  const { data: { workspace: workspaces = [] } = {}, error } = useQuery(WORKSPACE_NAMES)

  const history = useHistory()

  useLogError('workspace-names', error)

  const [currentWorkspace, options, notEmpty] = useMemo(() => {
    const opts: { value: string | number | null, label: string }[] = [
      { value: null, label: 'Home' },
      { value: 'new', label: 'Create A New Workspace' }
    ]
      .concat(workspaces.map(({ id: value, name: label }) => ({ label, value })))

    const cw = opts.find(w => w.value === params.id || w.value === Number(params.id))

    return [cw, opts, cw && cw.value && cw.value !== 'new']
  }, [params.id, workspaces])

  const onSelectWorkspace = ({ value }) => {
    if (value !== currentWorkspace.value) {
      history.push(value === null ? `/` : `/workspace/${value}`)
    }
  }

  return <>
    <nav className='w-full flex items-center h-12 bg-secondary-200 text-primary-500'>
      <Select value={currentWorkspace} onChange={onSelectWorkspace} options={options} className='min-w-48 mx-2'></Select>
      {notEmpty && <NavLink activeClassName={activeNavClass} className={navClasses} to={`/workspace/${currentWorkspace.value}/data`}>Data</NavLink>}
      {notEmpty && <NavLink activeClassName={activeNavClass} className={navClasses} to={`/workspace/${currentWorkspace.value}/forms`}>Forms</NavLink>}
      {notEmpty && <NavLink activeClassName={activeNavClass} className={navClasses} to={`/workspace/${currentWorkspace.value}/programs`}>Programs</NavLink>}
    </nav>
    <Switch>
      <Route path='/workspace/new'>
        <CreateWorkspace />
      </Route>
      <Route path='/workspace/:id'>
        <Workspace name={currentWorkspace?.label} id={currentWorkspace?.value} />
      </Route>
      <Redirect path='/workspace' to='/' />
      <Route path='/' exact>
        <Welcome />
      </Route>
      <Redirect to='/' />
    </Switch>
  </>
}