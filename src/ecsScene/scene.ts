// tslint:disable
import { EventEmitter } from 'events'
import {
  engine,
  GLTFShape,
  Transform,
  Entity,
  Component,
  NFTShape,
  IEntity,
  Vector3,
  AvatarShape,
  Color4,
  Wearable
} from 'decentraland-ecs'
import * as ECS from 'decentraland-ecs'
import { createChannel } from 'decentraland-builder-scripts/channel'
import { createInventory } from 'decentraland-builder-scripts/inventory'

import { DecentralandInterface } from 'decentraland-ecs/dist/decentraland/Types'
import { EntityDefinition, AnyComponent, ComponentData, ComponentType, Scene } from 'modules/scene/types'
import { AssetParameterValues } from 'modules/asset/types'
import { BODY_SHAPE_CATEGORY, WearableBodyShape } from 'modules/item/types'
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
  if (id in editorComponents) {
    return editorComponents[id]
  }
  return null
}

function getScriptInstance(assetId: string) {
  const instance = scriptInstances.get(assetId)
  return instance
    ? Promise.resolve(instance)
    : scriptPromises
        .get(assetId)!
        .then(code => eval(code))
        .then(() => load(assetId))
        .then(Item => {
          const instance = new Item()
          scriptInstances.set(assetId, instance)
          return instance
        })
        .catch(() => {
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
  if (!avatar) {
    // create avatar
    avatar = new Entity()
    avatar.addComponent(new Transform({ position: new Vector3(8, 0, 8), scale: new Vector3(1, 1, 1) }))
    const avatarShape = new AvatarShape()
    avatarShape.bodyShape = 'dcl://base-avatars/BaseMale'
    avatarShape.skinColor = new Color4(0.8671875, 0.6953125, 0.5625, 1)
    avatarShape.hairColor = new Color4(0.8671875, 0.6953125, 0.5625, 1)
    avatarShape.eyeColor = new Color4(0.8671875, 0.6953125, 0.5625, 1)
    avatarShape.name = 'Builder Avatar'
    avatarShape.wearables = []
    avatar.addComponent(avatarShape)
    engine.addEntity(avatar)
  }
  return avatar
}

async function handleExternalAction(message: { type: string; payload: Record<string, any> }) {
  switch (message.type) {
    case 'Set script url': {
      const { url } = message.payload
      scriptBaseUrl = url
      break
    }
    case 'Update editor': {
      const { scene } = message.payload
      const { components, entities } = scene

      for (let id in components) {
        createComponent(components[id], scene)
        updateComponent(components[id])
      }

      createEntities(entities)
      removeUnusedEntities(entities)
      removeUnusedComponents(components)

      break
    }
    case 'Toggle preview': {
      if (message.payload.isEnabled) {
        // init scripts
        const scriptGroup = engine.getComponentGroup(Script)
        const assetIds = scriptGroup.entities.reduce((ids, entity) => {
          const script = entity.getComponent(Script)
          return ids.add(script.assetId)
        }, new Set<string>())
        const scripts = await Promise.all(Array.from(assetIds).map(getScriptInstance))
        scripts.forEach(script => script.init({ inventory }))

        for (const entityId in engine.entities) {
          const entity = engine.entities[entityId]

          // remove gizmos
          if (entity.hasComponent(gizmo)) {
            entity.removeComponent(gizmo)
          }

          // if entity has script...
          if (scriptGroup.hasEntity(entity)) {
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
      for (const componentId in editorComponents) {
        removeComponent(componentId)
      }
      for (const entityId in engine.entities) {
        engine.removeEntity(engine.entities[entityId])
      }
      break
    }

    case 'Update avatar': {
      const wearables: Wearable[] = message.payload.wearables
      const avatar = getAvatar()
      const avatarShape = avatar.getComponent(AvatarShape)
      const bodyShape = wearables.find(wearable => wearable.category === BODY_SHAPE_CATEGORY)
      const otherWearables = wearables.filter(wearable => wearable.category !== BODY_SHAPE_CATEGORY)
      avatarShape.bodyShape = bodyShape ? bodyShape.id : WearableBodyShape.MALE
      avatarShape.wearables = otherWearables.map(wearable => wearable.id)
      avatarShape.expressionTriggerId = message.payload.animation === 'idle' ? 'Idle' : message.payload.animation // the 'idle' animation is the only one that is capitalized :shrug:
      avatarShape.expressionTriggerTimestamp = Date.now()
      break
    }
  }
}

function createComponent(component: AnyComponent, scene: Scene) {
  const { id, type, data } = component

  if (!getComponentById(id)) {
    switch (type) {
      case ComponentType.GLTFShape: {
        const { assetId } = data as ComponentData[ComponentType.GLTFShape]
        const asset = scene.assets[assetId]
        const url = `${assetId}/${asset.model}`
        editorComponents[id] = new GLTFShape(url)
        editorComponents[id].isPickable = true
        break
      }
      case ComponentType.Transform:
        editorComponents[id] = new Transform()
        break
      case ComponentType.NFTShape:
        editorComponents[id] = new NFTShape((data as ComponentData[ComponentType.NFTShape]).url)
        editorComponents[id].isPickable = true
        break
      case ComponentType.Script: {
        const { assetId, values } = data as ComponentData[ComponentType.Script]
        const asset = scene.assets[assetId]
        const src = asset.contents[asset.script!]
        editorComponents[id] = new Script(assetId, src, values)
        if (!scriptPromises.has(assetId)) {
          const url = scriptBaseUrl + src
          const promise = fetch(url).then(resp => resp.text())
          scriptPromises.set(assetId, promise)
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
