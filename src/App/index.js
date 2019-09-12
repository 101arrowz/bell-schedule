import Calendar, { validateOffset } from '../Calendar';
import { useEffect, useState } from 'preact/hooks';
import { useTime, useWebStorage, getTitle } from '../logic';
let touchStartX = 0;
let touchMoveX = 0;
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
        setDateOffset(dateOffset - 1);
      }
      if (e.keyCode === 39) {
        setDateOffset(dateOffset + 1);
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => document.removeEventListener('keydown', keyDownHandler);
  });
  const getTouchX = e => ([...e.touches].map(el => el.clientX).reduce((el1, el2) => el1+el2)) / e.touches.length;
  const handleTouchStart = e => {
    touchStartX = getTouchX(e);
    touchMoveX = touchStartX;
  }
  const handleTouchMove = e => {
    e.preventDefault();
    touchMoveX = getTouchX(e)
  }
  const handleTouchEnd = () => {
    if (touchStartX !== touchMoveX)
      setDateOffset(dateOffset + (touchStartX < touchMoveX ? -1 : 1))
    touchStartX = 0; // Prevent duplicate events when releasing one finger at a time
    touchMoveX = 0;
    }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: '"Segoe UI", "Arial", sans-serif'
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* <span class="arrows">‹</span> */}
        <h1 style={{ fontSize: '3vmin', paddingLeft: '1.5em', paddingRight: '1.5em' }}>{title}</h1>
        {/* <span class="arrows">›</span> */}
      </div>
      <Calendar
        date={unixDate}
        currentTime={secondsSinceMidnight}
        by={prefs.by}
        dateOffset={dateOffset}
        onRejected={() => setDateOffset(dateOffset + 1)}
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
      />
    </div>
  );
};
export default App;
