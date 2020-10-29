export const generatePropertyList = (fieldName: string) => {
  return Object.keys(fieldProperties)
    .filter(propName => fieldProperties[propName].types[fieldName])
    .reduce((list, propName) => ({ ...list, [propName]: fieldProperties[propName].defaultValue }), {})
}

export const generateValidationList = (fieldName: string) => {
  return Object.keys(fieldValidations)
    .filter(propName => fieldValidations[propName].types[fieldName])
    .reduce((list, propName) => ({ ...list, [propName]: fieldValidations[propName].defaultValue }), {})
}

const fieldProperties = {
  // aggregation: null,
  calculation: {
    types: {
      'calculated-field': true
    },
    defaultValue: '1+1'
  },
  choices: {
    types: {
      checkbox: true,
      dropdown: true,
      radio: true
    },
    defaultValue: [
      {
        label: 'option1',
        value: 'value1'
      },
      {
        label: 'option2',
        value: 'value2'
      },
      {
        label: 'option3',
        value: 'value3'
      },
      {
        label: 'option4',
        value: 'value4'
      }
    ]
  },
  currency: {
    types: {
      numeric: true
    },
    defaultValue: ''
  },
  decimal: {
    types: {
      'calculated-field': true,
      numeric: true
    },
    defaultValue: '2'
  },
  // displayFields: null,
  // extensions: null,
  // filter: null,
  markdown: {
    types: {
      heading: true,
      text: true
    },
    defaultValue: false
  },
  maxNumber: {
    types: {
      numeric: true,
      year: true
    },
    defaultValue: 0
  },
  maxlength: {
    types: {
      'text-input': true
    },
    defaultValue: 0
  },
  maxwordcount: {
    types: {
      'text-area': true
    },
    defaultValue: 0
  },
  minNumber: {
    types: {
      numeric: true,
      year: true
    },
    defaultValue: 0
  },
  minwordcount: {
    types: {
      'text-area': true
    },
    defaultValue: 0
  },
  multiple: {
    types: {
      checkbox: true,
      dropdown: true
    },
    defaultValue: true
  },
  placeholder: {
    types: {
      'text-area': true,
      'text-input': true,
      numeric: true
    },
    defaultValue: ''
  },
  provinces: {
    types: {
      'state-select': true
    },
    defaultValue: true
  },
  // showAllChoices: boolean,
  // summarizedForm: null,
}

const fieldValidations = {
  alpha: {
    types: {
      'text-input': true,
      'text-area': true
    },
    defaultValue: false
  },
  alphaNumeric: {
    types: {
      'text-input': true,
      'text-area': true
    },
    defaultValue: false
  },
  currencyDollar: {
    types: {
      'calculated-field': true,
      numeric: true
    },
    defaultValue: false
  },
  emailAddress: {
    types: {
      'text-input': true
    },
    defaultValue: false
  },
  numeric: {
    types: {
      'text-input': true,
      'text-area': true
    },
    defaultValue: false
  },
  required: {
    types: {
      checkbox: true,
      'country-select': true,
      'date-picker': true,
      dropdown: true,
      'file-upload': true,
      numeric: true,
      radio: true,
      'state-select': true,
      'text-input': true,
      'text-area': true,
      year: true
    },
    defaultValue: false
  },
  unique: {
    types: {
      checkbox: true,
      'country-select': true,
      'date-picker': true,
      dropdown: true,
      'file-upload': true,
      numeric: true,
      radio: true,
      'state-select': true,
      'text-input': true,
      'text-area': true,
      year: true
    },
    defaultValue: false
  },
  zipCode: {
    types: {
      'text-input': true
    },
    defaultValue: false
  },
}

export function isNewId (id: string | number): boolean {
  return String(id)?.split('-')[0].startsWith('new')
}

export function stepMissingProperties (fieldSchema: { [key: string]: { required: boolean } }, step: any): boolean {
  if (!fieldSchema || !step) {
    return true
  }

  for (const key of Object.keys(fieldSchema).filter(k => fieldSchema[k].required)) {
    if (!step[key]) {
      return true
    }
  }

  return Object.keys(step).some(key => key !== 'type_id' && !fieldSchema[key])
}