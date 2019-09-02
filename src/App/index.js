import { Fragment } from 'preact'
import useTime from '../logic/useTime'
import useWebStorage from '../logic/useWebStorage';
import getTitle from '../logic/getTitle';
const offsetInMillis = -((new Date()).getTimezoneOffset() * 60 * 1000);
const App = props => {
  let [prefs, setPrefs] = useWebStorage('prefs', {
    updateInterval: 30
  });
  let unixTime = useTime(prefs.updateInterval * 1000);
  const title = getTitle(unixTime);
  const secondsSinceMidnight = ((unixTime + offsetInMillis) % (24 * 60 * 60 * 1000)) / 1000;
  return <div>WIP</div>;
};
export default App;
