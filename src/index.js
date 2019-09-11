import { render } from 'preact';
import App from './App';
if ('serviceWorker' in navigator) {
  // Uncomment below when prod - annoying for dev
  navigator.serviceWorker.register('../public/sw.js');
}
render(<App />, document.getElementById('root'));
