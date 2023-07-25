import { Manifest } from 'modules/project/types'
import { addMappings } from './ISSUE-485'
import {
  toProjectCloudSchema,
  addScale,
  addEntityName,
  addAssets,
  removeScriptSrc,
  sanitizeEntityName,
  sanitizeEntityName2,
  replaceUserIdWithEthAddress,
  wrapSdk6
} from './utils'
import { Migration } from './types'
import { SceneSDK6 } from 'modules/scene/types'

export const migrations: Migration<Manifest> = {
  '2': input => {
    addMappings(input.scene as unknown as SceneSDK6)
    return input
  },
  '3': input => {
    if (input.project) {
      input.project = toProjectCloudSchema(input.project)
    }
    addMappings(input.scene as unknown as SceneSDK6)
    return input
  },
  '4': input => {
    addScale(input.scene as unknown as SceneSDK6)
    return input
  },
  '5': input => {
    addEntityName(input.scene as unknown as SceneSDK6)
    return input
  },
  '6': input => {
    addAssets(input.scene as unknown as SceneSDK6)
    return input
  },
  '7': input => {
    removeScriptSrc(input.scene as unknown as SceneSDK6)
    return input
  },
  '8': input => {
    sanitizeEntityName(input.scene as unknown as SceneSDK6)
    return input
  },
  '9': input => {
    sanitizeEntityName2(input.scene as unknown as SceneSDK6)
    return input
  },
  '10': input => {
    replaceUserIdWithEthAddress(input.project)
    return input
  },
  '11': input => {
    input.scene = wrapSdk6(input.scene as unknown as SceneSDK6)
    return input
  }
}
