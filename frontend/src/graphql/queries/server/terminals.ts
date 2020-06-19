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
  query GetTerminal($terminalId: String!) {
    terminal(terminalId: $terminalId) {
      name
      description
      pinnedFeeds {
        id
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

export const PIN_TABLE = gql`
  mutation PinTable(
    $terminalId: String!
    $tableId: String!
    $tableType: TableType!
  ) {
    pinTable(
      terminalId: $terminalId
      tableId: $tableId
      tableType: $tableType
    ) {
      id
    }
  }
`;

export const REMOVE_PINNED_TABLE = gql`
  mutation RemovePinnedTable($pinTableId: String!) {
    removePinnedTable(pinTableId: $pinTableId) {
      id
    }
  }
`;

export const SHARE_TERMINAL = gql`
  mutation ShareTerminal($terminalId: String!) {
    shareTerminal(terminalId: $terminalId)
  }
`;
