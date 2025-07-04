import React from 'react'

import Search from './search'
import Render from './render'

export default () => {
  return (
    <div>
      {
        (new URLSearchParams(window.location.search).has('dumpId'))
          ? <Render />
          : <Search />
      }
    </div>
  )
}
