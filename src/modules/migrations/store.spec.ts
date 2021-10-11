import { RESCUE_ITEMS_SUCCESS } from 'modules/item/actions'
import { migrations } from './store'

describe('when running migration # 15', () => {
  it('should update the rescue items success transaction payload', () => {
    const state = {
      transaction: {
        data: [
          {
            actionType: RESCUE_ITEMS_SUCCESS,
            payload: { collectionId: 'collectionId', collectionName: 'collectionName', count: 10 }
          },
          {
            actionType: 'random action type',
            payload: { foo: 'foo', bar: 'bar' }
          }
        ]
      }
    } as any

    const newState = migrations[15](state)

    const { data } = newState.transaction

    expect(data[0].payload.collection).toStrictEqual({ id: 'collectionId', name: 'collectionName' })
    expect(data[1].payload).toStrictEqual({ foo: 'foo', bar: 'bar' })
  })
})
