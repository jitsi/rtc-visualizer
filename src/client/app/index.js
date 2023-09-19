import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Search from './search'
import Render from './render'
import { fetchConfig } from './config/actions'

export default () => {
  const dispatch = useDispatch()

  const isConfigSet = useSelector((state) => state.config.isSet)

  useEffect(() => {
    // Fetch the config when the component mounts
    dispatch(fetchConfig())
  }, [dispatch])

  return (
    <div>
      {
        isConfigSet
          ? (new URLSearchParams(window.location.search).has('dumpId'))
              ? <Render />
              : <Search />
          : 'Loading config...'
      }
    </div>
  )
}
