import { RESCUE_ITEMS_SUCCESS } from 'modules/item/actions'
import { migrations } from './store'

describe('when running migration # 15', () => {
  it('should update the rescue items success transaction payload', () => {
    const collectionId = 'collectionId'
    const collectionName = 'collectionName'
    const count = 10

    const randomPayload = { foo: 'foo', bar: 'bar' }

    const state = {
      transaction: {
        data: [
          {
            actionType: RESCUE_ITEMS_SUCCESS,
            payload: { collectionId, collectionName, count }
          },
          {
            actionType: 'random action type',
            payload: randomPayload
          }
        ]
      }
    } as any

    const newState = migrations[15](state)

    const { data } = newState.transaction

    const expectedPayload = { collection: { id: collectionId, name: collectionName }, count }
    
    expect(data[0].payload).toStrictEqual(expectedPayload)
    expect(data[1].payload).toStrictEqual(randomPayload)
  })
})
