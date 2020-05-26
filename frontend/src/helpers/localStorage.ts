const TOKEN_KEY = 'insemble-terminal-token';

let localStorage = {
  clearAllFromStorage: () => {
    window.localStorage.clear();
  },
  saveToken: (value: string) => {
    window.localStorage.setItem(TOKEN_KEY, value);
  },
  getToken: () => {
    return window.localStorage.getItem(TOKEN_KEY);
  },
  removeToken: () => {
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export default localStorage;
