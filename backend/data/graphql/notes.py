CREATE_TERMINAL_NOTE = """
    mutation CreateTerminalNote(
        $terminalId: String!
        $title: String!
        $content: String!
    ) {
        createTerminalNote(
            terminalId: $terminalId
            title: $title
            content: $content
        ) {
            id
        }
    }
"""

GET_TERMINAL_NOTE = """
    query GetNote($noteId: String!) {
        note(noteId: $noteId) {
            id
            title
            content
        }
    }
"""
