import { engine, GLTFShape, Transform, Entity, Component, NFTShape, IEntity, ISystem } from 'decentraland-ecs'
import * as ECS from 'decentraland-ecs'
import { DecentralandInterface } from 'decentraland-ecs/dist/decentraland/Types'
import { EntityDefinition, AnyComponent, ComponentData, ComponentType } from 'modules/scene/types'
const { Gizmos, OnGizmoEvent } = require('decentraland-ecs') as any
declare var dcl: DecentralandInterface

// BEGIN DRAGONS
declare var provide: (name: string, value: any) => void
declare var load: (id: string) => Promise<any>
eval(require('raw-loader!./amd-loader.js.raw'))
eval(`self.provide = function(name, value) { self[name] = value }`)
eval(`self.load = function(id) { return new Promise(resolve => define('load', [id + '/item'], item => resolve(item.default))) }`)
Object.keys(ECS).forEach(key => provide(key, (ECS as any)[key]))
// END DRAGONS

export interface IScript<T extends {}> {
  init(): void
  spawn(host: Entity, props: T): void
}

const scriptPromises = new Map<string, Promise<string>>()
const scriptInstances = new Map<string, IScript<any>>()

@Component('org.decentraland.staticEntity')
// @ts-ignore
export class StaticEntity {}

@Component('org.decentraland.script')
// @ts-ignore
export class Script {
  constructor(public assetId: string, public src: string, public props: Record<string, string | number>) {}
}

const editorComponents: Record<string, any> = {}
const editorSystems: Set<ISystem> = new Set()
const staticEntity = new StaticEntity()

const gizmo = new Gizmos()
gizmo.position = true
gizmo.rotation = true
gizmo.scale = true
gizmo.cycle = false

let gizmoEvent = new OnGizmoEvent((_: any) => {
  /* */
})
gizmoEvent.data.uuid = 'gizmoEvent-editor'

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
}

async function handleExternalAction(message: { type: string; payload: Record<string, any> }) {
  switch (message.type) {
    case 'Update editor': {
      const {
        scene: { components, entities }
      } = message.payload

      createComponents(components)
      createEntities(entities)
      removeUnusedComponents(components)
      removeUnusedEntities(entities)

      break
    }
    case 'Toggle preview': {
      if (message.payload.isEnabled) {
        // save editor system references (these systems will not be turned off later when all the scripts are stopped)
        const systems = (engine as any).addedSystems
        for (const system of systems) {
          editorSystems.add(system)
        }

        // init scripts
        const scriptGroup = engine.getComponentGroup(Script)
        const assetIds = scriptGroup.entities.reduce((ids, entity) => {
          const script = entity.getComponent(Script)
          return ids.add(script.assetId)
        }, new Set<string>())
        const scripts = await Promise.all(Array.from(assetIds).map(getScriptInstance))
        scripts.forEach(script => script.init())

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
            const host = new Entity()
            engine.addEntity(host)
            host.addComponent(transform)
            // ...and execute the script on the host entity
            const { assetId, props } = entity.getComponent(Script)
            const script = scriptInstances.get(assetId)!
            script.spawn(host, props)
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

        // Removes all the systems added by scripts
        const systems = (engine as any).addedSystems
        for (const system of systems) {
          if (!editorSystems.has(system)) {
            engine.removeSystem(system)
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
  }
}

function createComponents(components: Record<string, AnyComponent>) {
  for (let id in components) {
    const { type, data } = components[id]
    if (!getComponentById(id)) {
      switch (type) {
        case ComponentType.GLTFShape:
          editorComponents[id] = new GLTFShape((data as ComponentData[ComponentType.GLTFShape]).src)
          editorComponents[id].isPickable = true
          break
        case ComponentType.Transform:
          editorComponents[id] = new Transform()
          break
        case ComponentType.NFTShape:
          editorComponents[id] = new NFTShape((data as ComponentData[ComponentType.NFTShape]).url)
          editorComponents[id].isPickable = true
          break
        case ComponentType.Script: {
          const { assetId, src, props } = data as ComponentData[ComponentType.Script]
          editorComponents[id] = new Script(assetId, src, props)
          if (!scriptPromises.has(assetId)) {
            const promise = fetch(src).then(resp => resp.text())
            scriptPromises.set(assetId, promise)
          }
          break
        }
      }
    }

    const component = editorComponents[id]

    if (component) {
      if (type === 'Transform') {
        const transform = component as Transform
        const transformData = data as ComponentData[ComponentType.Transform]
        transform.position.copyFrom(transformData.position)
        transform.rotation.set(transformData.rotation.x, transformData.rotation.y, transformData.rotation.z, transformData.rotation.w)
        transform.scale.copyFrom(transformData.scale)
        transform.data['nonce'] = Math.random()
        transform.dirty = true
      }
    }
  }
}

function createEntities(entities: Record<string, EntityDefinition>) {
  for (let id in entities) {
    const builderEntity = entities[id]
    let entity: IEntity = engine.entities[id]

    if (!entity) {
      entity = new Entity()
      ;(entity as any).uuid = id

      if (!builderEntity.disableGizmos) {
        entity.addComponentOrReplace(gizmoEvent)
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
