import React from 'react';

export default function createContext<A>() {
  const Context = React.createContext<A | undefined>(undefined);
  const useContext = () => {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error('useContext must be inside a Provider with a value');
    }
    return context;
  };
  return [useContext, Context.Provider] as const;
}
