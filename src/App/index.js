import Calendar, { validateOffset } from '../Calendar';
import { useEffect, useState } from 'preact/hooks';
import { useTime, useWebStorage, getTitle } from '../logic';
let touchStartCoords = null;
let touchEndCoords = null;
const App = () => {
  let [prefs, setPrefs] = useWebStorage('prefs', {
    updateInterval: 30,
    by: 'week',
    periodData: {
      p1: {
        name: 'P1',
        color: '#e9eeff',
        textColor: '#2a56c6'
      },
      p2: {
        name: 'P2',
        color: '#faeaee',
        textColor: '#cf2035'
      },
      p3: {
        name: 'P3',
        color: '#e6f4ea',
        textColor: '#137333'
      },
      p4: {
        name: 'P4',
        color: '#fef7e0',
        textColor: '#b06000'
      },
      p5: {
        name: 'P5',
        color: '#feefe3',
        textColor: '#b36600',
      },
      p6: {
        name: 'P6',
        color: '#e4f7fb',
        textColor: '#007b86'
      },
      p7: {
        name: 'P7',
        color: '#f4eaff',
        textColor: '#9345bd'
      },
      advisory: {
        name: 'Advisory'
      }
    }
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
  const getTouchCoords = e => ([...e.touches].map(el => [el.clientX, el.clientY]).reduce((el1, el2) => [el1[0]+el2[0], el1[1]+el2[1]])).map(el => el / e.touches.length);
  const handleTouchStart = e => {
    touchStartCoords = getTouchCoords(e);
    touchEndCoords = touchStartCoords;
  }
  const handleTouchMove = e => {
    const newTouchCoords = getTouchCoords(e);
    const diff = newTouchCoords.map((el, i) => el - touchEndCoords[i]);
    if (diff[0] > diff[1])
      e.preventDefault();
    touchEndCoords = newTouchCoords;
  }
  const handleTouchEnd = () => {
    const diff = touchEndCoords.map((el, i) => el - touchStartCoords[i]);
    if (Math.abs(diff[0]) < Math.abs(diff[1]))
      return;
    if (diff[0] > 0 && leftArrowValid)
      setDateOffset(dateOffset - 1);
    if (diff[0] < 0)
      setDateOffset(dateOffset + 1);
    touchStartCoords = [0, 0]; // Prevent duplicate events when releasing one finger at a time
    touchEndCoords = [0, 0];
    }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'between',
        fontFamily: '"Segoe UI", "Arial", sans-serif',
        height: '95vh'
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '95%',
        height: '10%'
      }}>
        <span class="arrows" onclick={() => setDateOffset(dateOffset - 1)} style={{
          visibility: leftArrowValid ? 'visible' : 'hidden'
        }} >‹</span>
        <h1 style={{ fontSize: '3vmin' }}>{title}</h1>
        <span class="arrows" onclick={() => setDateOffset(dateOffset + 1)}>›</span>
      </div>
      <Calendar
        date={unixDate}
        currentTime={secondsSinceMidnight}
        by={prefs.by}
        periodData={prefs.periodData}
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
