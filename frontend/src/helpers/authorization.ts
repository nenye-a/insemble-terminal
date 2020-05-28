import localStorage from './localStorage';

let credentials = {
  token: localStorage.getToken() || '',
};

export let isAuthorized = {
  redirectPath: '/login',
  isAuthorized: !!localStorage.getToken(),
};

export function getCredentials() {
  return credentials;
}

export function logout() {
  localStorage.clearAllFromStorage();
  credentials = { token: '' };
}
