import CID from 'cids'
import { Eth } from 'web3x-es/eth'
import { sha3 } from 'web3x-es/utils'
// @ts-ignore
import multihashing from 'multihashing-async'
import { Address } from 'web3x-es/address'
const toBuffer = require('blob-to-buffer')

export type Timestamp = number
export type Pointer = string
export type ContentFileHash = string
export type ContentFile = {
  name: string
  content: Buffer
}

export type DeployData = {
  entityId: string
  ethAddress: string
  signature: string
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

export class Entity {
  constructor(
    public readonly id: EntityId,
    public readonly type: EntityType,
    public readonly pointers: Pointer[],
    public readonly timestamp: Timestamp,
    public readonly content?: Map<string, ContentFileHash>,
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

export async function calculateHashes(files: ContentFile[]): Promise<Map<string, ContentFile>> {
  const entries: Promise<[string, ContentFile]>[] = Array.from(files).map(file => {
    return calculateBufferHash(file.content).then<[string, ContentFile]>((hash: string) => [hash, file])
  })
  return new Map(await Promise.all(entries))
}

export async function calculateBufferHash(buffer: Buffer): Promise<string> {
  const hash = await multihashing(buffer, 'sha2-256')
  return new CID(0, 'dag-pb', hash).toBaseEncodedString()
}

export async function buildDeployData(
  pointers: Pointer[],
  metadata: any,
  files: ContentFile[] = [],
  afterEntity?: ControllerEntity
): Promise<[DeployData, ControllerEntity]> {
  const hashes: Map<ContentFileHash, ContentFile> = await calculateHashes(files)
  const content: Map<string, string> = new Map(
    Array.from(hashes.entries()).map<Readonly<[string, string]>>(([hash, file]) => [file.name, hash])
  )

  const [entity, entityFile] = await buildControllerEntityAndFile(
    EntityType.SCENE,
    pointers,
    (afterEntity ? afterEntity.timestamp : Date.now()) + 1,
    content,
    metadata
  )

  const [address, signature] = await hashAndSignMessage(entity.id)

  const deployData: DeployData = {
    entityId: entity.id,
    ethAddress: address.toString(),
    signature: signature,
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

export async function hashAndSignMessage(message: string): Promise<[Address, string]> {
  const eth = Eth.fromCurrentProvider()

  if (!eth) throw new Error('Failed to sign message')

  const address = (await eth.getAccounts())[0]
  const messageHash = createEthereumMessageHash(message)
  const signature = await eth.sign(address, messageHash)
  return [address, signature]
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

export function createEthereumMessageHash(msg: string) {
  let msgWithPrefix: string = `\x19Ethereum Signed Message:\n${msg.length}${msg}`
  return sha3(msgWithPrefix)
}

export async function deploy(contentServerUrl: string, data: DeployData) {
  const form = new FormData()
  form.append('entityId', data.entityId)
  form.append('ethAddress', data.ethAddress)
  form.append('signature', data.signature)

  for (let file of data.files) {
    form.append(file.name, new Blob([file.content]), file.name)
  }

  const deployResponse = await fetch(`${contentServerUrl}/entities`, { method: 'POST', body: form })
  const { creationTimestamp } = await deployResponse.json()
  return creationTimestamp
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
