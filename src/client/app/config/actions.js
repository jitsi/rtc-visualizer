import Actions from './actions-types'

export const setConfig = (config) => ({
  type: Actions.SetConfig,
  payload: config
})

export const fetchConfig = () => {
  return async (dispatch) => {
    try {
      const response = await fetch('/rtcstats-view/meet-external/rtc-visualizer/config')
      if (!response.ok) {
        throw new Error('Unable to fetch confiug data')
      }

      const config = await response.json()
      dispatch(setConfig(config))
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }
}
