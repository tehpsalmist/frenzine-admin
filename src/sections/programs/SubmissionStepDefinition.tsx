import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { TextInput, Checkbox, FormSelect } from '../../components'
import { useLogError } from '../../hooks'

export const SubmissionStepDefinition = ({
  className = '',
  style = {},
  stepDef,
  triggers,
  onChange,
  onDelete,
  deleteTriggers,
  types = []
}) => {
  const [currentType, setCurrentType] = useState(() => types?.find(type => type.name === stepDef?.type_id) ?? null)

  useEffect(() => {
    setCurrentType(types?.find(type => type.name === stepDef?.type_id) ?? null)
  }, [types, stepDef])

  return <div className={`space-y-4 p-2 min-h-full overflow-y-scroll ${className}`} style={style}>
    <h3 className='text-center text-lg'>Step</h3>
    <label>
      Step Type
      <Select
        options={types}
        getOptionLabel={t => t.display_name}
        getOptionValue={t => t.name}
        onChange={stepType => onChange({ ...stepDef, type_id: stepType.name })}
        value={currentType}
      />
    </label>
    {memberOfType(currentType?.field_schema, 'name') && <TextInput
      label='Name'
      value={stepDef?.name || ''}
      onChange={name => onChange({ ...stepDef, name })}
    />}
    {memberOfType(currentType?.field_schema, 'is_listing') && <Checkbox
      label='Listing'
      value={stepDef?.is_listing || false}
      onChange={is_listing => onChange({ ...stepDef, is_listing })}
    />}
    {memberOfType(currentType?.field_schema, 'starting_step') && <Checkbox
      label='Starting Step'
      value={stepDef?.starting_step || false}
      onChange={starting_step => onChange({ ...stepDef, starting_step })}
    />}
    {/* Eligibility Criteria */}
    {memberOfType(currentType?.field_schema, 'submission_form_id') && <FormSelect value={stepDef?.submission_form_id ?? stepDef?.submission_form?.form?.id} onChange={submission_form_id => onChange({ ...stepDef, submission_form_id })} label='Submission Form' />}
    {memberOfType(currentType?.field_schema, 'eligibility_form_id') && <FormSelect value={stepDef?.eligibility_form_id ?? stepDef?.eligibility_form?.form?.id} onChange={eligibility_form_id => onChange({ ...stepDef, eligibility_form_id })} label='Eligibility Form' />}
    {memberOfType(currentType?.field_schema, 'third_party_request_form_id') && <FormSelect value={stepDef?.third_party_request_form_id ?? stepDef?.third_party_request_form?.form?.id} onChange={third_party_request_form_id => onChange({ ...stepDef, third_party_request_form_id })} label='Third Party Request Form' />}
    {memberOfType(currentType?.field_schema, 'profile_form_id') && <FormSelect value={stepDef?.profile_form_id ?? stepDef?.profile_form?.form?.id} onChange={profile_form_id => onChange({ ...stepDef, profile_form_id })} label='Profile Form' />}
    {stepDef?.id && <button
      className='btn p-2 block mx-auto text-white bg-red-500 hover:bg-red-600'
      onClick={e => {
        onDelete(stepDef.id)
        deleteTriggers(triggers
          .filter(trigger => trigger.to_step_id === stepDef.id || trigger.from_step_id === stepDef.id)
          .map(trigger => trigger.id))
      }}
    >
      Delete Step
    </button>}
  </div>
}

function memberOfType (fieldSchema: { [key: string]: { required: boolean } }, member: string): boolean {
  return !!fieldSchema?.[member]
}
