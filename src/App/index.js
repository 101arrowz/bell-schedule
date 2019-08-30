import { useState, useEffect } from 'preact/hooks';
import PreferenceManager from '../logic/PreferenceManager';
const App = props => {
  let [time, setTime] = useState(new Date());
  let prefs = PreferenceManager.getPrefs();
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), prefs.updateInterval);
    return () => clearTimeout(id);
  }, []);
  return <div>Hi</div>;
};
export default App;
