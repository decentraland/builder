import { render } from '@testing-library/react'
import { Props } from './WorldPermissionsAvatarWithInfo.types'
import {
  WORLD_PERMISSIONS_AVATAR_WITH_INFO_LOADING_TEST_ID,
  WORLD_PERMISSIONS_AVATAR_WITH_INFO_AVATAR_TEST_ID,
  WORLD_PERMISSIONS_AVATAR_WITH_INFO_WALLET_TEST_ID,
  WORLD_PERMISSIONS_AVATAR_WITH_INFO_NAME_TEST_ID,
  WorldPermissionsAvatarWithInfo
} from './WorldPermissionsAvatarWithInfo'
import { Avatar } from '@dcl/schemas'

const wallet = '0x123'
const profileAvatar: Avatar = {
  name: 'Test',
  description: '',
  avatar: {
    bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseFemale',
    skin: {
      color: {
        r: 0.800000011920929,
        g: 0.6078431606292725,
        b: 0.46666666865348816
      }
    },
    hair: {
      color: {
        r: 0.9254902005195618,
        g: 0.9098039269447327,
        b: 0.886274516582489
      }
    },
    eyes: {
      color: {
        r: 0.7490196228027344,
        g: 0.6196078658103943,
        b: 0.3529411852359772
      }
    },
    wearables: [
      'urn:decentraland:off-chain:base-avatars:f_white_shirt',
      'urn:decentraland:off-chain:base-avatars:distressed_black_Jeans',
      'urn:decentraland:off-chain:base-avatars:classic_shoes',
      'urn:decentraland:off-chain:base-avatars:hair_punk',
      'urn:decentraland:off-chain:base-avatars:punk_piercing',
      'urn:decentraland:off-chain:base-avatars:f_eyebrows_02'
    ],
    snapshots: {
      body: 'https://peer.decentraland.zone/content/contents/bafkreiarwoymxlpclqppwfczzzdujbr5rns3ojuxwassmazgdlakbfm67e',
      face256: 'https://peer.decentraland.zone/content/contents/bafkreibjvgmypx2cvfhq4saqw7ghwi3uw2ppzg6s34ci34npnoxstf7jeq'
    },
    emotes: []
  },
  ethAddress: '0x123',
  version: 1,
  tutorialStep: 0,
  hasClaimedName: false,
  userId: '0x123',
  hasConnectedWeb3: true
}

const renderWorldPermissionsAvatarWithInfo = (props: Partial<Props> = {}) => {
  return render(<WorldPermissionsAvatarWithInfo isLoading={false} walletAddress={wallet} profileAvatar={profileAvatar} {...props} />)
}

describe('when rendering the Worlds Permissions Avatar With Info', () => {
  let renderedComponent: ReturnType<typeof renderWorldPermissionsAvatarWithInfo>

  describe("when it's loading", () => {
    beforeEach(() => {
      renderedComponent = renderWorldPermissionsAvatarWithInfo({ isLoading: true })
    })

    it('should render the loading component', () => {
      const { queryByTestId } = renderedComponent
      expect(queryByTestId(WORLD_PERMISSIONS_AVATAR_WITH_INFO_LOADING_TEST_ID)).toBeInTheDocument()
    })
  })

  describe("when it's not loading", () => {
    describe('and when the user has a name', () => {
      beforeEach(() => {
        renderedComponent = renderWorldPermissionsAvatarWithInfo()
      })
      it('should render the user avatar with the name', () => {
        const { getByTestId } = renderedComponent
        expect(getByTestId(WORLD_PERMISSIONS_AVATAR_WITH_INFO_AVATAR_TEST_ID)).toBeInTheDocument()
        expect(getByTestId(WORLD_PERMISSIONS_AVATAR_WITH_INFO_WALLET_TEST_ID)).toContainElement(
          getByTestId(WORLD_PERMISSIONS_AVATAR_WITH_INFO_NAME_TEST_ID)
        )
      })
    })

    describe('and when the user has no name', () => {
      beforeEach(() => {
        renderedComponent = renderWorldPermissionsAvatarWithInfo({ profileAvatar: { ...profileAvatar, name: '' } })
      })
      it('should render the user avatar without the name', () => {
        const { getByTestId, queryByTestId } = renderedComponent
        expect(getByTestId(WORLD_PERMISSIONS_AVATAR_WITH_INFO_AVATAR_TEST_ID)).toBeInTheDocument()
        expect(getByTestId(WORLD_PERMISSIONS_AVATAR_WITH_INFO_WALLET_TEST_ID)).toBeInTheDocument()
        expect(queryByTestId(WORLD_PERMISSIONS_AVATAR_WITH_INFO_NAME_TEST_ID)).not.toBeInTheDocument()
      })
    })
  })
})
