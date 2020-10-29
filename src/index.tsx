import React from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { render } from 'react-dom'
import { App } from './App'

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import { BrowserRouter as Router } from 'react-router-dom'

const hasSubscriptionOperation = ({
  query: {
    definitions
  }
}) => definitions.some(({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription')

const webSocketLink = new WebSocketLink({
  uri: 'wss://huge-turtle-64.hasura.app/v1/graphql',
  options: {
    reconnect: true,
    connectionParams: () => ({
      headers: {
        'X-Hasura-Admin-Secret': 'crazytortoiseguitar'
      }
    }),
    lazy: true
  }
})

const httpLink = new HttpLink({
  uri: 'https://huge-turtle-64.hasura.app/v1/graphql',
  headers: {
    'X-Hasura-Admin-Secret': 'crazytortoiseguitar'
  }
})

const link = split(hasSubscriptionOperation, webSocketLink, httpLink)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  headers: {
    'X-Hasura-Admin-Secret': 'crazytortoiseguitar'
  }
})

render(
  <ApolloProvider client={client}>
    <Router>
      <App />
    </Router>
  </ApolloProvider>,
  document.getElementById('app')
)
