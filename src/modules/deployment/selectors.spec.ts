import { RootState } from 'modules/common/types'
import { getDeploymentsByWorlds } from './selectors'

describe('when getting deployments by worlds', () => {
  it('should returns the deployments for each world deployed', () => {
    const state = {
      ens: {
        data: {
          'my-world.dcl.eth': {
            name: 'my-world',
            subdomain: 'my-world.dcl.eth',
            worldStatus: {
              healthy: true,
              scene: {
                entityId: 'deployMyWorldId',
                baseUrl: 'https://abaseUrl'
              }
            }
          },
          'my-world2.dcl.eth': {
            name: 'my-world2',
            subdomain: 'my-world2.dcl.eth',
            worldStatus: {
              healthy: true,
              scene: {
                entityId: 'deployMyWorld2Id',
                baseUrl: 'https://abaseUrl'
              }
            }
          },
          'my-ens.dcl.eth': {
            name: 'my-ens',
            subdomain: 'my-end.dcl.eth'
          }
        }
      },
      deployment: {
        data: {
          deployMyWorldId: { id: 'deployMyWorldId' },
          deployMyWorld2Id: { id: 'deployMyWorld2Id' }
        }
      }
    } as unknown as RootState

    expect(getDeploymentsByWorlds(state)).toEqual({
      'my-world.dcl.eth': { id: 'deployMyWorldId' },
      'my-world2.dcl.eth': { id: 'deployMyWorld2Id' }
    })
  })
})
