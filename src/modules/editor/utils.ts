import { EditorScene } from 'modules/editor/types'
import { env } from 'decentraland-commons'
const script = require('raw-loader!../../ecsScene/scene.js')

const CONTENT_SERVER = env.get('REACT_APP_CONTENT_SERVER', () => {
  throw new Error('Missing REACT_APP_CONTENT_SERVER env variable')
})

export function getNewScene(title: string): EditorScene {
  const mappings = {
    'game.js': `data:application/javascript;base64,${btoa(script)}`
  }

  return {
    baseUrl: CONTENT_SERVER as string,
    display: {
      title
    },
    owner: 'Decentraland',
    contact: {
      name: 'Decentraland',
      email: 'support@decentraland.org'
    },
    scene: {
      // TODO: This should be received as param
      parcels: ['0,0'],
      base: '0,0'
    },
    communications: {
      type: 'webrtc',
      signalling: 'https://rendezvous.decentraland.org'
    },
    policy: {
      fly: true,
      voiceEnabled: true,
      blacklist: [],
      teleportPosition: '0,0,0'
    },
    main: 'game.js',
    _mappings: mappings
  }
}
