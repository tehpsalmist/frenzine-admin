import { useMutation } from '@apollo/client'
import React, { useState, StyleHTMLAttributes } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { TextInput } from '../../components'
import { CREATE_FORM, FORM_NAMES } from '../../graphql'

interface NewFormProps {
  className?: string
  style?: StyleHTMLAttributes<HTMLElement>
  workspaceId: number
  onNewForm (form: { id: number, name: string, purpose?: string }): void
}

export const NewForm = ({ className = '', style = {}, workspaceId, onNewForm }: NewFormProps) => {
  const history = useHistory()
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')

  const [createForm] = useMutation(CREATE_FORM, {
    update (cache, { data: { insert_form_one } }) {
      const { form: forms } = cache.readQuery({ query: FORM_NAMES, variables: { workspaceId } })

      cache.writeQuery({
        query: FORM_NAMES,
        variables: { workspaceId },
        data: {
          form: [
            ...forms,
            insert_form_one
          ]
        }
      })
    }
  })

  return <section className={className} style={style}>
    <form
      onSubmit={async e => {
        e.preventDefault()

        const data = await createForm({
          variables: {
            name,
            purpose,
            workspaceId
          }
        })

        const form = data.data?.insert_frenzine_form_one

        if (form) {
          onNewForm(form)
        }
      }}
      className='flex-center flex-col'
    >
      <h2 className='my-12 text-xl'>New Frenzine Form</h2>
      <TextInput value={name} onChange={setName} label='Form Name' className='mb-4 w-sm' />
      <TextInput value={purpose} onChange={setPurpose} label='Form Purpose' className='mb-4 w-sm' />
      <div className='flex mt-4 space-x-2'>
        <button type='submit' className='btn btn-secondary' disabled={!name}>Create Form</button>
        <button type='button' className='btn' onClick={e => history.goBack()}>Cancel</button>
      </div>
    </form>
  </section>
}
