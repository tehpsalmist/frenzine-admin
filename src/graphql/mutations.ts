import gql from 'graphql-tag'

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace ($name: String!) {
    insert_workspace_one(object: { name: $name }) {
      id
      name
    }
  }
`

export const CREATE_FORM = gql`
  mutation CreateForm ($name: String!, $workspaceId: Int!, $purpose: String) {
    insert_frenzine_form_one(object: { name: $name, workspace_id: $workspaceId, purpose: $purpose }) {
      id
      name
      purpose
    }
  }
`

export const UPDATE_FORM_METADATA = gql`
  mutation UpdateFormMetadata ($id: Int!, $name: String, $purpose: String) {
    update_frenzine_form_by_pk(pk_columns: { id: $id }, _set: { name: $name, purpose: $purpose }) {
      id
    }
  }
`

export const CREATE_FIELD = gql`
  mutation CreateField (
    $name: String!,
    $label: String!,
    $description: String,
    $type_id: Int!,
    $validation: jsonb,
    $properties: jsonb,
    $formId: Int!
  ) {
    insert_frenzine_field_one(object: {
      name: $name,
      label: $label,
      description: $description,
      type_id: $type_id,
      validation: $validation,
      properties: $properties,
      frenzine_form_id: $formId
    }) {
      id
    }
  }
`

export const UPDATE_FIELD = gql`
  mutation UpdateField (
    $id: Int!,
    $name: String,
    $label: String,
    $description: String,
    $validation: jsonb,
    $properties: jsonb
  ) {
    update_frenzine_field_by_pk(pk_columns: { id: $id }, _set: {
      name: $name,
      label: $label,
      description: $description,
      validation: $validation,
      properties: $properties
    }) {
      id
    }
  }
`

export const UPDATE_RECORD_VALUE = gql`
  mutation UpdateRecordValue ($id: Int!, $value: jsonb) {
    update_frenzine_record_value_by_pk(pk_columns: { id: $id }, _set: { value: $value }) {
      id
    }
  }
`

export const SAVE_RECORD = gql`
  mutation SaveRecord ($recordId: Int, $formId: Int, $values: [frenzineRecordValue]!, $is_complete: Boolean) {
    upsertFrenzineRecord(values: $values, formId: $formId, recordId: $recordId, is_complete: $is_complete) {
      id
    }
  }
`

export const CREATE_PROGRAM = gql`
  mutation CreateProgram ($workspaceId: Int!, $name: String!, $slug: String!) {
    insert_program_one(object: { workspace_id: $workspaceId, name: $name, slug: $slug }) {
      id
      name
      slug
    }
  }
`

export const UPDATE_PROGRAM_METADATA = gql`
  mutation UpdateProgram ($id: Int!, $name: String, $slug: String) {
    update_program_by_pk(pk_columns: { id: $id }, _set: { name: $name, slug: $slug }) {
      id
      name
      slug
    }
  }
`

export const CREATE_SUBMISSION_PROCESS = gql`
  mutation CreateSubmissionProcess ($programId: Int!, $name: String!) {
    insert_submission_process_one(object: {program_id: $programId, name: $name}) {
      id
    }
  }
`

export const CREATE_SUBMISSION_STEP_DEFINITIONS = gql`
  mutation CreateSubmissionStepDefinitions ($definitions: [submission_step_definition_insert_input!]!) {
    insert_submission_step_definition(objects: $definitions) {
      returning {
        id
      }
    }
  }
`

export const CREATE_SUBMISSION_TRIGGERS = gql`
  mutation CreateSubmissionTriggers ($triggers: [submission_trigger_insert_input!]!) {
    insert_submission_trigger(objects: $triggers) {
      returning {
        id
      }
    }
  }
`
