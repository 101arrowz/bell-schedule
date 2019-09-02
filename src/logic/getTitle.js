const TITLE_SEARCH = {
  "2019-08-30T01:07:15.378Z": "Test failed",
  "2019-08-30T01:07:49.745Z": "Test success"
}
const TITLE_SEARCH_KEYS = Object.keys(TITLE_SEARCH);
export default rawDate => {
  const date = new Date(rawDate);
  return TITLE_SEARCH[TITLE_SEARCH_KEYS.reduce((prevRawDate, thisRawDate) => {
    const thisDate = new Date(thisRawDate)
    return thisDate >= new Date(prevRawDate) && thisDate <= date ? thisRawDate : prevRawDate;
  })];
}