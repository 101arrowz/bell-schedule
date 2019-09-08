import SPECIAL_SCHEDULE from './special';
import RESET_DAYS from './resetDays';
const RESET_DAYS_KEYS = Object.keys(RESET_DAYS);
const getDateArray = (origDate, type = 'week') => {
  const year = origDate.getFullYear();
  const month = origDate.getMonth();
  const origDateMidnight = new Date(year, month, origDate.getDate());
  if (type === 'day') return origDateMidnight;
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
    const dateNum = origDate.getDate();
    const dayInd = origDate.getDay();
    let startDate = new Date(year, month, dateNum - dayInd + 1);
    let endDate = new Date(year, month, dateNum - dayInd + 5);
    for (
      let date = startDate;
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      dateArray.push(date.getTime());
      if (date - origDateMidnight === 0) currentInd = dateArray.length - 1;
    }
  }
  return { dateArray, currentInd };
};
const WeirdFlex = ({ children, size, direction = null, ...props }) => (
  <div
    style={{
      display: 'flex',
      ...(direction & {flexDirection: direction}),
      ...(size && { flex: '' + size }),
    }}
    {...props}
  >
    {children}
  </div>
);
const makePeriod = (name, time = 5100, link) => ({
  name,
  time,
  ...(link && { link })
});
const makeExecPeriod = (exec, time) => ({
  exec,
  ...(time && { time })
});
const recurseReplace = (events, periods) =>
  events.map(el =>
    typeof el === 'string'
      ? periods[el]
      : el instanceof Array
      ? recurseReplace(el, periods)
      : el
  );
const execFunctions = {
  getMeeting: dayIndex => ({name: 'Day mod 8 is '+ dayIndex % 8})
}
const generateJSXDay = (schedule, dayIndex, weekIndex, recursiveLayer = 0) => {
  if (schedule instanceof Array) {
    return (
      <WeirdFlex direction={recursiveLayer % 2 ? 'row' : 'column'} >
        {schedule.map((miniSchedule) => generateJSXDay(miniSchedule, dayIndex, weekIndex, recursiveLayer+1))}
      </WeirdFlex>
    );
  }
  if (schedule instanceof Object) {
    if (schedule.exec) {
      if (!execFunctions[schedule.exec])
        return;
      schedule = {
        ...schedule,
        ...(execFunctions[schedule.exec](dayIndex, weekIndex))
      }
    }
    return (
      <WeirdFlex size={schedule.time}>
        {schedule.name}
      </WeirdFlex>);
  }
}
const generateJSXWeekly = (baseTime, baseDay, standardSchedule, specialSchedule, dateArray) => {
  const standardScheduleKeys = Object.keys(standardSchedule).sort();
  let daysSinceBase = baseDay[1]; // Pure number of days counter
  const dayIndOffset = standardScheduleKeys.indexOf(baseDay[0]) - baseDay[1]; // Add when calculating which day should be used
  const EXCLUDE_WEEKENDS = [0,6];
  for (let iterDate = new Date(baseTime); iterDate < dateArray[0]; iterDate.setDate(iterDate.getDate()+1)) {
    const iterTime = iterDate.getTime();
    if (!EXCLUDE_WEEKENDS.includes(iterDate.getDay()) && (!specialSchedule[iterTime] || specialSchedule[iterTime].replace))
      daysSinceBase++;
  }
  const JSXArray = dateArray.map((date, ind) => {
    let todaySchedule;
    if (specialSchedule[date]) {
      todaySchedule = specialSchedule[date];
      if (specialSchedule[date].replace) {
        daysSinceBase++;
      }
    } else {
      todaySchedule = standardSchedule[standardScheduleKeys[(daysSinceBase+dayIndOffset) % standardScheduleKeys.length]];
      daysSinceBase++;
    }
    console.log('todaySchedule is ', todaySchedule);
    return generateJSXDay(todaySchedule, daysSinceBase+dayIndOffset, ind);
  })
  return JSXArray;
}
const LUNCH_URL = '//resources.harker.org/download/upper-school-lunch-menu/';
const lunch = makePeriod('Lunch', 2700, LUNCH_URL);
const longLunch = makePeriod('Lunch', 4200, LUNCH_URL);
const lunch30 = makePeriod('Lunch', 1800, LUNCH_URL);
const lunch40 = makePeriod('Lunch', 2400, LUNCH_URL);
const schoolMeeting = makePeriod('School Meeting', 1800);
const getMeetingPeriod = makeExecPeriod('getMeeting', 900);
const afterSchool = makeExecPeriod('getAfterSchool', 1200);
const officeHours3PDay = makePeriod('Office Hours', 1800);
const clubLeadership = makePeriod('Club Leadership', 1800);
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
    passing = 'Passing Period',
    advisory = 'Advisory'
  } = {}
}) => {
  const periods = {
    p1: makePeriod(p1),
    p2: makePeriod(p2),
    p3: makePeriod(p3),
    p4: makePeriod(p4),
    p5: makePeriod(p5),
    p6: makePeriod(p6),
    p7: makePeriod(p7),
    advisory: makePeriod(advisory, 1800),
    pass5: makePeriod(passing, 300),
    pass10: makePeriod(passing, 600),
    getMeeting: getMeetingPeriod,
    afterSchool,
    schoolMeeting,
    lunch,
    longLunch,
    lunch30,
    lunch40,
    officeHours3PDay,
    clubLeadership
  };
  const baseRawDate = RESET_DAYS_KEYS.reduce((prevRawDate, thisRawDate) => {
    const thisDate = new Date(thisRawDate);
    return thisDate >= new Date(prevRawDate) && thisDate <= date
      ? thisRawDate
      : prevRawDate;
  });
  const baseDay = RESET_DAYS[baseRawDate];
  let {dateArray, currentInd} = getDateArray(date, by);
  const standardSchedule = {
    A: [
      periods.p1,
      periods.pass10,
      periods.p2,
      [periods.lunch, [periods.getMeeting, periods.lunch30]],
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
      [periods.lunch, [periods.getMeeting, periods.lunch30]],
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
      [periods.longLunch, [periods.lunch40, periods.clubLeadership]],
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
  };
  console.log(dateArray);
  const JSXArray = by === 'month' ? dateArray.map(arr => generateJSXWeekly(baseRawDate, baseDay, standardSchedule, specialSchedule, arr)) : generateJSXWeekly(baseRawDate, baseDay, standardSchedule, specialSchedule, dateArray)
  return (
    <div>
      {JSXArray}
    </div>
  );
};
export default Calendar;
