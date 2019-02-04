import { EditorScene } from 'modules/editor/types'
import { env } from 'decentraland-commons'
import { Project } from 'modules/project/types'
const script = require('raw-loader!../../ecsScene/scene.js')

const CONTENT_SERVER = env.get('REACT_APP_CONTENT_SERVER', () => {
  throw new Error('Missing REACT_APP_CONTENT_SERVER env variable')
})

export function getNewScene(project: Project): EditorScene {
  const mappings = {
    'game.js': `data:application/javascript;base64,${btoa(script)}`
  }

  return {
    baseUrl: CONTENT_SERVER as string,
    display: {
      title: project.title
    },
    owner: 'Decentraland',
    contact: {
      name: 'Decentraland',
      email: 'support@decentraland.org'
    },
    scene: {
      // TODO: This should be received as param
      parcels: project.parcels ? project.parcels.map(({ x, y }) => `${x},${y}`) : ['0,0'],
      base: project.parcels ? `${project.parcels[0].x}, ${project.parcels[0].y}` : '0,0'
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
