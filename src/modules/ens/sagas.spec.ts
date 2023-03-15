import { BuilderClient } from '@dcl/builder-client'
import { ChainId } from '@dcl/schemas'
import { ERC20__factory, ERC20 } from 'contracts'
import { getSigner } from 'decentraland-dapps/dist/lib/eth'
import { ethers } from 'ethers'
import { getIsDCLControllerV2Enabled } from 'modules/features/selectors'
import { getWallet } from 'modules/wallet/utils'
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import { allowClaimManaRequest } from './actions'
import { ensSaga } from './sagas'

jest.mock('@dcl/builder-client')

const MockBuilderClient = BuilderClient as jest.MockedClass<typeof BuilderClient>

describe('when handling the approve claim mana request', () => {
  let builderClient: BuilderClient
  let manaAddress: string
  let allowance: string
  let signer: ethers.Signer
  let manaContract: ERC20

  beforeEach(() => {
    builderClient = new MockBuilderClient(
      'url',
      {
        authChain: [],
        ephemeralIdentity: { address: 'address', privateKey: 'prikey', publicKey: 'pubkey' },
        expiration: new Date()
      },
      'address'
    )

    manaAddress = '0xe7fdae84acaba2a5ba817b6e6d8a2d415dbfedbe'
    allowance = '100'
    signer = {} as ethers.Signer
    manaContract = {
      approve: jest.fn()
    } as unknown as ERC20
  })

  describe('and the dcl controller v2 feature flag is enabled', () => {
    it('should call the manaContract approve function with the dcl controller v2 address', async () => {
      const expectedControllerAddress = '0x055a4d2c8f044bc9aac260c9194fd177654329cd'

      await expectSaga(ensSaga, builderClient)
        .provide([
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_GOERLI }],
          [call(getSigner), signer],
          [call([ERC20__factory, 'connect'], manaAddress, signer), manaContract],
          [select(getIsDCLControllerV2Enabled), true]
        ])
        .call([manaContract, 'approve'], expectedControllerAddress, allowance)
        .dispatch(allowClaimManaRequest(allowance))
        .silentRun()
    })
  })

  describe('and the dcl controller v2 feature flag is disabled', () => {
    it('should call the manaContract approve function with the dcl controller address', async () => {
      const expectedControllerAddress = '0x6ff05b6271bbed8f16a46e6073d27ad94224e0ac'

      await expectSaga(ensSaga, builderClient)
        .provide([
          [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_GOERLI }],
          [call(getSigner), signer],
          [call([ERC20__factory, 'connect'], manaAddress, signer), manaContract],
          [select(getIsDCLControllerV2Enabled), false]
        ])
        .call([manaContract, 'approve'], expectedControllerAddress, allowance)
        .dispatch(allowClaimManaRequest(allowance))
        .silentRun()
    })
  })
})
