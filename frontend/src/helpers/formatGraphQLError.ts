let graphqlHeader = 'GraphQL error: ';

export default function formatGraphQLEror(message: string) {
  return message.replace(graphqlHeader, '');
}
