import React, { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import { Checkbox, TextInput } from '../../components'

export const SubmissionTrigger = ({ className = '', style = {}, trigger, triggers, nodes, onChange, onDelete }) => {
  const [currentFrom, setCurrentFrom] = useState(() => nodes?.find(stepDef => stepDef.id === trigger?.from_step_id))
  const [currentTo, setCurrentTo] = useState(() => nodes?.find(stepDef => stepDef.id === trigger?.to_step_id))

  useEffect(() => {
    setCurrentFrom(nodes?.find(stepDef => stepDef.id === trigger?.from_step_id) ?? null)
    setCurrentTo(nodes?.find(stepDef => stepDef.id === trigger?.to_step_id) ?? null)
  }, [nodes, trigger])

  const hasSiblingEdges = useMemo(() => {
    return triggers.some(trig => trig.id !== trigger.id && trig.to_step_id === trigger.to_step_id)
  }, [trigger, triggers])

  return <div className={`space-y-2 p-2 min-h-full overflow-y-scroll ${className}`} style={style}>
    <h3 className='text-center text-lg'>Trigger</h3>
    <TextInput label='Name' value={trigger?.name ?? ''} onChange={name => onChange({ ...trigger, name })} />
    <label className='block'>
      From Step
      <Select
        getOptionLabel={opt => opt.name}
        getOptionValue={opt => opt.id}
        options={nodes || []}
        onChange={stepDef => onChange({ ...trigger, from_step_id: stepDef.id })}
        value={currentFrom}
      />
    </label>
    <label className='block'>
      To Step
      <Select
        getOptionLabel={opt => opt.name}
        getOptionValue={opt => opt.id}
        options={nodes || []}
        onChange={stepDef => onChange({ ...trigger, to_step_id: stepDef.id })}
        value={currentTo}
      />
    </label>
    <Checkbox label='Default Path' value={trigger?.default ?? false} onChange={d => onChange({ ...trigger, default: d })} />
    {hasSiblingEdges && <Checkbox label='Wait for Other Triggers' value={trigger?.wait_for_other_triggers ?? false} onChange={wait => onChange({ ...trigger, wait_for_other_triggers: wait })} />}
    {/* Eligibility Outcome */}
    {/* Record Matching */}
    {trigger?.id && <button onClick={e => onDelete(trigger.id)} className='btn p-2 block mx-auto text-white bg-red-500 hover:bg-red-600'>Delete Trigger</button>}
  </div>
}
