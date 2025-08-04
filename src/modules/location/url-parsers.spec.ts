import {
  getSelectedItemIdFromSearchParams,
  getSelectedCollectionIdFromSearchParams,
  isReviewingFromSearchParams,
  getNewItemNameFromSearchParams,
  getLandIdFromPath,
  getProjectIdFromPath,
  getTemplateIdFromPath,
  getCollectionIdFromPath,
  getThirdPartyCollectionIdFromPath,
  getCollectionIdFromUrl,
  getENSNameFromPath,
  getItemIdFromPath
} from './url-parsers'

describe('when getting the selected item id from search params', () => {
  let search: string

  describe('when item param is present', () => {
    beforeEach(() => {
      search = '?item=test-item-id'
    })

    it('should return the item id', () => {
      expect(getSelectedItemIdFromSearchParams(search)).toBe('test-item-id')
    })
  })

  describe('when multiple params are present', () => {
    beforeEach(() => {
      search = '?collection=test-collection&item=test-item-id&other=value'
    })

    it('should return the first item id', () => {
      expect(getSelectedItemIdFromSearchParams(search)).toBe('test-item-id')
    })
  })

  describe('when item param is not present', () => {
    beforeEach(() => {
      search = '?collection=test-collection&other=value'
    })

    it('should return null', () => {
      expect(getSelectedItemIdFromSearchParams(search)).toBeNull()
    })
  })

  describe('when item param contains URL encoded values', () => {
    beforeEach(() => {
      search = '?item=test%20item%20id'
    })

    it('should return decoded value', () => {
      expect(getSelectedItemIdFromSearchParams(search)).toBe('test item id')
    })
  })
})

describe('when getting the selected collection id from search params', () => {
  let search: string

  describe('when collection param is present', () => {
    beforeEach(() => {
      search = '?collection=test-collection-id'
    })

    it('should return the collection id', () => {
      expect(getSelectedCollectionIdFromSearchParams(search)).toBe('test-collection-id')
    })
  })

  describe('when collectionId param is present', () => {
    beforeEach(() => {
      search = '?collectionId=test-collection-id'
    })

    it('should return the collection id', () => {
      expect(getSelectedCollectionIdFromSearchParams(search)).toBe('test-collection-id')
    })
  })

  describe('when both collection and collectionId params are present', () => {
    beforeEach(() => {
      search = '?collectionId=old-id&collection=new-id'
    })

    it('should prefer collection param over collectionId param', () => {
      expect(getSelectedCollectionIdFromSearchParams(search)).toBe('new-id')
    })
  })

  describe('when neither collection nor collectionId params are present', () => {
    beforeEach(() => {
      search = '?item=test-item&other=value'
    })

    it('should return null', () => {
      expect(getSelectedCollectionIdFromSearchParams(search)).toBeNull()
    })
  })
})

describe('when checking if the user is reviewing from search params', () => {
  let search: string

  describe('when reviewing param is "true"', () => {
    beforeEach(() => {
      search = '?reviewing=true'
    })

    it('should return true', () => {
      expect(isReviewingFromSearchParams(search)).toBe(true)
    })
  })

  describe('when reviewing param is "false"', () => {
    beforeEach(() => {
      search = '?reviewing=false'
    })

    it('should return false', () => {
      expect(isReviewingFromSearchParams(search)).toBe(false)
    })
  })

  describe('when reviewing param is any other value', () => {
    beforeEach(() => {
      search = '?reviewing=yes'
    })

    it('should return false', () => {
      expect(isReviewingFromSearchParams(search)).toBe(false)
    })
  })

  describe('when reviewing param is not present', () => {
    beforeEach(() => {
      search = '?item=test-item&collection=test-collection'
    })

    it('should return false', () => {
      expect(isReviewingFromSearchParams(search)).toBe(false)
    })
  })
})

describe('when getting the new item name from search params', () => {
  let search: string

  describe('when newItem param is present', () => {
    beforeEach(() => {
      search = '?newItem=test-item-name'
    })

    it('should return the new item name', () => {
      expect(getNewItemNameFromSearchParams(search)).toBe('test-item-name')
    })
  })

  describe('when newItem param is not present', () => {
    beforeEach(() => {
      search = '?collection=test-collection&item=test-item'
    })

    it('should return null', () => {
      expect(getNewItemNameFromSearchParams(search)).toBeNull()
    })
  })

  describe('when newItem param contains URL encoded values', () => {
    beforeEach(() => {
      search = '?newItem=test%20item%20name'
    })

    it('should return decoded value', () => {
      expect(getNewItemNameFromSearchParams(search)).toBe('test item name')
    })
  })
})

describe('when getting the land id from path', () => {
  let url: string

  describe('when given a valid land detail path', () => {
    beforeEach(() => {
      url = '/land/123-456'
    })

    it('should return the land id', () => {
      expect(getLandIdFromPath(url)).toBe('123-456')
    })
  })

  describe('when given a land detail path with additional segments', () => {
    beforeEach(() => {
      url = '/land/123-456/transfer'
    })

    it('should return the land id', () => {
      expect(getLandIdFromPath(url)).toBe('123-456')
    })
  })

  describe('when given a non-matching path', () => {
    beforeEach(() => {
      url = '/scenes/some-project'
    })

    it('should return null', () => {
      expect(getLandIdFromPath(url)).toBeNull()
    })
  })
})

describe('when getting the project id from path', () => {
  let url: string

  describe('when given a valid scene detail path', () => {
    beforeEach(() => {
      url = '/scenes/test-project-id'
    })

    it('should return the project id', () => {
      expect(getProjectIdFromPath(url)).toBe('test-project-id')
    })
  })

  describe('when given a non-matching path', () => {
    beforeEach(() => {
      url = '/land/123-456'
    })

    it('should return null', () => {
      expect(getProjectIdFromPath(url)).toBeNull()
    })
  })
})

describe('when getting the template id from path', () => {
  let url: string

  describe('when given a valid template detail path', () => {
    beforeEach(() => {
      url = '/templates/test-template-id'
    })

    it('should return the template id', () => {
      expect(getTemplateIdFromPath(url)).toBe('test-template-id')
    })
  })

  describe('when given a non-matching path', () => {
    beforeEach(() => {
      url = '/scenes/some-project'
    })

    it('should return null', () => {
      expect(getTemplateIdFromPath(url)).toBeNull()
    })
  })
})

describe('when getting the collection id from path', () => {
  let url: string

  describe('when given a valid collection detail path', () => {
    beforeEach(() => {
      url = '/collections/test-collection-id'
    })

    it('should return the collection id', () => {
      expect(getCollectionIdFromPath(url)).toBe('test-collection-id')
    })
  })

  describe('when given a non-matching path', () => {
    beforeEach(() => {
      url = '/scenes/some-project'
    })

    it('should return null', () => {
      expect(getCollectionIdFromPath(url)).toBeNull()
    })
  })
})

describe('when getting the third party collection id from path', () => {
  let url: string

  describe('when given a valid third party collection detail path', () => {
    beforeEach(() => {
      url = '/thirdPartyCollections/test-collection-id'
    })

    it('should return the collection id', () => {
      expect(getThirdPartyCollectionIdFromPath(url)).toBe('test-collection-id')
    })
  })

  describe('when given a non-matching path', () => {
    beforeEach(() => {
      url = '/collections/some-collection'
    })

    it('should return null', () => {
      expect(getThirdPartyCollectionIdFromPath(url)).toBeNull()
    })
  })
})

describe('when getting the collection id from url', () => {
  let url: string

  describe('when given a standard collection path', () => {
    beforeEach(() => {
      url = '/collections/test-collection-id'
    })

    it('should return the collection id', () => {
      expect(getCollectionIdFromUrl(url)).toBe('test-collection-id')
    })
  })

  describe('when given a third party collection path', () => {
    beforeEach(() => {
      url = '/thirdPartyCollections/test-collection-id'
    })

    it('should return the collection id', () => {
      expect(getCollectionIdFromUrl(url)).toBe('test-collection-id')
    })
  })

  describe('when given a path that matches neither collection type', () => {
    beforeEach(() => {
      url = '/scenes/some-project'
    })

    it('should return null', () => {
      expect(getCollectionIdFromUrl(url)).toBeNull()
    })
  })
})

describe('when getting the ENS name from path', () => {
  let url: string

  describe('when given a valid ENS detail path', () => {
    beforeEach(() => {
      url = '/names/test-name'
    })

    it('should return the ENS name', () => {
      expect(getENSNameFromPath(url)).toBe('test-name')
    })
  })

  describe('when given a non-matching path', () => {
    beforeEach(() => {
      url = '/collections/some-collection'
    })

    it('should return null', () => {
      expect(getENSNameFromPath(url)).toBeNull()
    })
  })
})

describe('when getting the item id from path', () => {
  let url: string

  describe('when given a valid item detail path', () => {
    beforeEach(() => {
      url = '/items/test-item-id'
    })

    it('should return the item id', () => {
      expect(getItemIdFromPath(url)).toBe('test-item-id')
    })
  })

  describe('when given a non-matching path', () => {
    beforeEach(() => {
      url = '/collections/some-collection'
    })

    it('should return null', () => {
      expect(getItemIdFromPath(url)).toBeNull()
    })
  })
})
