import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '@/styles/reset.css';
import '@/styles/common.less';
import { Provider } from 'react-redux';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

import store from './store';
import App from './App';

loader.config({ monaco });

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
