import { RootState } from 'modules/common/types'
import { Item, ItemType } from 'modules/item/types'
import { locations } from 'routing/locations'
import { getCollectionId, getSelectedItemId, getTemplateId } from './selectors'

describe('when getting the collection id from the current url', () => {
  describe('when the collection is standard', () => {
    it('should return the collection id section of the url', () => {
      const collectionId = 'some-standard-collection-id'
      const mockState = {
        router: {
          action: 'POP',
          location: {
            pathname: locations.collectionDetail(collectionId)
          }
        }
      } as unknown

      expect(getCollectionId(mockState as RootState)).toEqual(collectionId)
    })
  })

  describe('when the collection is third party', () => {
    it('should return the collection id section of the url', () => {
      const collectionId = 'some-thirdparty-collection-id'
      const mockState = {
        router: {
          action: 'POP',
          location: {
            pathname: locations.thirdPartyCollectionDetail(collectionId)
          }
        }
      } as unknown

      expect(getCollectionId(mockState as RootState)).toEqual(collectionId)
    })
  })
})

describe('when getting the template id from the current url', () => {
  it('should return the template id section of the url', () => {
    const templateId = 'some-template-id'
    const mockState = {
      router: {
        action: 'POP',
        location: {
          pathname: locations.templateDetail(templateId)
        }
      }
    } as unknown

    expect(getTemplateId(mockState as RootState)).toEqual(templateId)
  })
})

describe('when getting the selected item id using the current url', () => {
  describe('and the url contains the item id', () => {
    const itemId = 'some-item-id'
    const mockState = {
      router: {
        action: 'POP',
        location: {
          pathname: locations.itemEditor({ itemId }),
          search: {
            item: itemId
          }
        }
      }
    } as unknown as RootState

    it('should return the item id of the url', () => {
      expect(getSelectedItemId(mockState)).toEqual(itemId)
    })
  })

  describe('and the url does not contain the item id', () => {
    describe('and the collection id is not in the url either', () => {
      const mockState = {
        router: {
          action: 'POP',
          location: {
            pathname: locations.itemEditor({})
          }
        }
      } as unknown as RootState

      it('should return null', () => {
        expect(getSelectedItemId(mockState)).toEqual(null)
      })
    })

    describe('and the url contains a collection id', () => {
      const collectionId = 'some-collection-id'
      let mockState: RootState

      beforeEach(() => {
        mockState = {
          item: {
            data: {}
          }
        } as unknown as RootState
      })

      describe('and is not a reviewing process', () => {
        beforeEach(() => {
          mockState = {
            ...mockState,
            router: {
              action: 'POP',
              location: {
                pathname: locations.itemEditor({ collectionId }),
                search: {
                  collection: collectionId
                }
              }
            }
          } as unknown as RootState
        })

        it('should return null', () => {
          expect(getSelectedItemId(mockState)).toEqual(null)
        })
      })

      describe('and the url contains the reviewing flag in true', () => {
        let emote: Item
        let wearable: Item

        beforeEach(() => {
          emote = {
            id: 'some-emote-id',
            type: ItemType.EMOTE,
            collectionId
          } as Item

          wearable = {
            id: 'some-wearable-id',
            type: ItemType.WEARABLE,
            collectionId
          } as Item

          mockState = {
            ...mockState,
            router: {
              action: 'POP',
              location: {
                pathname: locations.itemEditor({ collectionId, isReviewing: 'true' }),
                search: {
                  collection: collectionId,
                  reviewing: 'true'
                }
              }
            }
          } as unknown as RootState
        })

        describe('and there are no items related to it', () => {
          it('should return null', () => {
            expect(getSelectedItemId(mockState)).toEqual(null)
          })
        })

        describe('and the collection only has emotes', () => {
          beforeEach(() => {
            mockState = {
              ...mockState,
              item: {
                data: {
                  [emote.id]: emote
                }
              }
            } as unknown as RootState
          })

          it('should return the id of the first emote', () => {
            expect(getSelectedItemId(mockState)).toEqual(emote.id)
          })
        })

        describe('and the collection has only wearables', () => {
          beforeEach(() => {
            mockState = {
              ...mockState,
              item: {
                data: {
                  [wearable.id]: wearable
                }
              }
            } as unknown as RootState
          })

          it('should return the id of the first wearable', () => {
            expect(getSelectedItemId(mockState)).toEqual(wearable.id)
          })
        })

        describe('and the collection has wearables and emotes', () => {
          beforeEach(() => {
            mockState = {
              ...mockState,
              item: {
                data: {
                  [emote.id]: emote,
                  [wearable.id]: wearable
                }
              }
            } as unknown as RootState
          })

          it('should return the id of the first wearable', () => {
            expect(getSelectedItemId(mockState)).toEqual(wearable.id)
          })
        })
      })
    })
  })
})
