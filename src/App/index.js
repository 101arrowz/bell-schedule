import Calendar, { validateOffset } from '../Calendar';
import { useEffect, useState } from 'preact/hooks';
import { useTime, useWebStorage, getTitle } from '../logic';
const App = () => {
  let [prefs, setPrefs] = useWebStorage('prefs', {
    updateInterval: 30,
    by: 'week'
  });
  let [dateOffset, setDateOffset] = useState(0);
  let [unixTime, updateTime] = useTime(prefs.updateInterval * 1000);
  const title = getTitle(unixTime);
  // secondsSinceMidnight is not meant to take DST into account - current implementation is optimal
  let unixDate = new Date(unixTime);
  const secondsSinceMidnight =
    unixDate.getHours() * 3600 +
    unixDate.getMinutes() * 60 +
    unixDate.getSeconds();

  const updateFormatTo = by => {
    setPrefs({
      by
    });
    setDateOffset(0);
  };
  let leftArrowValid = validateOffset(unixDate, dateOffset - 1, prefs.by);
  useEffect(() => {
    const keyDownHandler = e => {
      if ((e.keyCode === 82 && (e.metaKey || e.ctrlKey)) || e.keyCode === 116) {
        e.preventDefault();
        updateTime();
      }
      if (e.keyCode === 77) updateFormatTo('month');
      if (e.keyCode === 68) updateFormatTo('day');
      if (e.keyCode === 87) updateFormatTo('week');
      if (e.keyCode === 37 && leftArrowValid) {
        console.log('yote');
        setDateOffset(dateOffset - 1);
      }
      if (e.keyCode === 39) {
        setDateOffset(dateOffset + 1);
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => document.removeEventListener('keydown', keyDownHandler);
  });
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <h1 style={{ fontSize: '3vmin' }}>{title}</h1>
      <Calendar
        date={unixDate}
        currentTime={secondsSinceMidnight}
        by={prefs.by}
        dateOffset={dateOffset}
        onRejected={() => setDateOffset(dateOffset + 1)}
      />
    </div>
  );
};
export default App;
