import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { TextInput } from './TextInput'

export const FieldChoicesOptions = ({ className = '', style = {}, value: choices = [], onChange, label }) => {
  return <ul className={`space-y-2 ${className}`} style={style}>
    <h5>{label}</h5>
    <li className='flex'>
      <span className='flex-grow text-center text-sm'>Values</span>
      <span className='flex-grow text-center text-sm'>Labels</span>
    </li>
    {choices.map((choice, i) => <li key={i} className='flex space-x-2'>
      <TextInput
        className='flex-grow'
        value={choice.value}
        onChange={val => {
          const newChoices = choices.map(({ value, label }, index) => ({ value: index === i ? val : value, label }))

          onChange(newChoices)
        }}
        required
      />
      <TextInput
        className='flex-grow'
        value={choice.label}
        onChange={lab => {
          const newChoices = choices.map(({ value, label }, index) => ({ value, label: index === i ? lab : label }))

          onChange(newChoices)
        }}
        required
      />
      <button
        type='button'
        className='btn bg-red-500 hover:bg-red-600 text-white p-2'
        onClick={e => {
          const newChoices = choices.filter((choice, index) => index !== i)

          onChange(newChoices)
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </li>)}
    <li>
      <button
        type='button'
        className='btn bg-green-500 hover:bg-green-600 text-white p-2'
        onClick={e => {
          const newChoices = choices.concat([{ value: '', label: '' }])

          onChange(newChoices)
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </li>
  </ul>
}
