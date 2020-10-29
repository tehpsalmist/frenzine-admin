import React from 'react'

export const LegendInstructions = ({ className = '', style = {} }) => {
  return <div className='p-4'>
    <p className='mb-4'><strong>Hold Shift and Click</strong> anywhere to create a new Step.</p>
    <p className='mb-4'><strong>Hold Shift, then Click and Drag</strong> from one Step to another to create a new Trigger.</p>
  </div>
}
