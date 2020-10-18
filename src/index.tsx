import React    from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import * as serviceWorker from './serviceWorker';

const element =

  <React.StrictMode>
    <App/>
  </React.StrictMode>
;
ReactDOM.render(element, document.getElementById('root'));

serviceWorker.unregister();
