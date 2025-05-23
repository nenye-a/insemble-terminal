import gql from 'graphql-tag';

const TERMINAL = gql`
  fragment TerminalFragment on Terminal {
    id
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
`;
export const GET_TERMINAL_LIST = gql`
  query GetTerminalList($search: String, $first: Int, $skip: Int) {
    userTerminals(search: $search, first: $first, skip: $skip)
      @connection(key: "terminals") {
      id
      name
      description
      pinnedFeeds {
        id
      }
      updatedAt
    }
    dataCount(node: TERMINALS, terminalSearch: $search)
  }
`;

export const GET_TERMINAL = gql`
  query GetTerminal($terminalId: String!) {
    terminal(terminalId: $terminalId) {
      ...TerminalFragment
    }
  }
  ${TERMINAL}
`;

export const CREATE_TERMINAL = gql`
  mutation CreateTerminal($name: String!, $description: String) {
    createTerminal(name: $name, description: $description) {
      id
    }
  }
`;

export const EDIT_TERMINAL = gql`
  mutation EditTerminal(
    $terminalId: String!
    $name: String
    $description: String
  ) {
    editTerminal(
      terminalId: $terminalId
      name: $name
      description: $description
    ) {
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

export const GET_SHARED_TERMINAL = gql`
  query GetSharedTerminal($sharedTerminalId: String!) {
    sharedTerminal(sharedTerminalId: $sharedTerminalId) {
      ...TerminalFragment
    }
  }
  ${TERMINAL}
`;

export const GET_TERMINAL_BASIC_INFO = gql`
  query GetTerminalBasicInfo($terminalId: String!) {
    terminal(terminalId: $terminalId) {
      name
      description
    }
  }
`;
