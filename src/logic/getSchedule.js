const getOffset
export default (time, by = 'week', {
  p1 = 'P1',
  p2 = 'P2',
  p3 = 'P3',
  p4 = 'P4',
  p5 = 'P5',
  p6 = 'P6',
  p7 = 'P7',
  passing = 'Passing Period',
} = {}) => {

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
        }, [{
          name: 'Lunch',
          time: 2700,
          link: '//resources.harker.org/download/upper-school-lunch-menu/'
        }, [{
          name: 'Sophomore/Senior Meeting',
          time: 900
        }, {

        }]], {

        }
      ]
    }
  ];
}