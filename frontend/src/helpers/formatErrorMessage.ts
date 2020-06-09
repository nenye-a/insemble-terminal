export default function formatErrorMessage(error: string) {
  if (error.includes('not supported')) {
    return 'Data not available at this scope, please try with a different location.';
  }
  return 'Something went wrong. Please check your search, or try again';
}
