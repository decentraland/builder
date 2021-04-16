import CID from 'cids'
// @ts-ignore
import multihashing from 'multihashing-async'
import { Authenticator, AuthLink, AuthIdentity } from 'dcl-crypto'
const toBuffer = require('blob-to-buffer')

export type Timestamp = number
export type Pointer = string
export type ContentFilePath = string
export type ContentFileHash = string
export type ContentFile = {
  name: string
  content: Buffer
}

export type DeployData = {
  entityId: string
  ethAddress?: string
  signature?: string
  authChain: AuthLink[]
  files: ContentFile[]
}

export type ControllerEntity = {
  id: string
  type: string
  pointers: string[]
  timestamp: number
  content?: ControllerEntityContent[]
  metadata?: any
}

export type ControllerEntityContent = {
  file: string
  hash: string
}

export enum EntityType {
  SCENE = 'scene',
  WEARABLE = 'wearable',
  PROFILE = 'profile'
}

export type EntityId = ContentFileHash

export enum EntityField {
  CONTENT = 'content',
  POINTERS = 'pointers',
  METADATA = 'metadata'
}

export const ENTITY_FILE_NAME = 'entity.json'

export const FILE_NAME_BLACKLIST = ['.dclignore', 'Dockerfile', 'builder.json', 'src/game.ts']

export class Entity {
  constructor(
    public readonly id: EntityId,
    public readonly type: EntityType,
    public readonly pointers: Pointer[],
    public readonly timestamp: Timestamp,
    public readonly content?: Map<ContentFilePath, ContentFileHash>,
    public readonly metadata?: any
  ) {}
}

export class ControllerEntityFactory {
  static maskEntity(fullEntity: Entity, fields?: EntityField[]): ControllerEntity {
    const { id, type, timestamp } = fullEntity
    let content: ControllerEntityContent[] | undefined = undefined
    let metadata: any
    let pointers: string[] = []
    if ((!fields || fields.includes(EntityField.CONTENT)) && fullEntity.content) {
      content = Array.from(fullEntity.content.entries()).map(([file, hash]) => ({ file, hash }))
    }
    if (!fields || fields.includes(EntityField.METADATA)) {
      metadata = fullEntity.metadata
    }
    if ((!fields || fields.includes(EntityField.POINTERS)) && fullEntity.pointers) {
      pointers = fullEntity.pointers
    }
    return { id, type, timestamp, pointers, content, metadata }
  }
}

export async function computeHashes(contents: Record<string, Blob>) {
  const contentsAsHashes: Record<string, string> = {}
  for (const path in contents) {
    const blob = contents[path]
    const file = await makeContentFile(path, blob)
    const cid = await calculateBufferHash(file.content)
    contentsAsHashes[path] = cid
  }
  return contentsAsHashes
}

export async function calculateHashes(files: ContentFile[]): Promise<Map<ContentFilePath, ContentFileHash>> {
  const entries: Promise<[ContentFilePath, ContentFileHash]>[] = Array.from(files).map(file => {
    return calculateBufferHash(file.content).then<[ContentFilePath, ContentFileHash]>(hash => [file.name, hash])
  })
  return new Map(await Promise.all(entries))
}

export async function calculateBufferHash(buffer: Buffer): Promise<string> {
  const hash = await multihashing(buffer, 'sha2-256')
  return new CID(0, 'dag-pb', hash).toBaseEncodedString()
}

export async function buildDeployData(
  type: EntityType,
  identity: AuthIdentity,
  pointers: Pointer[],
  metadata: any,
  files: ContentFile[] = [],
  afterEntity?: ControllerEntity
): Promise<[DeployData, ControllerEntity]> {
  const content: Map<ContentFilePath, ContentFileHash> = await calculateHashes(files)
  const [entity, entityFile] = await buildControllerEntityAndFile(
    type,
    pointers,
    (afterEntity ? afterEntity.timestamp : Date.now()) + 1,
    content,
    metadata
  )

  const deployData: DeployData = {
    entityId: entity.id,
    authChain: await Authenticator.signPayload(identity, entity.id),
    files: [entityFile, ...files]
  }

  return [deployData, entity]
}

export async function buildControllerEntityAndFile(
  type: EntityType,
  pointers: Pointer[],
  timestamp: Timestamp,
  content?: Map<string, ContentFileHash>,
  metadata?: any
): Promise<[ControllerEntity, ContentFile]> {
  const [entity, file]: [Entity, ContentFile] = await buildEntityAndFile(type, pointers, timestamp, content, metadata)
  return [ControllerEntityFactory.maskEntity(entity), file]
}

export async function buildEntityAndFile(
  type: EntityType,
  pointers: Pointer[],
  timestamp: Timestamp,
  content?: Map<string, ContentFileHash>,
  metadata?: any
): Promise<[Entity, ContentFile]> {
  const entity: Entity = new Entity('temp-id', type, pointers, timestamp, content, metadata)
  const file: ContentFile = entityToFile(entity, ENTITY_FILE_NAME)
  const fileHash: ContentFileHash = await calculateBufferHash(file.content)
  const entityWithCorrectId = new Entity(fileHash, entity.type, entity.pointers, entity.timestamp, entity.content, entity.metadata)
  return [entityWithCorrectId, file]
}

export function entityToFile(entity: Entity, fileName?: string): ContentFile {
  let copy: any = Object.assign({}, entity)
  copy.content =
    !copy.content || !(copy.content instanceof Map)
      ? copy.content
      : // @ts-ignore
        Array.from<[string, string]>(copy.content.entries()).map<{ file: string; hash: string }>(([key, value]) => {
          return { file: key, hash: value }
        })
  delete copy.id
  return { name: fileName || 'name', content: Buffer.from(JSON.stringify(copy)) }
}

export async function deploy(contentServerUrl: string, data: DeployData) {
  const form = new FormData()
  form.append('entityId', data.entityId)
  convertModelToFormData(data.authChain, form, 'authChain')

  for (let file of data.files) {
    form.append(file.name, new Blob([file.content]), file.name)
  }

  const deployResponse = await fetch(`${contentServerUrl}/content/entities`, { method: 'POST', body: form })
  const { creationTimestamp } = await deployResponse.json()
  return creationTimestamp
}

export async function makeContentFiles(files: Record<string, string | Blob>) {
  const makeRequests = []
  for (const fileName of Object.keys(files)) {
    if (FILE_NAME_BLACKLIST.includes(fileName)) continue
    makeRequests.push(makeContentFile(fileName, files[fileName]))
  }

  return Promise.all(makeRequests)
}

export function makeContentFile(path: string, content: string | Blob): Promise<ContentFile> {
  return new Promise((resolve, reject) => {
    if (typeof content === 'string') {
      const buffer = Buffer.from(content)
      resolve({ name: path, content: buffer })
    } else if (content instanceof Blob) {
      toBuffer(content, (err: Error, buffer: Buffer) => {
        if (err) reject(err)
        resolve({ name: path, content: buffer })
      })
    } else {
      reject(new Error('Unable to create ContentFile: content must be a string or a Blob'))
    }
  })
}

function convertModelToFormData(model: any, form: FormData, namespace = ''): FormData {
  let formData = form || new FormData()
  for (let propertyName in model) {
    if (!model.hasOwnProperty(propertyName) || !model[propertyName]) continue
    let formKey = namespace ? `${namespace}[${propertyName}]` : propertyName
    if (model[propertyName] instanceof Date) {
      formData.append(formKey, model[propertyName].toISOString())
    } else if (model[propertyName] instanceof Array) {
      model[propertyName].forEach((element: any, index: number) => {
        const tempFormKey = `${formKey}[${index}]`
        convertModelToFormData(element, formData, tempFormKey)
      })
    } else if (typeof model[propertyName] === 'object' && !(model[propertyName] instanceof File)) {
      convertModelToFormData(model[propertyName], formData, formKey)
    } else {
      formData.append(formKey, model[propertyName].toString())
    }
  }
  return formData
}
