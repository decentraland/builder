import { log, engine, GLTFShape, Transform, Entity, OnDragEnded } from 'decentraland-ecs'

import { DecentralandInterface } from 'decentraland-ecs/dist/decentraland/Types'

declare var dcl: DecentralandInterface

dcl.subscribe('externalAction')

dcl.onEvent(e => {
  if (e.type === 'externalAction') {
    handleExternalAction(e.data as any)
  }
})

const editorComponents: Record<string, any> = {}

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

      log({ components, entities })

      // create new components
      for (let id in components) {
        if (!getComponentById(id)) {
          const { type, data } = components[id]
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
      }

      // TODO: remove unused components

      for (let id in entities) {
        let entity: Entity = engine.entities[id]
        if (!entity) {
          entity = new Entity()
          ;(entity as any).uuid = id
          let gizmoEvent = new OnDragEnded((e: any) => log('drag ended received in ECS', e))
          gizmoEvent.data.uuid = 'dragEndedEvent-editor'
          entity.set(gizmoEvent)
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
