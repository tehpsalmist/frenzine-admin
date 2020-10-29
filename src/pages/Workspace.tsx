import React from 'react'
import { NavLink, Route, Switch } from 'react-router-dom'
import { DataPage } from './DataPage'
import { FormsPage } from './FormsPage'
import { ProgramsPage } from './ProgramsPage'

const navButtonClasses = `flex-center w-64 h-64 m-2 border border-secondary-300 bg-secondary-100 text-secondary-600 rounded-lg text-center hover:bg-secondary-200 hover:text-secondary-700 shadow-lg transition-all duration-300`

export const Workspace = ({ className = '', style = {}, name, id: workspaceId }) => {
  return <Switch>
    <Route path={`/workspace/${workspaceId}/`} exact>
      <main className='flex flex-col min-h-content items-center justify-evenly'>
        <h2 className='text-xl'>Welcome to {name} (ID: {workspaceId})</h2>
        <div className='flex justify-evenly flex-wrap'>
          <NavLink className={navButtonClasses} to={`/workspace/${workspaceId}/data`}>View Record Data</NavLink>
          <NavLink className={navButtonClasses} to={`/workspace/${workspaceId}/forms`}>Manage Frenzine Forms</NavLink>
          <NavLink className={navButtonClasses} to={`/workspace/${workspaceId}/programs`}>Manage {name} Programs</NavLink>
        </div>
      </main>
    </Route>
    <Route path={`/workspace/${workspaceId}/data`}>
      <DataPage workspaceId={workspaceId} />
    </Route>
    <Route path={`/workspace/${workspaceId}/forms`}>
      <FormsPage workspaceId={workspaceId} />
    </Route>
    <Route path={`/workspace/${workspaceId}/programs`}>
      <ProgramsPage workspaceId={workspaceId} />
    </Route>
  </Switch>
}
