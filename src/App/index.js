import Calendar from '../Calendar';
import { useTime, useWebStorage, getTitle } from '../logic';
const App = () => {
  let [prefs, setPrefs] = useWebStorage('prefs', {
    updateInterval: 30,
    byInd: 0
  });
  const byArr = ['day', 'week', 'month'];
  let unixTime = useTime(prefs.updateInterval * 1000);
  const title = getTitle(unixTime);
  // secondsSinceMidnight is not meant to take DST into account - current implementation is optimal
  // TODO: current period highlighting - pass secondsSinceMidnight to Calendar
  let unixDate = new Date(unixTime);
  const secondsSinceMidnight =
    unixDate.getHours() * 3600 +
    unixDate.getMinutes() * 60 +
    unixDate.getSeconds();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <h1
        onClick={() => setPrefs({ byInd: (prefs.byInd + 1) % 3 })}
        style={{ fontSize: '5vmin' }}
      >
        {title}
      </h1>
      <Calendar
        date={unixDate}
        currentTime={secondsSinceMidnight}
        by={byArr[prefs.byInd]}
      />
    </div>
  );
};
export default App;
