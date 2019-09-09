import { render } from 'preact';
import App from './App';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' });
}
render(<App />, document.getElementById('root'));
