import { useEffect, useState } from 'preact/hooks';
const useTime = interval => {
  const [updateVal, update] = useState(false); // Used to force updates
  useEffect(() => {
    const id = setTimeout(() => update(!updateVal), interval);
    return () => clearTimeout(id);
  });
  return Date.now();
}
export default useTime;