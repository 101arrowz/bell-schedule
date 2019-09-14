import SPECIAL_SCHEDULE from './special';
import RESET_DAYS from './resetDays';
import './index.css';
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SHORT_WEEKDAYS = WEEKDAYS.map(el => el.slice(0, 3));
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTH_NAMES = MONTH_NAMES.map(el => el.slice(0, 3))
const RESET_DAYS_KEYS = Object.keys(RESET_DAYS);
const getDateArray = (
  origDate,
  dateOffset,
  type = 'week',
  validateOnly = false
) => {
  origDate = new Date(origDate);
  let dateArray = [];
  let currentInd = -1;
  let baseRawDate;
  let valid;
  const generateBaseRawDate = date =>
    RESET_DAYS_KEYS.reduce((prevRawDate, thisRawDate) => {
      const thisDate = new Date(thisRawDate);
      return thisDate >= new Date(prevRawDate) && startDate <= date
        ? thisRawDate
        : prevRawDate;
    });
  if (type === 'month') {
    origDate.setMonth(origDate.getMonth() + dateOffset);
    const year = origDate.getFullYear();
    const month = origDate.getMonth();
    const origDateMidnight = new Date(year, month, origDate.getDate());
    let startDate = new Date(year, month);
    baseRawDate = generateBaseRawDate(startDate);
    valid = startDate - new Date(baseRawDate) > 0;
    if (validateOnly) return valid;
    let endDate = new Date(year, month + 1, 0);
    let tmpArr = [];
    const EXCLUDE_WEEKENDS = [0, 6];
    while (EXCLUDE_WEEKENDS.includes(startDate.getDay()))
      startDate.setDate(startDate.getDate() + 1);
    tmpArr[startDate.getDay() - 1] = startDate.getTime();
    let date = new Date(year, month, startDate.getDate() + 1);
    const incrementDate = (by = 1) => date.setDate(date.getDate() + by);
    while (date <= endDate) {
      while (tmpArr.length < 5) {
        if (date > endDate) break;
        if (!dateOffset && date - origDateMidnight === 0)
          currentInd = [dateArray.length, tmpArr.length]; // Haven't added current tmpArr or current date yet, so dateArray.length and tmpArr.length without subtracting
        tmpArr.push(date.getTime());
        incrementDate();
      }
      incrementDate(2);
      dateArray.push(tmpArr);
      tmpArr = [];
    }
  } else {
    if (type !== 'day' || !dateOffset) {
      if (type !== 'day') origDate.setDate(origDate.getDate() + 7 * dateOffset);
      if (origDate.getDay() === 6) origDate.setDate(origDate.getDate() + 1);
    } else {
      if (dateOffset < 0) {
        for (let i = dateOffset; i < 0; i++) {
          origDate.setDate(origDate.getDate() - 1);
          if (origDate.getDay() === 0) origDate.setDate(origDate.getDate() - 2);
        }
      } else {
        for (let i = 0; i < dateOffset; i++) {
          origDate.setDate(origDate.getDate() + 1);
          if (origDate.getDay() === 6) origDate.setDate(origDate.getDate() + 2);
        }
      }
    }
    let dayInd = origDate.getDay();
    let dateNum = origDate.getDate();
    const year = origDate.getFullYear();
    const month = origDate.getMonth();
    const origDateMidnight = new Date(year, month, origDate.getDate());
    let startDate = new Date(year, month, dateNum - dayInd + 1);
    baseRawDate = generateBaseRawDate(startDate);
    valid = startDate - new Date(baseRawDate) > 0;
    if (validateOnly) return valid;
    const initialTime = startDate.getTime();
    let endDate = new Date(year, month, dateNum - dayInd + 5);
    for (
      let date = startDate;
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const doChecks = !(date - origDateMidnight);
      dateArray.push(type === 'day' && !doChecks ? undefined : date.getTime());
      if (!dateOffset && doChecks) currentInd = dateArray.length - 1;
    }
    if (type === 'day' && !dateArray.filter(el => !!el).length) {
      dateArray[0] = initialTime;
    }
  }
  return { dateArray, currentInd, baseRawDate, rejectRequest: !valid };
};
const WeirdFlex = ({
  children,
  size,
  direction = null,
  style,
  extraClasses,
  ...props
}) => (
  <div
    style={{
      ...(size && { flex: `${size} 1 auto` }),
      ...style
    }}
    class={[
      ...(direction ? ['flex-' + direction] : []),
      ...(extraClasses
        ? typeof extraClasses === 'string'
          ? [extraClasses]
          : extraClasses
        : [])
    ].join(' ')}
    {...props}
  >
    {children}
  </div>
);
const makePeriod = (name, time = 5100, link, extra) => ({
  name,
  time,
  ...(link && { link }),
  ...extra
});
const makeExecPeriod = (exec, time, extra) => ({
  exec,
  ...(time && { time }),
  ...extra
});
const recurseReplace = (events, periods) =>
  events.map(el =>
    typeof el === 'string'
      ? periods[el]
      : el instanceof Array
      ? recurseReplace(el, periods)
      : el
  );
const MEETINGS = ['Fresh.', 'Senior', 'Junior', 'Soph.'];
const AFTER_SCHOOL = [
  'Office Hours',
  'Office Hours',
  'Faculty Meeting',
  'Office Hours',
  'After School'
];
const execFunctions = {
  getMeeting: dayIndex => ({ name: MEETINGS[(dayIndex % 8) / 2] + ' Mtg.' }),
  getAfterSchool: (_, weekIndex) => ({
    name: AFTER_SCHOOL[weekIndex]
  })
};
const getMaxInternalSize = (internals, layer = 1) =>
  internals
    .map(el => (el instanceof Array ? getMaxInternalSize(el) : el.time))
    .reduce((el1, el2) => (layer % 2 ? Math.max(el1, el2) : el1 + el2));
const generateJSXDay = (
  schedule,
  dayIndex,
  weekIndex,
  startTime,
  by,
  isActive,
  currentTime,
  recursiveLayer = 0
) => {
  let content;
  if (schedule instanceof Array) {
    const size = getMaxInternalSize(schedule, recursiveLayer);
    content = (
      <WeirdFlex
        direction={recursiveLayer % 2 ? 'row' : 'column'}
        size={recursiveLayer ? size : undefined}
        extraClasses={recursiveLayer === 0 ? by + '-outer-layer' : null}
      >
        {schedule.map((miniSchedule, ind) => {
          const [newSchedule, newStartTime] = generateJSXDay(
            miniSchedule,
            dayIndex,
            weekIndex,
            startTime,
            by,
            isActive,
            currentTime,
            recursiveLayer + 1
          );
          if (!(recursiveLayer % 2) || ind === schedule.length - 1)
            startTime = newStartTime;
          return newSchedule;
        })}
      </WeirdFlex>
    );
  } else if (schedule instanceof Object) {
    if (schedule.header) {
      const date = schedule.date.getDate();
      const month = schedule.date.getMonth();
      const isFirstDayMonth = (date === 1 || (date <= 3 && schedule.date.getDay() === 1));
      const isFirstDayYear = isFirstDayMonth && !month;
      content = (
        <WeirdFlex
          direction="row"
          extraClasses="header"
          style={{
            ...schedule.style,
          }}
        >
          <WeirdFlex direction="column" extraClasses="header-left">
            <div class="header-day">{SHORT_WEEKDAYS[schedule.date.getDay()-1]}</div>
            <div class="header-date">{(isFirstDayMonth ? SHORT_MONTH_NAMES[schedule.date.getMonth()] + ' ' : '') + date + (isFirstDayYear ? ', '+schedule.date.getFullYear() : '')}</div>
          </WeirdFlex>
          <div class="header-right">{schedule.shortDayName}</div>
        </WeirdFlex>
      );
    } else {
      if (schedule.exec) {
        if (!execFunctions[schedule.exec]) return null;
        schedule = {
          ...schedule,
          ...execFunctions[schedule.exec](dayIndex, weekIndex)
        };
      }
      const timeToString = time => {
        const hours = Math.floor(time / 3600) % 12 || 12;
        let minutes = Math.floor((time % 3600) / 60);
        if (minutes < 10) {
          minutes = '0' + minutes;
        }
        return hours + ':' + minutes;
      };
      const firstTime = timeToString(startTime);
      const endTime = startTime + schedule.time;
      const lastTime = timeToString(endTime);
      let timeBeforeEnd = null;
      if (isActive && currentTime < endTime && currentTime > startTime)
        timeBeforeEnd = endTime - currentTime;
      content = (
        <WeirdFlex
          size={schedule.time}
          direction="column"
          extraClasses="period"
          style={{
            ...schedule.style,
            ...(timeBeforeEnd && { backgroundColor: 'lightgray', fontWeight: '500' })
          }}
        >
          <div style={schedule.nameStyle}>{schedule.name}</div>
          <div style={schedule.timeStyle}>{firstTime + ' - ' + lastTime}</div>
          {timeBeforeEnd ? (
            <div
              style={{
                fontSize: '75%'
              }}
            >
              {Math.ceil(timeBeforeEnd / 60)} min. left
            </div>
          ) : null}
        </WeirdFlex>
      );
      startTime = endTime;
    }
  }
  return recursiveLayer ? [content, startTime] : content;
};
const generateJSXWeekly = (
  baseTime,
  baseDay,
  standardSchedule,
  specialSchedule,
  dateData,
  by,
  currentTime
) => {
  const { dateArray, currentInd } = dateData;
  if (by === 'month')
    return dateArray.map((arr, ind) => (
      <WeirdFlex
        direction="row"
        extraClasses="topmost-layer"
        style={{
          ...(ind === 0
            ? { alignSelf: 'flex-end' }
            : ind === dateArray.length - 1
            ? { alignSelf: 'flex-start' }
            : { alignSelf: 'center' }),
          flex: 1,
          marginBottom: '5vh',
          minHeight: '80vh'
        }}
      >
        {generateJSXWeekly(
          baseTime,
          baseDay,
          standardSchedule,
          specialSchedule,
          {
            dateArray: arr,
            currentInd: ind === currentInd[0] ? currentInd[1] : -1
          },
          'week',
          currentTime
        )}
      </WeirdFlex>
    ));
  const standardScheduleKeys = Object.keys(standardSchedule).sort();
  let daysSinceBase = baseDay[1]; // Pure number of days counter
  const dayIndOffset = standardScheduleKeys.indexOf(baseDay[0]) - baseDay[1]; // Add when calculating which day should be used
  const EXCLUDE_WEEKENDS = [0, 6];
  const TARGET = dateArray.reduce((el1, el2) => el1 || el2);
  for (
    let iterDate = new Date(baseTime);
    iterDate < TARGET;
    iterDate.setDate(iterDate.getDate() + 1)
  ) {
    const iterTime = iterDate.getTime();
    if (
      !EXCLUDE_WEEKENDS.includes(iterDate.getDay()) &&
      (!specialSchedule[iterTime] || specialSchedule[iterTime].replace)
    )
      daysSinceBase++;
  }
  // Following previously used for styling
  // let renderIndex = -1; 
  // const renderedLength = dateArray.filter(el => el).length;
  const JSXArray = dateArray.map((date, ind) => {
    if (date === undefined) return;
    let todaySchedule;
    let dayName;
    let shortDayName = "";
    let dayStart = 28800;
    if (specialSchedule[date]) {
      const sc = specialSchedule[date];
      todaySchedule = sc.events;
      dayName = sc.name;
      dayStart = sc.startTime || 28800;
      if (sc.replace) {
        daysSinceBase++;
        shortDayName = standardScheduleKeys[
          (daysSinceBase + dayIndOffset) % standardScheduleKeys.length
        ];
      }
    } else {
      dayName =
        standardScheduleKeys[
          (daysSinceBase + dayIndOffset) % standardScheduleKeys.length
        ];
      shortDayName = dayName;
      todaySchedule = standardSchedule[dayName];
      daysSinceBase++;
    }
    const todayDate = new Date(date);
    return generateJSXDay(
      [
        {
          header: true,
          date: todayDate,
          shortDayName,
          dayName
        },
        ...todaySchedule
      ],
      daysSinceBase,
      ind,
      dayStart,
      by,
      ind === currentInd,
      currentTime
    );
  });
  return JSXArray;
};
const LUNCH_URL = '//resources.harker.org/download/upper-school-lunch-menu/';
const lunch = makePeriod('Lunch', 2700, LUNCH_URL);
const longLunch = makePeriod('Lunch', 4200, LUNCH_URL);
const lunch30 = makePeriod('Lunch', 1800, LUNCH_URL);
const lunch40 = makePeriod('Lunch', 2400, LUNCH_URL);
const schoolMeeting = makePeriod('School Meeting', 1800);
const meeting = makeExecPeriod('getMeeting', 900);
const afterSchool = makeExecPeriod('getAfterSchool', 1200);
const officeHours3PDay = makePeriod('Office Hours', 1800);
const clubLeaders = makePeriod('Club Leaders', 1800);
const Calendar = props => {
  let {
    date,
    currentTime,
    onRejected,
    dateOffset = 0,
    by = 'week',
    periodData: {
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      advisory
    } = {},
    ignorePassing = false,
    ...extraProps
  } = props;
  const passProps = ignorePassing
    ? { style: { display: 'none' } }
    : { timeStyle: { display: 'none' } };
  const makeStandardPeriod = (period) => makePeriod(period.name, 5100, null, {style: {backgroundColor: period.color || 'inherit', color: period.textColor || 'inherit'}})
  const periods = {
    p1: makeStandardPeriod(p1),
    p2: makeStandardPeriod(p2),
    p3: makeStandardPeriod(p3),
    p4: makeStandardPeriod(p4),
    p5: makeStandardPeriod(p5),
    p6: makeStandardPeriod(p6),
    p7: makeStandardPeriod(p7),
    advisory: makeStandardPeriod(advisory),
    pass5: makePeriod('', 300, null, passProps),
    pass10: makePeriod('', 600, null, passProps),
    meeting,
    afterSchool,
    schoolMeeting,
    lunch,
    longLunch,
    lunch30,
    lunch40,
    officeHours3PDay,
    clubLeaders
  };
  let { baseRawDate, rejectRequest, ...dateData } = getDateArray(
    date,
    dateOffset,
    by
  );
  if (rejectRequest) {
    if (typeof onRejected === 'function') onRejected();
    return null;
  }
  const baseDay = RESET_DAYS[baseRawDate];
  const standardSchedule = {
    A: [
      periods.p1,
      periods.pass10,
      periods.p2,
      periods.pass10,
      [periods.lunch, [periods.meeting, periods.lunch30]],
      periods.pass5,
      periods.p3,
      periods.pass10,
      periods.p4,
      periods.pass10,
      periods.afterSchool
    ],
    B: [
      periods.p5,
      periods.pass10,
      periods.schoolMeeting,
      periods.pass5,
      periods.officeHours3PDay,
      periods.pass10,
      periods.p6,
      periods.pass5,
      periods.longLunch,
      periods.pass5,
      periods.p7,
      periods.pass10,
      periods.afterSchool
    ],
    C: [
      periods.p1,
      periods.pass10,
      periods.p4,
      periods.pass10,
      [periods.lunch, [periods.meeting, periods.lunch30]],
      periods.pass5,
      periods.p2,
      periods.pass10,
      periods.p3,
      periods.pass10,
      periods.afterSchool
    ],
    D: [
      periods.p5,
      periods.pass10,
      periods.advisory,
      periods.pass5,
      periods.officeHours3PDay,
      periods.pass10,
      periods.p7,
      periods.pass5,
      [periods.longLunch, [periods.lunch40, periods.clubLeaders]],
      periods.pass5,
      periods.p6,
      periods.pass10,
      periods.afterSchool
    ]
  };
  const specialSchedule = {};
  for (let day in SPECIAL_SCHEDULE) {
    specialSchedule[new Date(day).getTime()] = {
      ...SPECIAL_SCHEDULE[day],
      events: recurseReplace(SPECIAL_SCHEDULE[day].events, periods)
    };
  }
  const JSXArray = generateJSXWeekly(
    baseRawDate,
    baseDay,
    standardSchedule,
    specialSchedule,
    dateData,
    by,
    currentTime
  );
  return (
    <WeirdFlex
      direction={by === 'month' ? 'column' : 'row'}
      extraClasses={by === 'month' ? 'month-topmost-layer' : 'topmost-layer'}
      {...extraProps}
    >
      {JSXArray}
    </WeirdFlex>
  );
};
const validateOffset = (date, dateOffset, by) =>
  getDateArray(date, dateOffset, by, true);
export default Calendar;
export { validateOffset };
