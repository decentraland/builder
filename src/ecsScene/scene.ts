import { log, engine, GLTFShape, Transform, Entity } from 'decentraland-ecs'
import { Gizmos, OnDragEnded } from './Gizmos'
import { DecentralandInterface } from 'decentraland-ecs/dist/decentraland/Types'

const editorComponents: Record<string, any> = {}
const gizmo = new Gizmos()
{
  gizmo.position = true
  gizmo.rotation = false
  gizmo.scale = false
  gizmo.updateEntity = false
}

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

      // create new components
      for (let id in components) {
        const { type, data } = components[id]

        if (!getComponentById(id)) {
          switch (type) {
            case 'GLTFShape':
              editorComponents[id] = new GLTFShape(data.src)
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
            data.position && transform.position.copyFrom(data.position)
          }
        }
      }

      // TODO: remove unused components

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
}

declare var dcl: DecentralandInterface

{
  dcl.subscribe('externalAction')

  dcl.onEvent(e => {
    if ((e.type as any) === 'externalAction') {
      handleExternalAction(e.data as any)
    }
  })
}
