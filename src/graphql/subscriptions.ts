import gql from 'graphql-tag'

export const FRENZINE_FORMS = gql`
  subscription FrenzineFormsSub ($workspaceId: Int!) {
    frenzine_form (where: { workspace_id: { _eq: $workspaceId } }) {
      id
      name
      purpose
      fields (order_by: { order: asc }) {
        id
        label
        name
        description
        rules
        order
        properties
        validation
        type {
          id
          name
          display_name
          is_calculated
          is_data
          is_presentational
        }
      }
    }
  }
`;

export const FRENZINE_FORMS_DATA_FIELDS = gql`
  subscription FrenzineFormsDataFieldsSub ($workspaceId: Int!) {
    frenzine_form (where: { workspace_id: { _eq: $workspaceId } }) {
      id
      name
      purpose
      fields (order_by: { order: asc }, where: { type: { is_data: { _eq: true } } }) {
        id
        label
        name
        description
        rules
        order
        properties
        validation
        type {
          id
          name
          display_name
          is_calculated
          is_data
          is_presentational
        }
      }
    }
  }
`

export const FRENZINE_RECORDS = gql`
  subscription FrenzineRecords ($formId: Int!, $limit: Int = 100, $offset: Int = 0) {
    frenzine_record (where: { frenzine_form_id: { _eq: $formId } }, limit: $limit, offset: $offset) {
      id
      is_complete
      values {
        id
        value
        field {
          id
          type {
            id
            name
          }
        }
      }
    }
  }
`

export const FULL_PROGRAM = gql`
  subscription FullProgram ($id: Int!) {
    program_by_pk(id: $id) {
      id
      name
      slug
      submission_processes {
        id
        name
        submission_step_definitions {
          id
          name
          eligibility_criteria
          starting_step
          is_listing
          visual_x
          visual_y
          type_id
          type {
            name
            display_name
            description
          }
          submission_form {
            id
            form {
              id
              name
            }
          }
          eligibility_form {
            id
            form {
              id
              name
            }
          }
          third_party_request_form {
            id
            form {
              id
              name
            }
          }
          profile_form {
            id
            form {
              id
              name
            }
          }
        }
        triggers {
          id
          from_step_id
          to_step_id
          eligibility_outcome
          record_match
          wait_for_other_triggers
          default
        }
      }
    }
  }
`
