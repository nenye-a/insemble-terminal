import localStorage from './localStorage';

let credentials = {
  token: localStorage.getToken() || '',
};

export let isAuthorized = {
  redirectPath: '/',
  isAuthorized: !!credentials.token,
};

export function getCredentials() {
  return credentials;
}

export function logout() {
  localStorage.clearAllFromStorage();
  credentials = { token: '' };
}
