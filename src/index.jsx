import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'normalize.css';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import configureStore from './store';
import App from './components/App';
import { USE_LOCAL_FONTAWESOME } from './constants';

if (process.env.NODE_ENV !== 'production' && USE_LOCAL_FONTAWESOME) {
  // use local fontawesome css file for offline development
  const link = document.createElement('link');
  link.href = 'static/css/font-awesome.min.css';
  link.rel = 'stylesheet';
  link.type = 'text/css';
  document.getElementsByTagName('head')[0].appendChild(link);
}

const store = configureStore();

render((<AppContainer><App store={store} /></AppContainer>), document.getElementById('app'));

if (module.hot) {
  module.hot.accept('./components/App', () => {
    render(
      <AppContainer>
        <App store={store} />
      </AppContainer>,
      document.getElementById('app'),
    );
  });
}
