import { useState, useEffect } from 'preact/hooks';
import PreferenceManager from '../logic/PreferenceManager';
import getTitle from '../logic/getTitle';
const originalTime = Date.now();
const offsetInMillis = -((new Date()).getTimezoneOffset() * 60 * 1000);
const App = props => {
  let [unixTime, setUnixTime] = useState(originalTime);
  const title = getTitle(unixTime);
  const secondsSinceMidnight = ((unixTime + offsetInMillis) % (24 * 60 * 60 * 1000)) / 1000;
  let prefs = PreferenceManager.getPrefs();
  useEffect(() => {
    const id = setInterval(() => {
      const date = Date.now();
      setUnixTime(date);
    }, prefs.updateInterval * 1000);
    return () => clearInterval(id);
  }, []);
  return <div>Title is {title}, Seconds since midnight is {secondsSinceMidnight}</div>;
};
export default App;
