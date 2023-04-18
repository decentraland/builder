import { BuilderClient } from '@dcl/builder-client'
import { ChainId, Network } from '@dcl/schemas'
import { ERC20__factory, ERC20, DCLController__factory } from 'contracts'
import { getChainIdByNetwork, getSigner } from 'decentraland-dapps/dist/lib/eth'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { ethers } from 'ethers'
import { CONTROLLER_V2_ADDRESS, MANA_ADDRESS } from 'modules/common/contracts'
import { getWallet } from 'modules/wallet/utils'
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import { allowClaimManaRequest, claimNameRequest, fetchENSAuthorizationRequest } from './actions'
import { ensSaga } from './sagas'

jest.mock('@dcl/builder-client')

const MockBuilderClient = BuilderClient as jest.MockedClass<typeof BuilderClient>

let builderClient: BuilderClient
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

  manaContract = {
    approve: jest.fn(),
    allowance: jest.fn()
  } as unknown as ERC20
})

describe('when handling the approve claim mana request', () => {
  it('should call the manaContract approve function with the dcl controller v2 address', async () => {
    const allowance = '100'
    const signer = {} as ethers.Signer

    await expectSaga(ensSaga, builderClient)
      .provide([
        [call(getWallet), { address: 'address', chainId: ChainId.ETHEREUM_GOERLI }],
        [call(getSigner), signer],
        [call([ERC20__factory, 'connect'], MANA_ADDRESS, signer), manaContract]
      ])
      .call([manaContract, 'approve'], CONTROLLER_V2_ADDRESS, allowance)
      .dispatch(allowClaimManaRequest(allowance))
      .silentRun()
  })
})

describe('when handling the fetch of authorizations request', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call mana.allowance with the dcl controller v2 address', async () => {
    const from = 'address'

    jest.spyOn(ethers, 'Contract').mockReturnValueOnce(manaContract)

    await expectSaga(ensSaga, builderClient)
      .provide([
        [select(getAddress), from],
        [call(getChainIdByNetwork, Network.ETHEREUM), ChainId.ETHEREUM_GOERLI]
      ])
      .call(manaContract.allowance, from, CONTROLLER_V2_ADDRESS)
      .dispatch(fetchENSAuthorizationRequest())
      .silentRun()
  })
})

describe('when handling the claim name request', () => {
  it('should call DCLController__factory.connect with the dcl controller v2 address', async () => {
    const signer = {} as ethers.Signer

    await expectSaga(ensSaga, builderClient)
      .provide([
        [call(getWallet), { address: 'address' }],
        [call(getSigner), signer]
      ])
      .call([DCLController__factory, 'connect'], CONTROLLER_V2_ADDRESS, signer)
      .dispatch(claimNameRequest('name'))
      .silentRun()
  })
})
