TERMINAL = """
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
"""

GET_TERMINAL_LIST = """
    query GetTerminalList($search: String, $first: Int, $skip: Int) {
        userTerminals(search: $search, first: $first, skip: $skip) {
            id
            name
            description
            pinnedFeeds {
                id
            }
            updatedAt
        }
    }
"""

GET_TERMINAL = """
    query GetTerminal($terminalId: String!) {{
        terminal(terminalId: $terminalId) {{
            ...TerminalFragment
        }}
    }}
    {terminal}
""".format(terminal=TERMINAL)

CREATE_TERMINAL = """
    mutation CreateTerminal($name: String!, $description: String) {
        createTerminal(name: $name, description: $description) {
            id
        }
    }
"""

EDIT_TERMINAL = """
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
"""

DELETE_TERMINAL = """
    mutation DeleteTerminal($terminalId: String!) {
        deleteTerminal(terminalId: $terminalId) {
            id
        }
    }
"""

PIN_TABLE = """
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
"""

REMOVE_PINNED_TABLE = """
    mutation RemovePinnedTable($pinTableId: String!) {
        removePinnedTable(pinTableId: $pinTableId) {
            id
        }
    }
"""

SHARE_TERMINAL = """
    mutation ShareTerminal($terminalId: String!) {
        shareTerminal(terminalId: $terminalId)
    }
"""

GET_SHARED_TERMINAL = """
    query GetSharedTerminal($sharedTerminalId: String!) {{
        sharedTerminal(sharedTerminalId: $sharedTerminalId) {{
        ...TerminalFragment
        }}
    }}
    {terminal}
""".format(terminal=TERMINAL)

GET_TERMINAL_BASIC_INFO = """
    query GetTerminalBasicInfo($terminalId: String!) {
        terminal(terminalId: $terminalId) {
            name
            description
        }
    }
"""
