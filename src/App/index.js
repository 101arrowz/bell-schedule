import Calendar from '../Calendar';
import { useTime, useWebStorage, getTitle } from '../logic'
const App = () => {
  let [prefs, setPrefs] = useWebStorage('prefs', {
    updateInterval: 30
  });
  let unixTime = useTime(prefs.updateInterval * 1000);
  const title = getTitle(unixTime);
  // secondsSinceMidnight is not meant to take DST into account - current implementation is optimal
  let unixDate = new Date(unixTime);
  const secondsSinceMidnight = unixDate.getHours() * 3600 + unixDate.getMinutes() * 60 + unixDate.getSeconds();
  return <Calendar date={unixDate} by='month' />;
};
export default App;
