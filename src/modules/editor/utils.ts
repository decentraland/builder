import { EditorScene } from 'modules/editor/types'
import { SceneDefinition } from 'modules/scene/types'
import { writeGLTFComponents, writeEntities } from 'modules/scene/writers'
import { AssetMappings } from 'modules/asset/types'
const ecs = require('raw-loader!./ecs')

export function getEditorScene(title: string, scene: SceneDefinition, assetMappings: AssetMappings): EditorScene {
  const { components, entities } = scene
  const ownScript = writeGLTFComponents(components) + writeEntities(entities, components)
  const script = ecs + ownScript
  const mappings = {
    'game.js': `data:application/javascript;base64,${btoa(script)}`,
    ...assetMappings
  }

  return {
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
