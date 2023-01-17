export const getFileStatus = state => {
  return (state.files.fileData && Object.keys(state.files.fileData).length > 0) ? Object.values(state.files.fileData)[0] : undefined
}

export const getGroups = state => state.files.groups
