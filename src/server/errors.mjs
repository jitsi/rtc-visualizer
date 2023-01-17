const error = (error, text) => ({
  error,
  text
})

export const paramError = text => error('ParamError', text)

export const dbError = text => error('DBError', text)
