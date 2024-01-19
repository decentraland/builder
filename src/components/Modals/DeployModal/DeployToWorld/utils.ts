export const getSizesFromDeploymentError = (error: string) => {
  const pattern = /.*You can upload up to (\d+) bytes but you tried to upload (\d+).*/

  // eslint-disable-next-line
  const match = error.match(pattern)

  if (match?.length !== 3) {
    return null
  }

  return {
    maxSizeMbs: (Number(match[1]) / 1024 / 1024).toFixed(),
    deployedSizedMbs: (Number(match[2]) / 1024 / 1024).toFixed()
  }
}
