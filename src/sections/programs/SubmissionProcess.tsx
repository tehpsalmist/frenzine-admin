import { faMap, faSitemap, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useMemo, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { GraphView } from 'react-digraph'
import deepEqual from 'fast-deep-equal'
import { LegendInstructions } from '../../components'
import { SubmissionTrigger } from './SubmissionTrigger'
import { SubmissionStepDefinition } from './SubmissionStepDefinition'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_SUBMISSION_STEP_DEFINITIONS, CREATE_SUBMISSION_TRIGGERS, SUBMISSION_STEP_TYPES } from '../../graphql'
import { useLogError } from '../../hooks'
import { isNewId, stepMissingProperties } from '../../utilities'

const GraphConfig = {
  NodeTypes: {
    empty: {
      shapeId: "#empty",
      shape: (
        <symbol viewBox="0 0 100 60" id="empty" key="0">
          <rect width="100" height="60" rx="5"></rect>
        </symbol>
      )
    }
  },
  NodeSubtypes: {},
  EdgeTypes: {
    emptyEdge: {
      shapeId: "#emptyEdge",
      shape: (
        <symbol viewBox="0 0 50 50" id="emptyEdge" key="0">
          <circle cx="25" cy="25" r="8" fill="currentColor"> </circle>
        </symbol>
      )
    }
  }
}

export const SubmissionProcess = ({ className = '', style = {}, program }) => {
  const history = useHistory()
  const { params: { workspaceId } } = useRouteMatch<{ workspaceId: string }>(`/workspace/:workspaceId`) ?? { params: {} }

  const { data: { submission_step_type: types = [] } = {}, error: typesError } = useQuery(SUBMISSION_STEP_TYPES)

  const [createSteps] = useMutation(CREATE_SUBMISSION_STEP_DEFINITIONS)
  const [createTriggers] = useMutation(CREATE_SUBMISSION_TRIGGERS)

  const [recentlySaved, setRecentlySaved] = useState(false)

  useLogError('type-query', typesError)

  const [newNodeId, setNewNodeId] = useState(1)
  const [newEdgeId, setNewEdgeId] = useState(1)

  const [legend, setLegend] = useState<'legend' | 'object' | 'closed'>('legend')

  const { id } = useParams<{ id: string }>()
  const submissionProcess = program?.submission_processes?.find(proc => proc.id === Number(id))

  const [selectedId, setSelectedId] = useState(submissionProcess?.submission_step_definitions?.[0])

  const [existingNodes, setExistingNodes] = useState(submissionProcess?.submission_step_definitions ?? [])
  const [existingEdges, setExistingEdges] = useState(submissionProcess?.triggers ?? [])
  const [newNodes, setNewNodes] = useState([])
  const [newEdges, setNewEdges] = useState([])

  const updateObject = setter => updatedObject => setter((prevObjects) => {
    const index = prevObjects.findIndex(n => n.id === updatedObject.id)

    return [...prevObjects.slice(0, index), updatedObject, ...prevObjects.slice(index + 1)]
  })

  const deleteObject = setter => deleteId => setter((prevObjects) => {
    const index = prevObjects.findIndex(n => n.id === deleteId)

    return [...prevObjects.slice(0, index), ...prevObjects.slice(index + 1)]
  })

  const {
    nodes,
    edges
  } = useMemo(
    () => generateGraph(existingNodes, existingEdges, newNodes, newEdges),
    [existingNodes, existingEdges, newNodes, newEdges]
  )

  const selectedObject = existingNodes.find(n => n.id === selectedId) ||
    existingEdges.find(e => e.id === selectedId) ||
    newNodes.find(n => n.id === selectedId) ||
    newEdges.find(e => e.id === selectedId)

  const selectedVisual = nodes.find(n => n.id === selectedId) || edges.find(e => e.id === selectedId)

  const reset = (bypass = false) => {
    if (bypass || confirm('Are you sure? Your changes to this process will be lost permanently.')) {
      setLegend('closed')
      setSelectedId(null)
      setExistingNodes(submissionProcess?.submission_step_definitions ?? [])
      setExistingEdges(submissionProcess?.triggers ?? [])
      setNewNodes([])
      setNewEdges([])
      setRecentlySaved(false)
    }
  }

  const saveProcess = async () => {
    const typeMap = types.reduce((map, type) => ({ ...map, [type.name]: type }), {})

    // 1. exactly one starting node
    const startingNodes = []
    for (const node of [...existingNodes, ...newNodes]) {
      if (node.starting_step) {
        startingNodes.push(node)
      }
    }

    if (!startingNodes.length) {
      return alert('You have not configured a starting step.')
    }

    if (startingNodes.length !== 1) {
      return alert(`You have configured too many starting steps: ${startingNodes.map(node => node.name).join(', ')}`)
    }

    if ([...newEdges, ...existingEdges].some(trigger => trigger.to_step_id === startingNodes[0].id)) {
      return alert(`Your starting step (${startingNodes[0].name}) must be at the beginning of your graph`)
    }

    // 2. all properties accounted for
    const badNodes = []
    for (const node of [...existingNodes, ...newNodes]) {
      if (stepMissingProperties(typeMap[node.type_id]?.field_schema, node)) {
        badNodes.push(node)
      }
    }

    if (badNodes.length) {
      alert(`Steps ${badNodes.map(node => `"${node.name}"`).join(', ')} are missing required properties.`)
    }

    let badTriggers = []
    for (const trigger of [...existingEdges, ...newEdges]) {
      if (!trigger.from_step_id || !trigger.to_step_id || !trigger.submission_process_id) {
        badTriggers.push(trigger)
      }
    }

    if (badTriggers.length) {
      alert(`Triggers ${badTriggers.map(trigger => `"${trigger.name}"`).join(', ')} are missing required properties.`)
    }

    // 3. create new steps
    const response = await createSteps({
      variables: {
        definitions: newNodes.map(({
          id,
          eligibility_form_id,
          submission_form_id,
          third_party_request_form_id,
          profile_form_id,
          ...def
        }) => ({
          ...def,
          eligibility_form: eligibility_form_id ? { data: { submission_process_id: def.submission_process_id, frenzine_form_id: eligibility_form_id } } : undefined,
          submission_form: submission_form_id ? { data: { submission_process_id: def.submission_process_id, frenzine_form_id: submission_form_id } } : undefined,
          third_party_request_form: third_party_request_form_id ? { data: { submission_process_id: def.submission_process_id, frenzine_form_id: third_party_request_form_id } } : undefined,
          profile_form: profile_form_id ? { data: { submission_process_id: def.submission_process_id, frenzine_form_id: profile_form_id } } : undefined
        }))
      }
    })

    if (response.errors) {
      return console.error(response)
    }

    const returnedList = response.data?.insert_submission_step_definition?.returning ?? []

    const idMap = newNodes.reduce((map, { id: oldId }, i) => ({ ...map, [oldId]: returnedList[i].id }), {})

    const triggersToCreate = newEdges.map(trigger => ({
      from_step_id: isNewId(trigger.from_step_id) ? idMap[trigger.from_step_id] : trigger.from_step_id,
      to_step_id: isNewId(trigger.to_step_id) ? idMap[trigger.to_step_id] : trigger.to_step_id,
      submission_process_id: trigger.submission_process_id,
      eligibility_outcome: trigger.eligibility_outcome,
      record_match: trigger.record_match,
      default: trigger.default,
      wait_for_other_triggers: trigger.wait_for_other_triggers,
      name: trigger.name
    }))

    // 4. create new triggers
    const triggersResponse = await createTriggers({
      variables: {
        triggers: triggersToCreate
      }
    })

    if (triggersResponse.errors) {
      return console.error(triggersResponse)
    }

    setNewEdges([])
    setNewNodes([])
    setSelectedId(null)
  }

  useEffect(() => {
    if (!deepEqual(existingEdges, submissionProcess?.triggers ?? [])) {
      setExistingEdges(submissionProcess?.triggers ?? [])
    }

    if (!deepEqual(existingNodes, submissionProcess?.submission_step_definitions ?? [])) {
      setExistingNodes(submissionProcess?.submission_step_definitions ?? [])
    }
  }, [submissionProcess])

  const isDirty = useMemo(() => {
    return newNodes.length ||
      newEdges.length ||
      !deepEqual(existingNodes, submissionProcess?.submission_step_definitions ?? []) ||
      !deepEqual(existingEdges, submissionProcess?.triggers ?? [])
  }, [existingNodes, existingEdges, newNodes, newEdges])

  useEffect(() => {
    if (program && !submissionProcess) {
      history.push(`/workspace/${workspaceId}/programs/${program.id}`)
    }
  }, [program, submissionProcess])

  if (!submissionProcess) {
    return <span>Loading...</span>
  }

  return <div className={`${className} flex flex-col items-stretch`} style={style}>
    <h2 className='text-center'>{submissionProcess.name}</h2>
    <div className='flex-center flex-grow relative'>
      {isDirty && <div className='absolute pr-1 md:pr-2 pt-1 md:pt-2 top-0 right-0 z-30'>
        <button onClick={e => reset()} className='btn btn-primary p-2 mr-2'>Reset</button>
        <button onClick={e => saveProcess()} className='btn btn-secondary p-2'>Save</button>
      </div>}
      <GraphView
        nodeKey={'id'}
        nodes={nodes}
        edges={edges}
        selected={selectedVisual}
        nodeTypes={GraphConfig.NodeTypes}
        nodeSubtypes={GraphConfig.NodeSubtypes}
        edgeTypes={GraphConfig.EdgeTypes}
        onSelectNode={node => {
          setSelectedId(node?.id)

          if (node?.id) {
            setLegend('object')
          }
        }}
        onCreateNode={(visual_x, visual_y) => {
          const newId = `newNode-${newNodeId}`

          setNewNodes(n => [...n, {
            id: newId,
            submission_process_id: Number(id),
            name: `New Step ${newNodeId}`,
            visual_x,
            visual_y,
            starting_step: !nodes.length
          }])

          setSelectedId(newId)

          setNewNodeId(n => n + 1)
        }}
        onUpdateNode={({ x, y, type: remove, ...node }) => isNewId(node.id)
          ? updateObject(setNewNodes)({ ...node, visual_x: x, visual_y: y })
          : updateObject(setExistingNodes)({ ...node, visual_x: x, visual_y: y })}
        onDeleteNode={({ id }) => setNewNodes(pe => pe.filter(e => e.id !== id))}
        onSelectEdge={edge => {
          setSelectedId(edge?.id)

          if (edge?.id) {
            setLegend('object')
          }
        }}
        onCreateEdge={(from, to) => {
          const newId = `newEdge-${newEdgeId}`

          setNewEdges(e => [...e, {
            id: newId,
            submission_process_id: Number(id),
            from_step_id: from.id,
            to_step_id: to.id,
            wait_for_other_triggers: true,
            name: `${from.name ?? ''} to ${to.name ?? ''}`
          }])

          setSelectedId(newId)

          setNewEdgeId(e => e + 1)
        }}
        onSwapEdge={(from, to, trigger) => isNewId(trigger.id)
          ? updateObject(setNewEdges)({ ...trigger, from_step_id: from.id, to_step_id: to.id })
          : updateObject(setExistingEdges)({ ...trigger, from_step_id: from.id, to_step_id: to.id })}
        onDeleteEdge={({ id }) => setNewEdges(pe => pe.filter(e => e.id !== id))}
        canCreateEdge={() => true}
        gridDotSize={1}
        nodeSize={250}
        renderNodeText={renderNodeText}
        centerNodeOnMove={false}
        canDeleteNode={() => false}
        canDeleteEdge={() => false}
      />
      <div className='z-30 fixed right-0 bottom-0 max-w-md max-h-sm controls-grid'>
        {legend !== 'closed' && <button
          className={`text-xl controls-close border bg-white`}
          onClick={e => setLegend('closed')}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>}
        <button
          className={`text-xl controls-object border ${legend === 'object' ? 'bg-primary-600 text-white' : 'bg-white'}`}
          onClick={e => setLegend('object')}
        >
          <FontAwesomeIcon icon={faSitemap} />
        </button>
        <button
          className={`text-xl controls-legend border ${legend === 'legend' ? 'bg-primary-600 text-white' : 'bg-white'}`}
          onClick={e => setLegend('legend')}
        >
          <FontAwesomeIcon icon={faMap} />
        </button>
        {legend !== 'closed' && <div className='controls-content h-sm w-sm overflow-y-scroll bg-white rounded-tl-md shadow-md'>
          {legend === 'legend' && <LegendInstructions />}
          {legend === 'object' && (selectedObject
            ? selectedObject.from_step_id
              ? <SubmissionTrigger
                trigger={selectedObject}
                triggers={edges}
                nodes={nodes}
                onChange={isNewId(selectedObject.id) ? updateObject(setNewEdges) : updateObject(setExistingEdges)}
                onDelete={isNewId(selectedObject.id) ? deleteObject(setNewEdges) : deleteObject(setExistingEdges)}
              />
              : <SubmissionStepDefinition
                stepDef={selectedObject}
                onChange={isNewId(selectedObject.id) ? updateObject(setNewNodes) : updateObject(setExistingNodes)}
                onDelete={isNewId(selectedObject.id) ? deleteObject(setNewNodes) : deleteObject(setExistingNodes)}
                triggers={edges}
                deleteTriggers={ids => {
                  setExistingEdges(e => e.filter(edge => ids.every(deleteId => deleteId !== edge.id)))
                  setNewEdges(e => e.filter(edge => ids.every(deleteId => deleteId !== edge.id)))
                }}
                types={types}
              />
            : <p className='flex-center'>Select a Step or Trigger</p>)}
        </div>}
      </div>
    </div>
  </div>
}

function generateGraph (steps, triggers, newSteps = [], newEdges = []) {
  return {
    nodes: newSteps.map(step => ({
      ...step,
      x: step.visual_x,
      y: step.visual_y,
      type: 'empty'
    })).concat(steps?.map(step => ({
      ...step,
      x: step.visual_x ?? 800,
      y: step.visual_y ?? 800,
      type: 'empty'
    })) ?? []),
    edges: newEdges.map(trigger => ({
      ...trigger,
      type: 'emptyEdge',
      source: trigger.from_step_id,
      target: trigger.to_step_id
    })).concat(triggers?.map(trigger => ({
      ...trigger,
      type: 'emptyEdge',
      source: trigger.from_step_id,
      target: trigger.to_step_id
    })) ?? [])
  }
}

const renderNodeText = (data, id, isSelected) => {
  const textSize = getTextSize(data.name)

  return <foreignObject x='-125' y='-75' width='250' height='150'>
    <h4 className={`flex-center h-full rounded-full p-2 break-all ${isSelected ? 'text-white' : 'text-primary-600'} ${textSize}`}>{data.name}</h4>
  </foreignObject>
}

function getTextSize (name = '') {
  switch (true) {
    case (name.length < 14):
      return 'text-3xl'
    case (name.length < 19):
      return 'text-2xl'
    case (name.length < 24):
      return 'text-xl'
    case (name.length < 50):
      return 'text-lg'
    default:
      return 'text-base'
  }
}
