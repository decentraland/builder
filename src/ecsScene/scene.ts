import { EventEmitter } from 'events'
import { engine, GLTFShape, Transform, Entity, Component, NFTShape, IEntity, Vector3, AvatarShape, Wearable } from 'decentraland-ecs'
import * as ECS from 'decentraland-ecs'
import { createChannel } from 'decentraland-builder-scripts/channel'
import { createInventory } from 'decentraland-builder-scripts/inventory'
import { DecentralandInterface } from 'decentraland-ecs/dist/decentraland/Types'
import { EntityDefinition, AnyComponent, ComponentData, ComponentType, Scene } from 'modules/scene/types'
import { toLegacyURN } from 'lib/urnLegacy'
import { AssetParameterValues } from 'modules/asset/types'
import { BODY_SHAPE_CATEGORY, WearableBodyShape } from 'modules/item/types'
import { getEyeColors, getHairColors, getSkinColors } from 'modules/editor/avatar'

const { Gizmos, SmartItem } = require('decentraland-ecs') as any
declare var dcl: DecentralandInterface

const inventory = createInventory(ECS.UICanvas, ECS.UIContainerStack, ECS.UIImage)
class MockMessageBus {
  static emitter = new EventEmitter()
  on(message: string, callback: (value: any, sender: string) => void) {
    MockMessageBus.emitter.on(message, callback)
  }
  emit(message: string, payload: Record<any, any>) {
    MockMessageBus.emitter.emit(message, payload)
  }
}

MockMessageBus.emitter.setMaxListeners(1000)

// BEGIN DRAGONS
declare var provide: (name: string, value: any) => void
declare var load: (id: string) => Promise<any>
eval(require('raw-loader!./amd-loader.js.raw'))
eval(`self.provide = function(name, value) { self[name] = value }`)
eval(`self.load = function(id) { return new Promise(resolve => define('load', [id + '/item'], item => resolve(item.default))) }`)
Object.keys(ECS).forEach(key => provide(key, (ECS as any)[key]))
provide('MessageBus', MockMessageBus)
// END DRAGONS

let scriptBaseUrl: string | null = null
const scriptPromises = new Map<string, Promise<string>>()
const scriptInstances = new Map<string, IScript<any>>()

/*
After the migration of the assets table to use UUIDs and remove duplicates, we recreated all the assets' ids, and the legacy one was stored as a new property. 
This property is needed to load the AMD modules, since they have been namespaced with the old asset id, and has been uploaded to S3 (so the DB migration did not update them).
*/
const legacyIds = new Map<string, string>()

@Component('org.decentraland.staticEntity')
// @ts-ignore
export class StaticEntity {}

@Component('org.decentraland.script')
// @ts-ignore
export class Script {
  constructor(public assetId: string, public src: string, public values: AssetParameterValues) {}
}

const editorComponents: Record<string, any> = {}
const staticEntity = new StaticEntity()

const gizmo = new Gizmos()
gizmo.position = true
gizmo.rotation = true
gizmo.scale = true
gizmo.cycle = false

const smartItemComponent = new SmartItem()

function getComponentById(id: string) {
  console.log('Getting component by id', id)
  if (id in editorComponents) {
    console.log('Component found', id)
    return editorComponents[id]
  }
  console.log('Component not found', id)
  return null
}

function getScriptInstance(assetId: string) {
  console.log('Getting script instance for assetId: ' + assetId)
  const instance = scriptInstances.get(assetId)
  return instance
    ? Promise.resolve(instance)
    : scriptPromises
        .get(assetId)!
        .then(code => {
          console.log('Loaded script for assetId: ' + assetId)
          return code
        })
        .then(code => eval(code))
        .then(
          // if this asset has a legacy id, use that one instead to load the AMD module
          () => load(legacyIds.get(assetId) || assetId)
        )
        .then(Item => {
          const instance = new Item()
          console.log('Loaded item', instance)
          scriptInstances.set(assetId, instance)
          return instance
        })
        .catch(error => {
          console.error('Failed to load script for the asset id', error.message)
          // if something fails, return a dummy script
          console.warn(`Failed to load script for asset id ${assetId}`)
          return {
            init() {},
            spawn() {}
          }
        })
}

// avatar
let avatar: Entity | null = null
function getAvatar(): Entity {
  console.log('Getting avatar')
  if (!avatar) {
    // create avatar
    console.log('Creating avatar')
    avatar = new Entity()
    avatar.addComponent(new Transform({ position: new Vector3(8, 0, 8), scale: new Vector3(1, 1, 1) }))
    const avatarShape = new AvatarShape()
    // @TODO: Remove toLegacyURN when unity accepts urn
    avatarShape.bodyShape = toLegacyURN(WearableBodyShape.MALE.toString())
    console.log('Avatar shape: ' + avatarShape.bodyShape)
    avatarShape.skinColor = getSkinColors()[0]
    console.log('Avatar skinColor', avatarShape.skinColor)
    avatarShape.hairColor = getHairColors()[0]
    console.log('Avatar skinColor', avatarShape.hairColor)
    avatarShape.eyeColor = getEyeColors()[0]
    console.log('Avatar skinColor', avatarShape.eyeColor)
    avatarShape.name = 'Builder Avatar'
    avatarShape.wearables = []
    avatar.addComponent(avatarShape)
  } else {
    console.log('Avatar already exists')
  }

  return avatar
}

async function handleExternalAction(message: { type: string; payload: Record<string, any> }) {
  console.log('Handling external action')
  switch (message.type) {
    case 'Set script url': {
      const { url } = message.payload
      console.log('Setting script url', url)
      scriptBaseUrl = url
      break
    }
    case 'Update editor': {
      console.log('Updating editor')
      const { scene } = message.payload
      const { components, entities } = scene

      for (let id in components) {
        createComponent(components[id], scene)
        updateComponent(components[id])
        console.log('Updated component', id)
      }

      createEntities(entities)
      console.log('Created entities')
      removeUnusedEntities(entities)
      console.log('Removed unused entities')
      removeUnusedComponents(components)
      console.log('Removed unused components')
      break
    }
    case 'Toggle preview': {
      console.log('Toggle preview')
      if (message.payload.isEnabled) {
        console.log('Preview enabled', message.payload.isEnabled)
        // init scripts
        const scriptGroup = engine.getComponentGroup(Script)
        const assetIds = scriptGroup.entities.reduce((ids, entity) => {
          const script = entity.getComponent(Script)
          return ids.add(script.assetId)
        }, new Set<string>())
        console.log('About to wait for all the scripts')
        const scripts = await Promise.all(Array.from(assetIds).map(getScriptInstance))
        console.log('Waited for all the scripts')
        scripts.forEach(script => script.init({ inventory }))
        console.log('All scripts up')

        for (const entityId in engine.entities) {
          console.log('For the entity', entityId)
          const entity = engine.entities[entityId]

          // remove gizmos
          if (entity.hasComponent(gizmo)) {
            console.log('Removing entity components', entityId)
            entity.removeComponent(gizmo)
          } else {
            console.log("The entity doesn't have components", entityId)
          }

          // if entity has script...
          if (scriptGroup.hasEntity(entity)) {
            console.log('The entity has scripts', entityId)
            // ...remove the placeholder
            entity.removeComponent(GLTFShape)
            // ...create the host entity
            const transform = entity.getComponent(Transform)
            const hostTransform = new Transform()
            hostTransform.position.copyFrom(transform.position)
            hostTransform.rotation.copyFrom(transform.rotation)
            hostTransform.scale.copyFrom(transform.scale)
            const name = (entity as any).name // TODO fix this on the kernel's side
            const placeholder = Object.values(engine.entities).find(entity => (entity as Entity).name === name)
            if (placeholder) {
              engine.removeEntity(placeholder)
            }
            const host = new Entity(name)
            engine.addEntity(host)
            host.addComponent(hostTransform)
            // ...and execute the script on the host entity
            const { assetId, values } = entity.getComponent(Script)
            const script = scriptInstances.get(assetId)!
            const channel = createChannel('channel-id', host as any, new MockMessageBus())
            script.spawn(host, values, channel)
          }
        }
      } else {
        console.log('Preview disabled', message.payload.isEnabled)
        for (const entityId in engine.entities) {
          const entity = engine.entities[entityId]
          const staticEntities = engine.getComponentGroup(StaticEntity)
          if (!staticEntities.hasEntity(entity)) {
            entity.addComponentOrReplace(gizmo)
          }
        }
      }

      break
    }
    case 'Close editor': {
      console.log('Closing editor')
      for (const componentId in editorComponents) {
        console.log('Removing component', componentId)
        removeComponent(componentId)
      }
      for (const entityId in engine.entities) {
        console.log('Removing entity', entityId)
        engine.removeEntity(engine.entities[entityId])
      }
      break
    }

    case 'Update avatar': {
      console.log('Updating avatar')
      const wearables: Wearable[] = message.payload.wearables
      const avatar = getAvatar()
      console.log('Got the avatar')
      const avatarShape = avatar.getComponent(AvatarShape)
      console.log('Got the avatar shape')
      const bodyShape = wearables.find(wearable => wearable.category === BODY_SHAPE_CATEGORY)
      console.log('Got the avatar body shape', bodyShape)
      const otherWearables = wearables.filter(wearable => wearable.category !== BODY_SHAPE_CATEGORY)
      console.log('Got other wearables', otherWearables)

      avatarShape.bodyShape = bodyShape ? bodyShape.id : WearableBodyShape.MALE
      console.log('Avatar shape', avatarShape.bodyShape)
      avatarShape.wearables = otherWearables.map(wearable => wearable.id)
      console.log('Avatar wearables', avatarShape.wearables)
      avatarShape.expressionTriggerId = message.payload.animation === 'idle' ? 'Idle' : message.payload.animation // the 'idle' animation is the only one that is capitalized :shrug:
      console.log('Avatar expression trigger id', avatarShape.expressionTriggerId)
      avatarShape.expressionTriggerTimestamp = Date.now()
      avatarShape.hairColor = message.payload.hairColor
      console.log('Avatar hair color', avatarShape.hairColor)
      avatarShape.eyeColor = message.payload.eyeColor
      console.log('Avatar eye color', avatarShape.eyeColor)
      avatarShape.skinColor = message.payload.skinColor
      console.log('Avatar skin color', avatarShape.skinColor)

      if (!avatar.isAddedToEngine()) {
        console.log('Avatar not present in the engine, adding it')
        engine.addEntity(avatar)
        console.log('Added avatar')
      }
      break
    }
  }
}

function createComponent(component: AnyComponent, scene: Scene) {
  const { id, type, data } = component

  console.log('Creating component', id)
  if (!getComponentById(id)) {
    console.log('Component not found', id)
    switch (type) {
      case ComponentType.GLTFShape: {
        console.log('The component is a GLTF', id)
        const { assetId } = data as ComponentData[ComponentType.GLTFShape]
        const asset = scene.assets[assetId]
        const url = `${assetId}/${asset.model}`
        console.log('Building component with url', url)
        editorComponents[id] = new GLTFShape(url)
        editorComponents[id].isPickable = true
        break
      }
      case ComponentType.Transform:
        console.log('The component is a Transform', id)
        editorComponents[id] = new Transform()
        break
      case ComponentType.NFTShape:
        console.log('The component is an NFT Shape', id)
        editorComponents[id] = new NFTShape((data as ComponentData[ComponentType.NFTShape]).url)
        console.log('Built the NFT Shape with URL', (data as ComponentData[ComponentType.NFTShape]).url)
        editorComponents[id].isPickable = true
        break
      case ComponentType.Script: {
        const { assetId, values } = data as ComponentData[ComponentType.Script]
        console.log('The component is a Script', assetId)
        const asset = scene.assets[assetId]
        const src = asset.contents[asset.script!]
        editorComponents[id] = new Script(assetId, src, values)
        console.log('Instantiated new script', assetId)
        if (!scriptPromises.has(assetId)) {
          console.log('The script was not loaded', assetId)
          const url = scriptBaseUrl + src
          console.log('Building it with URL', url)
          const promise = fetch(url).then(resp => resp.text())
          scriptPromises.set(assetId, promise)
          // store the legacy id so we can retrieve it when loading the AMD module
          if (asset.legacyId) {
            console.log('The asset is a legacy asset', assetId)
            legacyIds.set(assetId, asset.legacyId)
          }
        } else {
          console.log('The script was loaded', id)
        }
        break
      }
    }
  }
}

function updateComponent(component: AnyComponent) {
  const { id, type, data } = component

  if (type === ComponentType.Transform) {
    const transform = editorComponents[id] as Transform
    const transformData = data as ComponentData[ComponentType.Transform]
    transform.position.copyFrom(transformData.position)
    transform.rotation.set(transformData.rotation.x, transformData.rotation.y, transformData.rotation.z, transformData.rotation.w)
    transform.scale.copyFrom(transformData.scale)
    transform.data['nonce'] = Math.random()
    transform.dirty = true
  } else if (type === ComponentType.Script) {
    const script = editorComponents[id] as Script
    const scriptData = data as ComponentData[ComponentType.Script]
    script.values = { ...scriptData.values }
  }
}

function createEntities(entities: Record<string, EntityDefinition>) {
  for (let id in entities) {
    const builderEntity = entities[id]
    let entity: IEntity = engine.entities[id]

    if (!entity) {
      entity = new Entity(builderEntity.name)
      ;(entity as any).uuid = id

      if (!builderEntity.disableGizmos) {
        entity.addComponentOrReplace(gizmo)
      } else {
        entity.addComponentOrReplace(staticEntity)
      }

      engine.addEntity(entity)
    }

    for (let componentId of builderEntity.components) {
      const component = getComponentById(componentId)
      if (component) {
        entity.addComponentOrReplace(component)
        if (component instanceof Script) {
          entity.addComponentOrReplace(smartItemComponent)
        }
      }
    }
  }
}

function removeUnusedComponents(components: Record<string, AnyComponent>) {
  for (const componentId in editorComponents) {
    const inScene = componentId in components
    if (!inScene) {
      removeComponent(componentId)
    }
  }
}

function removeComponent(componentId: string) {
  const originalComponent = editorComponents[componentId]
  if (!originalComponent) return

  try {
    engine.disposeComponent(originalComponent)
  } catch (e) {
    // stub, non-disposable components fall here
  }

  for (const entityId in engine.entities) {
    const entity = engine.entities[entityId]
    if (entity.hasComponent(originalComponent)) {
      entity.removeComponent(originalComponent)
    }
  }

  delete editorComponents[componentId]
}

function removeUnusedEntities(entities: Record<string, EntityDefinition>) {
  for (const entityId in engine.entities) {
    const inScene = entityId in entities
    if (!inScene) {
      engine.removeEntity(engine.entities[entityId])
    }
  }
}

function subscribeToExternalActions() {
  dcl.subscribe('externalAction')

  dcl.onEvent(e => {
    if ((e.type as any) === 'externalAction') {
      handleExternalAction(e.data as any)
    }
  })
}

subscribeToExternalActions()
