const DEFAULT_PREFERENCES = {
  updateInterval: 30,
}
export default {
  setPrefs(prefs) {
    localStorage.setItem('prefs', JSON.stringify(prefs));
    return prefs;
  },
  getPrefs() {
    const data = localStorage.getItem('prefs');
    return data || this.setPrefs(DEFAULT_PREFERENCES);
  }
}