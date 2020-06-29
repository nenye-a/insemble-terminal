import gql from 'graphql-tag';

export const CREATE_TERMINAL_NOTE = gql`
  mutation CreateTerminalNote($terminalId: String!, title: String!, content: String!){
    createTerminalNote(terminalId:$terminalId, title: $title, content: $content){
      id
    }
  }
`;

export const EDIT_NOTE = gql`
  mutation EditNote($noteId: String!, title: String!, content: String!){
    editNote(noteId: $noteId, title: $title, content: $content){
      id
      title
      content
    }
  }
`;

export const GET_NOTE_DATA = gql`
  query GetNote($noteId: String!) {
    note(noteId: $noteId) {
      id
      title
      content
    }
  }
`;
