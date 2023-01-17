import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './app/index.js'
import store from './app/store.js'

window.store = store

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main')
)
