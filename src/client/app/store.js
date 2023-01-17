import { configureStore } from '@reduxjs/toolkit'
import files from './files/reducer'
import search from './search/reducer'
import searchMiddleware from './search/middleware'

const reducer = {
  files,
  search
}

export default configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(searchMiddleware)
})
