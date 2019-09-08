import { render } from 'preact';
import App from './App';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {scope: '/'}).then(console.log);
}
render(<App />, document.getElementById('root'));
