import { useMutation } from '@apollo/client'
import React, { StyleHTMLAttributes, useEffect, useState } from 'react'
import { TextInput } from '../../components'
import deepEqual from 'fast-deep-equal'
import { CREATE_PROGRAM, PROGRAM_NAMES, UPDATE_PROGRAM_METADATA } from '../../graphql'
import { useHistory } from 'react-router-dom'

interface ProgramMetaDataProps {
  className?: string
  style?: StyleHTMLAttributes<HTMLElement>
  program?: {
    id: number
    name: string
    slug: string
  }
  workspaceId?: number
  onSave?(program: { id: number, name: string, slug?: string }): any | void
}

export const ProgramMetaData = ({ className = '', style = {}, program, workspaceId, onSave = () => { } }: ProgramMetaDataProps) => {
  const history = useHistory()
  const [name, setName] = useState(program?.name || '')
  const [slug, setSlug] = useState(program?.slug || '')

  const [createProgram, { data: { insert_program_one: { id: newProgramId } = { id: 0 } } = {} }] = useMutation(CREATE_PROGRAM)
  const [updateProgram] = useMutation(UPDATE_PROGRAM_METADATA)

  useEffect(() => {
    if (newProgramId) {
      history.push(`/workspace/${workspaceId}/programs/${newProgramId}`)
    }
  }, [newProgramId])

  useEffect(() => {
    if (program) {
      setName(program.name)
      setSlug(program.slug)
    }
  }, [program])

  const isDirty = !deepEqual({ name: program?.name, slug: program?.slug }, { name, slug })

  return <form className={`space-y-4 ${className}`} style={style} onSubmit={async e => {
    e.preventDefault()

    const errorMaybe = program?.id
      ? await updateProgram({
        variables: {
          id: program.id,
          name,
          slug
        }
      })
      : await createProgram({
        variables: {
          workspaceId,
          name,
          slug
        },
        update (cache, { data: { insert_program_one } }) {
          const { program: programs } = cache.readQuery({ query: PROGRAM_NAMES, variables: { workspaceId } })

          cache.writeQuery({
            query: PROGRAM_NAMES,
            variables: { workspaceId },
            data: {
              program: [
                ...programs,
                insert_program_one
              ]
            }
          })
        }
      })

    if (errorMaybe.errors) {
      return console.error(errorMaybe)
    }

    onSave(errorMaybe.data[program?.id ? 'update_program_by_pk' : 'insert_program_one'])
  }}>
    <TextInput value={name} onChange={setName} label='Program Name' />
    <TextInput value={slug} onChange={setSlug} label='Program URL Slug' />
    {(isDirty || !program?.id) && <button
      type='submit'
      disabled={!isDirty}
      className={`btn ${program?.id ? 'btn-primary' : 'btn-secondary'} mx-auto block`}
    >
      {program?.id ? 'Update Program' : 'Create Program'}
    </button>}
  </form>
}
