const BASE_DAYS = {
  '8/26/19': 'A'
}
const BASE_DAYS_KEYS = Object.keys(BASE_DAYS);
const DAYS = ['A', 'B', 'C', 'D'];
const getDateArray = (origDate, type = 'week') => {
  const year = origDate.getFullYear();
  const month = origDate.getMonth();
  const origDateMidnight = new Date(year, month, origDate.getDate());
  if (type === 'day')
    return origDateMidnight;
  let dateArray = [];
  let currentInd = -1;
  if (type === 'month') {
    let startDate = new Date(year, month);
    let endDate = new Date(year, month+1, 0);
    let tmpArr = [];
    const EXCLUDE_WEEKENDS = [0,6];
    while (EXCLUDE_WEEKENDS.includes(startDate.getDay()))
      startDate.setDate(startDate.getDate()+1);
    tmpArr[startDate.getDay()-1] = startDate;
    let date = new Date(year, month, startDate.getDate() + 1);
    const incrementDate = (by = 1) => date.setDate(date.getDate() + by);
    while (date <= endDate) {
      while (tmpArr.length < 5) {
        if (date > endDate)
          break;
        if (date - origDateMidnight === 0)
          currentInd = [dateArray.length, tmpArr.length - 1]; // Haven't added current tmpArr yet, so dateArray.length without subtracting
        tmpArr.push(new Date(date));
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
    for (let date = startDate; date <= endDate; date.setDate(date.getDate()+1)) {
      dateArray.push(new Date(date));
      if (date - origDateMidnight === 0)
        currentInd = dateArray.length - 1;
    }
  }
  console.log(dateArray);
  return {dateArray, currentInd};
};
const WeirdFlex = ({ children, size, direction, ...props }) =>
  <div style={{
    display: 'flex',
    flexDirection: direction || 'row',
    ...(size ? {flex: ''+size} : {})
  }} {...props} >
    {children}
  </div>
const recurseGetJSX = (data, key) => {
  if (data instanceof Array) {
    const content = data.map((el, ind) => recurseGetJSX(el, ind.toString())); // Maybe use something other than index later
    return (
      <WeirdFlex>
        {content}
      </WeirdFlex>
    );
  }
  if (data instanceof Date) {
    
  }
};
const Calendar = ({date, by = 'week', names: {
  p1 = 'P1',
  p2 = 'P2',
  p3 = 'P3',
  p4 = 'P4',
  p5 = 'P5',
  p6 = 'P6',
  p7 = 'P7',
  passing = 'Passing Period',
} = {}}) => {
  const baseRawDate = BASE_DAYS_KEYS.reduce((prevRawDate, thisRawDate) => {
    const thisDate = new Date(thisRawDate)
    return thisDate >= new Date(prevRawDate) && thisDate <= date ? thisRawDate : prevRawDate;
  });
  let dateArray = getDateArray(date, by);
  const baseDay = BASE_DAYS[baseRawDate];
  const STANDARD_SCHEDULE = [
    {
      name: 'A',
      events: [
        {
          name: p1,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, {
          name: p2,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, [{
          name: 'Lunch',
          time: 2700,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }, [{
          exec: 'getMeeting',
          time: 900
        }, {
          name: 'Lunch',
          time: 1800,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }]], {
          name: passing,
          time: 300
        }, {
          name: p3,
          time: 5100
        }, {
          name: passing,
          time: 300
        }, {
          name: p4,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, {
          exec: 'getAfterSchool',
          time: 1200
        }
      ]
    }, {
      name: 'B',
      events: [
        {
          name: p5,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, {
          name: 'School Meeting',
          time: 1800
        }, {
          name: passing,
          time: 300
        }, {
          name: 'Office Hours',
          time: 1800
        }, {
          name: p6,
          time: 5100
        }, {
          name: passing,
          time: 300
        }, {
          name: 'Lunch',
          time: 4200,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }, {
          name: passing,
          time: 300
        }, {
          name: p7,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, {
          exec: 'getAfterSchool',
          time: 1200
        }
      ]
    }, {
      name: 'C',
      events: [
        {
          name: p1,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, {
          name: p4,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, [{
          name: 'Lunch',
          time: 2700,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }, [{
          exec: 'getMeeting',
          time: 900
        }, {
          name: 'Lunch',
          time: 1800,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }]], {
          name: passing,
          time: 300
        }, {
          name: p2,
          time: 5100
        }, {
          name: passing,
          time: 300
        }, {
          name: p3,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, {
          exec: 'getAfterSchool',
          time: 1200
        }
      ]
    }, {
      name: 'D',
      events: [
        {
          name: p5,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, {
          name: 'Advisory',
          time: 1800
        }, {
          name: passing,
          time: 300
        }, {
          name: 'Office Hours',
          time: 1800
        }, {
          name: p7,
          time: 5100
        }, {
          name: passing,
          time: 300
        }, [{
          name: 'Lunch',
          time: 4200,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }, [{
          name: 'Lunch',
          time: 2400,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }, {
          name: 'Club Leadership',
          time: 1800,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }]], {
          name: passing,
          time: 300
        }, {
          name: p6,
          time: 5100
        }, {
          name: passing,
          time: 600
        }, {
          exec: 'getAfterSchool',
          time: 1200
        }
      ]
    }
  ];
  const
  return <div>{JSON.stringify(dateArray)}</div>;
}
export default Calendar;