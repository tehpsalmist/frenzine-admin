import { gql } from '@apollo/client'

export const FORM_NAMES = gql`
  query FormNames ($workspaceId: Int!) {
    frenzine_form (where: { workspace_id: { _eq: $workspaceId } }) {
      id
      name
    }
  }
`

export const WORKSPACE_NAMES = gql`
  query WorkspaceNames {
    workspace {
      id
      name
    }
  }
`

export const PROGRAM_NAMES = gql`
  query ProgramNames ($workspaceId: Int!) {
    program (where: { workspace_id: { _eq: $workspaceId } }) {
      id
      name
    }
  }
`

export const FIELD_TYPES = gql`
  query FieldTypes {
    frenzine_field_type {
      id
      name
      display_name
      is_data
      is_calculated
      is_presentational
    }
  }
`

export const SUBMISSION_STEP_TYPES = gql`
  query SubmissionStepTypes {
    submission_step_type (order_by: { id: asc }) {
      id
      name
      display_name
      description
      field_schema
    }
  }
`
