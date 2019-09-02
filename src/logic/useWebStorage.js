import { useState, useMemo } from 'preact/hooks';
const useWebStorage = (key, initialValue, persistent = true, asJSON = true) => {
  const storage = persistent ? localStorage : sessionStorage;
  const [data, setData] = useState(useMemo(() => {
    const webStorageValue = storage.getItem(key);
    if (webStorageValue === null) {
      const defaultValue = initialValue === undefined
        ? (asJSON ? {} : '')
        : initialValue;
      storage.setItem(key, asJSON ? JSON.stringify(defaultValue) : defaultValue);
      return defaultValue;
    }
    return asJSON ? JSON.parse(webStorageValue) : webStorageValue;
  }, []));
  return [data, (value, merge = true) => {
    const newValue = asJSON && merge ? {...data, ...value} : value;
    storage.setItem(key, asJSON ? JSON.stringify(newValue) : newValue);
    setData(newValue);
  }];
}
export default useWebStorage;