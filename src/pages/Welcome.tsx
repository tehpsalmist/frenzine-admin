import React from 'react'

export const Welcome = ({ className = '', style = {} }) => {
  return <main className='min-h-content flex-center flex-col text-primary-500'>
    <h1 className='text-2xl'>Welcome to Frenzine!</h1>
    <p>Choose a workspace or create a new one to get started.</p>
  </main>
}
