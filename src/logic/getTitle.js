// Simply add new entries that Date.parse() supports as keys, with the actual titles as values.
const TITLE_SEARCH = {
  "8/26/19": "Welcome back! Tell a freshman about this website."
}
const TITLE_SEARCH_KEYS = Object.keys(TITLE_SEARCH);
export default rawDate => {
  const date = new Date(rawDate);
  return TITLE_SEARCH[TITLE_SEARCH_KEYS.reduce((prevRawDate, thisRawDate) => {
    const thisDate = new Date(thisRawDate)
    return thisDate >= new Date(prevRawDate) && thisDate <= date ? thisRawDate : prevRawDate;
  })];
}