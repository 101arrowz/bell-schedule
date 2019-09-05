import { useEffect, useState } from 'preact/hooks';
export default (interval, asDateObject = false) => {
  const [updateVal, update] = useState(false); // Used to force updates
  useEffect(() => {
    const id = setTimeout(() => update(!updateVal), interval);
    return () => clearTimeout(id);
  });
  return asDateObject ? new Date() : Date.now();
};