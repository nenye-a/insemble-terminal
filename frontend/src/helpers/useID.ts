import { useMemo } from 'react';

let idPrefix = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
let idCounter = 0;

// Generate random id
export default function useID() {
  let id = useMemo(() => {
    idCounter += 1;
    return idPrefix + idCounter.toString(36);
  }, []);
  return id;
}
