import Calendar from '../Calendar';
import { useEffect } from 'preact/hooks';
import { useTime, useWebStorage, getTitle } from '../logic';
const App = () => {
  let [prefs, setPrefs] = useWebStorage('prefs', {
    updateInterval: 30,
    by: 'week'
  });
  let [unixTime, updateTime] = useTime(prefs.updateInterval * 1000);
  useEffect(() => {
    const keyDownHandler = e => {
      if ((e.keyCode === 82 && (e.metaKey || e.ctrlKey)) || e.keyCode === 116) {
        e.preventDefault();
        updateTime();
      }
      if (e.keyCode === 77)
        setPrefs({
          by: 'month'
        });
      if (e.keyCode === 68)
        setPrefs({
          by: 'day'
        });
      if (e.keyCode === 87)
        setPrefs({
          by: 'week'
        })
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => document.removeEventListener('keydown', keyDownHandler);
  });
  const title = getTitle(unixTime);
  // secondsSinceMidnight is not meant to take DST into account - current implementation is optimal
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
        style={{ fontSize: '3vmin' }}
      >
        {title}
      </h1>
      <Calendar
        date={unixDate}
        currentTime={secondsSinceMidnight}
        by={prefs.by}
      />
    </div>
  );
};
export default App;
