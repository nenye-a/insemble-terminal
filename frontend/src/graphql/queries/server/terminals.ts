import gql from 'graphql-tag';

export const GET_TERMINAL_LIST = gql`
  query GetTerminalList {
    userTerminals {
      id
      name
      description
      pinnedFeeds {
        id
      }
      updatedAt
    }
  }
`;

export const GET_TERMINAL = gql`
  query GetTerminal($terminalId: String) {
    terminal(terminalId: $terminalId) {
      name
      description
      pinnedFeeds {
        tableId
        tableType
        performanceTableType
        ownershipTableType
      }
      updatedAt
    }
  }
`;

export const CREATE_TERMINAL = gql`
  mutation CreateTerminal($name: String!, $description: String) {
    createTerminal(name: $name, description: $description) {
      id
    }
  }
`;

export const DELETE_TERMINAL = gql`
  mutation DeleteTerminal($terminalId: String!) {
    deleteTerminal(terminalId: $terminalId) {
      id
    }
  }
`;
