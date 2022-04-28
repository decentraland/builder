import { ChainId } from '@dcl/schemas'
import { AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { ContractName } from 'decentraland-transactions'
import { buildManaAuthorization } from './mana'
import { toFixedMANAValue } from './mana'

describe('when formatting the price', () => {
  describe('when formatting alphanumeric text', () => {
    it('should return the supplied value', () => {
      expect(toFixedMANAValue('abc')).toBe('abc')
    })
  })

  describe('when formatting an invalid number', () => {
    it('should return the supplied value', () => {
      expect(toFixedMANAValue('1.bc')).toBe('1.bc')
    })
  })

  describe('when formatting a valid integer number', () => {
    it('should return the supplied value', () => {
      expect(toFixedMANAValue('1')).toBe('1')
    })
  })

  describe('when formatting a valid float number', () => {
    describe('when the number has 2 or less decimal places', () => {
      it('should return the supplied value', () => {
        expect(toFixedMANAValue('51.3')).toBe('51.3')
      })
    })

    describe('when the number has more than 2 decimal places', () => {
      it('should fix the value to the first two decimal places', () => {
        expect(toFixedMANAValue('765.93023')).toBe('765.93')
      })
    })
  })
})

describe('when building the MANA authorization', () => {
  const address = '0x0'

  describe("and the MANA contract doesn't exist for the given chain id", () => {
    it('should throw', () => {
      expect(() => buildManaAuthorization('0x0', ChainId.ETHEREUM_RINKEBY, ContractName.CollectionFactory)).toThrowError(
        'Could not get a valid contract for MANAToken using chain 4'
      )
    })
  })

  describe("and the given contract name doesn't exist for the given chain id", () => {
    it('should throw', () => {
      expect(() => buildManaAuthorization('0x0', ChainId.ETHEREUM_GOERLI, ContractName.Forwarder)).toThrowError(
        'Could not get a valid contract for Forwarder using chain 5'
      )
    })
  })

  describe('and the MANA and the given contracts exist', () => {
    it('should return an authorization of MANA for the given contract', () => {
      expect(buildManaAuthorization('0x0', ChainId.ETHEREUM_MAINNET, ContractName.Marketplace)).toEqual({
        type: AuthorizationType.ALLOWANCE,
        address: address,
        contractName: ContractName.MANAToken,
        contractAddress: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
        authorizedAddress: '0x8e5660b4ab70168b5a6feea0e0315cb49c8cd539',
        chainId: ChainId.ETHEREUM_MAINNET
      })
    })
  })
})
