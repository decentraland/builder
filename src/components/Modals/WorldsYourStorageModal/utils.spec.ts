import { AccountHoldings, fetchAccountHoldings, getMbsFromAccountHoldings } from './utils'

describe('when fetching the account holdings', () => {
  let account: string

  beforeEach(() => {
    account = '0x123'
  })

  describe('when the request fails', () => {
    beforeEach(() => {
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('some error'))
    })

    it('should return null', async () => {
      expect(await fetchAccountHoldings(account)).toBeNull()
    })
  })

  describe('when the request does not fail', () => {
    describe('when the response is not ok', () => {
      beforeEach(() => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
          ok: false
        } as Response)
      })

      it('should return null', async () => {
        expect(await fetchAccountHoldings(account)).toBeNull()
      })
    })

    describe('when the response is ok', () => {
      let accountHoldings: AccountHoldings

      beforeEach(() => {
        accountHoldings = {} as AccountHoldings

        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: accountHoldings
            })
        } as Response)
      })

      it('should return the account holdings', async () => {
        expect(await fetchAccountHoldings(account)).toEqual(accountHoldings)
      })
    })
  })
})

describe('when gettings mbs from account holdings', () => {
  let accountHoldings: AccountHoldings

  describe('when account holdings has 10000 MANA, 100 LANDs and 100 NAMEs', () => {
    beforeEach(() => {
      accountHoldings = {
        ownedMana: 10000,
        ownedLands: 100,
        ownedNames: 100
      } as AccountHoldings
    })

    it('should return an object with 500 manaMbs, 10000 landMbs and 10000 nameMbs', () => {
      expect(getMbsFromAccountHoldings(accountHoldings)).toEqual({
        manaMbs: 500,
        landMbs: 10000,
        nameMbs: 10000
      })
    })
  })

  describe('when account holdings has 0 MANA, 0 LANDs and 0 NAMEs', () => {
    beforeEach(() => {
      accountHoldings = {
        ownedMana: 0,
        ownedLands: 0,
        ownedNames: 0
      } as AccountHoldings
    })

    it('should return an object with 0 manaMbs, 0 landMbs and 0 nameMbs', () => {
      expect(getMbsFromAccountHoldings(accountHoldings)).toEqual({
        manaMbs: 0,
        landMbs: 0,
        nameMbs: 0
      })
    })
  })

  describe('when account holdings has 1999 MANA, 0 LANDs and 0 NAMEs', () => {
    beforeEach(() => {
      accountHoldings = {
        ownedMana: 1999,
        ownedLands: 0,
        ownedNames: 0
      } as AccountHoldings
    })

    it('should return an object with 0 manaMbs, 0 landMbs and 0 nameMbs', () => {
      expect(getMbsFromAccountHoldings(accountHoldings)).toEqual({
        manaMbs: 0,
        landMbs: 0,
        nameMbs: 0
      })
    })
  })
})
