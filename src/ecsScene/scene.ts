import { engine, GLTFShape, Transform, Entity, Gizmos, OnGizmoEvent, Component } from 'decentraland-ecs'
import { DecentralandInterface } from 'decentraland-ecs/dist/decentraland/Types'
import { EntityDefinition, AnyComponent, ComponentData, ComponentType } from 'modules/scene/types'

declare var dcl: DecentralandInterface

@Component('staticEntity')
// @ts-ignore
export class StaticEntity {}

const editorComponents: Record<string, any> = {}
const staticEntity = new StaticEntity()

const gizmo = new Gizmos()
gizmo.position = true
gizmo.rotation = true
gizmo.scale = false
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
        if (message.payload.enabled) {
          entity.remove(Gizmos)
        } else {
          const staticEntities = engine.getComponentGroup(StaticEntity)
          if (!staticEntities.hasEntity(entity.uuid)) {
            entity.set(gizmo)
          }
        }
      }
    }
  }
}

function createComponents(components: Record<string, AnyComponent>) {
  for (let id in components) {
    const { type, data } = components[id]

    if (!getComponentById(id)) {
      switch (type) {
        case 'GLTFShape':
          editorComponents[id] = new GLTFShape((data as ComponentData[ComponentType.GLTFShape]).src)
          editorComponents[id].isPickable = true
          break
        case 'Transform':
          editorComponents[id] = new Transform()
          break
      }
    }

    const component = editorComponents[id]

    if (component) {
      if (type === 'Transform') {
        const transform = component as Transform
        const transformData = data as ComponentData[ComponentType.Transform]
        transform.position.copyFrom(transformData.position)
        transform.rotation.set(transformData.rotation.x, transformData.rotation.y, transformData.rotation.z, transformData.rotation.w)
        transform.data['nonce'] = Math.random()
        transform.dirty = true
      }
    }
  }
}

function createEntities(entities: Record<string, EntityDefinition>) {
  for (let id in entities) {
    const builderEntity = entities[id]
    let entity: Entity = engine.entities[id]

    if (!entity) {
      entity = new Entity()
      ;(entity as any).uuid = id
      if (!builderEntity.disableGizmos) {
        entity.set(gizmoEvent)
        entity.set(gizmo)
      } else {
        entity.set(staticEntity)
      }

      engine.addEntity(entity)
    }

    for (let componentId of builderEntity.components) {
      const component = getComponentById(componentId)
      if (component) {
        entity.set(component)
      }
    }
  }
}

function removeUnusedComponents(components: Record<string, AnyComponent>) {
  for (const componentId in editorComponents) {
    const inScene = componentId in components
    if (!inScene) {
      const originalComponent = editorComponents[componentId]

      try {
        engine.disposeComponent(originalComponent)
      } catch (e) {
        // stub, non-disposable components fall here
      }

      for (const entityId in engine.entities) {
        const entity = engine.entities[entityId]
        if (entity.has(originalComponent)) {
          entity.remove(originalComponent)
        }
      }

      delete editorComponents[componentId]
    }
  }
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
