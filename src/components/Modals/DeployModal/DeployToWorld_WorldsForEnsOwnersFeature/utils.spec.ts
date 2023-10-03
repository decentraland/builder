import { getSizesFromDeploymentError } from './utils'

describe('when getting the sizes from the deployment error', () => {
  let error: string

  describe('when the error is not the expected one', () => {
    beforeEach(() => {
      error = 'invalid'
    })

    it('should return null', () => {
      expect(getSizesFromDeploymentError(error)).toBeNull()
    })
  })

  describe('when the error is the expected one', () => {
    beforeEach(() => {
      error = `Failed to fetch https://worlds-content-server.decentraland.org/entities. Got status 400. Response was '{"error":"Bad request","message":"Deployment failed: The deployment is too big. The maximum total size allowed is 25 MB for scenes. You can upload up to 26214400 bytes but you tried to upload 37528367."}'`
    })

    it('should return an object with the deployed and max sizes in mbs', () => {
      expect(getSizesFromDeploymentError(error)).toEqual({
        deployedSizedMbs: '36',
        maxSizeMbs: '25'
      })
    })
  })
})
