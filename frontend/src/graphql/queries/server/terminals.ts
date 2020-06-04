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
