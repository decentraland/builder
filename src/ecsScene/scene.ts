import { engine, GLTFShape, Transform, Entity, Component, NFTShape, IEntity } from 'decentraland-ecs'
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

let scripts: Record<string, string> = {}
let fetched: Record<string, boolean> = {}

@Component('staticEntity')
// @ts-ignore
export class StaticEntity {}

@Component('script')
// @ts-ignore
export class Script {
  constructor(public assetId: string, public src: string) {}
}

const editorComponents: Record<string, any> = {}
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

function handleExternalAction(message: { type: string; payload: Record<string, any> }) {
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
      for (const entityId in engine.entities) {
        const entity = engine.entities[entityId]
        if (message.payload.isEnabled) {
          entity.removeComponent(gizmo)
          const scriptEntities = engine.getComponentGroup(Script)
          if (scriptEntities.hasEntity(entity)) {
            entity.removeComponent(GLTFShape)
            const transform = entity.getComponent(Transform)
            const script = entity.getComponent(Script)
            const hostEntity = new Entity()
            engine.addEntity(hostEntity)
            hostEntity.addComponent(transform)
            let waitForFetch = Promise.resolve()
            if (!fetched[script.assetId]) {
              waitForFetch = fetch(script.src)
                .then(resp => resp.text())
                .then(code => eval(code))
                .then(() => {
                  fetched[script.assetId] = true
                })
            }
            waitForFetch.then(() => load(script.assetId).then(item => item(hostEntity, { isLocked: false })))
          }
        } else {
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
          const { assetId, src } = data as ComponentData[ComponentType.Script]
          editorComponents[id] = new Script(assetId, src)
          scripts[assetId] = src
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
