const TITLE_SEARCH = {
};
const TITLE_SEARCH_KEYS = Object.keys(TITLE_SEARCH);
export default rawDate => {
  const date = new Date(rawDate);
  let latestFound = null;
  return TITLE_SEARCH[TITLE_SEARCH_KEYS.reduce((prevRawDate, thisRawDate) => {
    const thisDate = new Date(thisRawDate)
    return thisDate > new Date(prevRawDate) && thisDate <= date;
  })]
}