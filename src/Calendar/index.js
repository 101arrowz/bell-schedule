import SPECIAL_SCHEDULE from './special';
import RESET_DAYS from './resetDays';
import './index.css';
const RESET_DAYS_KEYS = Object.keys(RESET_DAYS);
const getDateArray = (origDate, type = 'week') => {
  const year = origDate.getFullYear();
  const month = origDate.getMonth();
  const origDateMidnight = new Date(year, month, origDate.getDate());
  let dateArray = [];
  let currentInd = -1;
  if (type === 'month') {
    let startDate = new Date(year, month);
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
        if (date - origDateMidnight === 0)
          currentInd = [dateArray.length, tmpArr.length]; // Haven't added current tmpArr or current date yet, so dateArray.length and tmpArr.length without subtracting
        tmpArr.push(date.getTime());
        incrementDate();
      }
      incrementDate(2);
      dateArray.push(tmpArr);
      tmpArr = [];
    }
  } else {
    let dayInd = origDate.getDay();
    if (dayInd === 6) {
      origDate = new Date(origDate);
      origDate.setDate(origDate.getDate()+1);
      dayInd = 0;
    };
    let dateNum = origDate.getDate();
    let startDate = new Date(year, month, dateNum - dayInd + 1);
    const initialTime = startDate.getTime();
    let endDate = new Date(year, month, dateNum - dayInd + 5);
    for (
      let date = startDate;
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const doChecks = !(date - origDateMidnight);
      dateArray.push(type === 'day' && !doChecks ? undefined : date.getTime());
      if (doChecks)
        currentInd = dateArray.length - 1;
    }
    if (type === 'day' && !dateArray.filter(el => !!el).length) {
      dateArray[0] = initialTime;
    }
  }
  return { dateArray, currentInd };
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
      ...(size && {flex: size}),
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
  getAfterSchool: (_, weekIndex) => ({ name: AFTER_SCHOOL[weekIndex], ...(weekIndex === 2 ? {timeStyle: {display: 'none'}} : {}) })
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
  recursiveLayer = 0,
) => {
  let content;
  if (schedule instanceof Array) {
    const size = getMaxInternalSize(schedule, recursiveLayer);
    content = (
      <WeirdFlex
        direction={recursiveLayer % 2 ? 'row' : 'column'}
        size={recursiveLayer ? size: undefined}
        extraClasses={recursiveLayer === 0 ? by+'-outer-layer' : null}
      >
        {schedule.map((miniSchedule, ind) => {
          const [newSchedule, newStartTime] = generateJSXDay(
            miniSchedule,
            dayIndex,
            weekIndex,
            startTime,
            by,
            recursiveLayer + 1
          );
          if (!(recursiveLayer % 2) || ind === schedule.length - 1)
            startTime = newStartTime;
          return newSchedule;
        }
        )}
      </WeirdFlex>
    );
  } else if (schedule instanceof Object) {
    if (schedule.header) {
      content = (
        <WeirdFlex direction="column" extraClasses="header" style={schedule.style}>
          <div class="headerText">{schedule.header}</div>
          {schedule.subheader}
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
        const hours = ((Math.floor(time / 3600) % 12) || 12);
        let minutes = Math.floor((time % 3600) / 60);
        if (minutes < 10) {
          minutes = '0'+minutes;
        }
        return hours + ':' + minutes;
      }
      const firstTime = timeToString(startTime);
      startTime += schedule.time;
      const endTime = timeToString(startTime);
      content = (
        <WeirdFlex
          size={schedule.time}
          direction="column"
          extraClasses="period"
          style={schedule.style}
        >
          <div style={schedule.nameStyle}>{schedule.name}</div>
          <div style={schedule.timeStyle}>{firstTime + ' - ' + endTime}</div>
        </WeirdFlex>
      );
    }
  }
  return recursiveLayer ? [content, startTime] : content;
};
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const generateJSXWeekly = (
  baseTime,
  baseDay,
  standardSchedule,
  specialSchedule,
  dateArray,
  by
) => {
  if (by === 'month')
    return dateArray.map((arr, ind) => <WeirdFlex direction='row' extraClasses='outer-layer' style={{...(ind === 0 ? {alignSelf: 'flex-end'} : ind === dateArray.length - 1 ? {alignSelf: 'flex-start'} : {alignSelf: 'center'}), marginBottom: '2em', height: '60vh'}}>{generateJSXWeekly(
      baseTime,
      baseDay,
      standardSchedule,
      specialSchedule,
      arr,
      'week'
    )}</WeirdFlex>);
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
  let renderIndex = -1;
  const renderedLength = dateArray.filter(el => el).length;
  const JSXArray = dateArray.map((date, ind) => {
    if (date === undefined) return;
    renderIndex++;
    let todaySchedule;
    let dayName;
    let dayStart = 28800;
    if (specialSchedule[date]) {
      todaySchedule = specialSchedule[date].events;
      dayName = specialSchedule[date].name;
      dayStart = specialSchedule[date].startTime || 28800;
      if (specialSchedule[date].replace) {
        daysSinceBase++;
      }
    } else {
      dayName =
        standardScheduleKeys[
          (daysSinceBase + dayIndOffset) % standardScheduleKeys.length
        ];
      todaySchedule = standardSchedule[dayName];
      daysSinceBase++;
    }
    const todayDate = new Date(baseTime);
    todayDate.setDate(todayDate.getDate() + dayIndOffset);
    for (let i = 0; i < daysSinceBase; i++) {
      do {
        todayDate.setDate(todayDate.getDate() + 1);
      } while (EXCLUDE_WEEKENDS.includes(todayDate.getDay()));
    }
    todayDate.setTime(todayDate.getTime() + dayStart * 1000);
    const dayStr = [
      todayDate.getMonth() + 1,
      todayDate.getDate(),
      todayDate.getFullYear() % 100
    ].join('/');
    return generateJSXDay(
      [
        {
          header: WEEKDAYS[ind],
          subheader: dayStr + ' (' + dayName + ')',
          style: {
            ...(renderIndex === 0 && {borderLeft: '2px solid black'}),
            ...(renderIndex === renderedLength - 1 && {borderRight: '2px solid black'})
          }
        },
        ...todaySchedule
      ],
      daysSinceBase,
      ind,
      dayStart,
      by
    );
  });
  return JSXArray;
};
const LUNCH_URL = '//resources.harker.org/download/upper-school-lunch-menu/';
const lunch = makePeriod('Lunch', 2700, LUNCH_URL);
const longLunch = makePeriod('Lunch', 4200, LUNCH_URL);
const lunch30 = makePeriod('Lunch', 1800, LUNCH_URL);
const lunch40 = makePeriod('Lunch', 2400, LUNCH_URL);
const schoolMeeting = makePeriod('School Meeting', 1800, null, {timeStyle: {display: 'none'}});
const meeting = makeExecPeriod('getMeeting', 900, {timeStyle: {display: 'none'}});
const afterSchool = makeExecPeriod('getAfterSchool', 1200, {timeStyle: {display: 'block'}});
const officeHours3PDay = makePeriod('Office Hours', 1800);
const clubLeaders = makePeriod('Club Leaders', 1800, null, {timeStyle: {display: 'none'}});
const Calendar = ({
  date,
  by = 'week',
  names: {
    p1 = 'P1',
    p2 = 'P2',
    p3 = 'P3',
    p4 = 'P4',
    p5 = 'P5',
    p6 = 'P6',
    p7 = 'P7',
    advisory = 'Advisory'
  } = {},
  options: {
    ignorePassing = false // true for block not appearing
  } = {}
}) => {
  const passProps = 
    ignorePassing
      ? {style: { display: 'none' }}
      : {timeStyle: { display: 'none' }};
  const periods = {
    p1: makePeriod(p1),
    p2: makePeriod(p2),
    p3: makePeriod(p3),
    p4: makePeriod(p4),
    p5: makePeriod(p5),
    p6: makePeriod(p6),
    p7: makePeriod(p7),
    advisory: makePeriod(advisory, 1800),
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
  const baseRawDate = RESET_DAYS_KEYS.reduce((prevRawDate, thisRawDate) => {
    const thisDate = new Date(thisRawDate);
    return thisDate >= new Date(prevRawDate) && thisDate <= date
      ? thisRawDate
      : prevRawDate;
  });
  const baseDay = RESET_DAYS[baseRawDate];
  let { dateArray, currentInd } = getDateArray(date, by);
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
    dateArray,
    by
  );
  return (
    <WeirdFlex
      direction={by === 'month' ? 'column' : 'row'}
      extraClasses={by === 'month' ? "month-topmost-layer" : "topmost-layer"}
    >
      {JSXArray}
    </WeirdFlex>
  );
};
export default Calendar;
