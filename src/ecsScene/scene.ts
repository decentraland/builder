import { log, engine, GLTFShape, Transform, Entity, Gizmos, OnDragEnded } from 'decentraland-ecs'
import { DecentralandInterface } from 'decentraland-ecs/dist/decentraland/Types'
import { EntityDefinition, AnyComponent, ComponentData, ComponentType } from '../modules/scene/types'
declare var dcl: DecentralandInterface

const editorComponents: Record<string, any> = {}

const gizmo = new Gizmos()
gizmo.position = true
gizmo.rotation = false
gizmo.scale = false
gizmo.updateEntity = false

let gizmoEvent = new OnDragEnded((e: any) => log('drag ended received in ECS', e))
gizmoEvent.data.uuid = 'dragEndedEvent-editor'

function getComponentById(id: string) {
  if (id in editorComponents) {
    return editorComponents[id]
  }
  return null
}

function handleExternalAction(message: { type: string; payload: Record<string, any> }) {
  switch (message.type) {
    case 'Update editor':
      const {
        scene: { components, entities }
      } = message.payload

      createComponents(components)
      createEntities(entities)
      // TODO: remove unused components
      // TODO: remove unused entities
      break
  }
}

function createComponents(components: AnyComponent[]) {
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
        transformData.position && transform.position.copyFrom(transformData.position)
      }
    }
  }
}

function createEntities(entities: EntityDefinition[]) {
  for (let id in entities) {
    let entity: Entity = engine.entities[id]

    if (!entity) {
      entity = new Entity()
      ;(entity as any).uuid = id
      entity.set(gizmoEvent)
      entity.set(gizmo)
      engine.addEntity(entity)
    }

    for (let componentId of entities[id].components) {
      const component = getComponentById(componentId)
      if (component) {
        entity.set(component)
      }
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
