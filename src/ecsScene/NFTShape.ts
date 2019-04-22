import { Component, executeTask, Entity, BasicMaterial, PlaneShape, engine } from 'decentraland-ecs'
import assert from 'assert'

// const USER_FETCH_URL = 'https://api.opensea.io/api/v1/assets/?owner={owner}&asset_contract_address={contract}'
const ASSET_FETCH_URL = 'https://api.opensea.io/api/v1/assets/?token_ids={asset}&asset_contract_address={contract}'

const contracts = new Map<string, string>()

contracts.set('CryptoKitties', '0x06012c8cf97bead5deae237070f9587f8e7a266d')

// For some reason, the browser's URL class does not like custom protocols.
// We are using regular expressions to handle the URL
function parseURL(url: string): { protocol: string; registry: string; asset: string | void } | null {
  const result = /([^:]+):\/\/([^/]+)(?:\/(.+))?/.exec(url)
  if (result) {
    return {
      asset: result[3],
      registry: result[2],
      protocol: result[1]
    }
  }
  return null
}

let planeShape: PlaneShape | null = null

@Component('nft-shape')
export class NFTShape {
  private finalShape!: Promise<Entity>

  constructor(url: string) {
    this.finalShape = executeTask(async () => this.init(url))
  }

  addedToEntity(entity: Entity) {
    this.finalShape.then(newEntity => {
      debugger
      newEntity.setParent(entity)

      // TODO: remove this after updating to 5.1, entities are added automatically to the engine
      engine.addEntity(newEntity)
    })
  }

  removedFromEntity(_entity: Entity) {
    this.finalShape.then(newEntity => {
      engine.removeEntity(newEntity)
    })
  }

  private async init(url: string): Promise<Entity> {
    const parsedUrl = parseURL(url)

    if (!parsedUrl) throw new Error('The provided URL is not valid: ' + url)

    let { protocol, registry, asset } = parsedUrl

    if (protocol.endsWith(':')) {
      protocol = protocol.replace(/:$/, '')
    }

    if (protocol !== 'ethereum') {
      throw new Error('Invalid protocol: ' + protocol)
    }

    const contract = contracts.get(registry)
    if (!contract) {
      const available = Array.from(contracts.keys())
      throw new Error(`Invalid DAR: ${registry} valids are: ${available.join(', ')}`)
    }

    if (!asset) throw new Error('An asset id is required. ' + url)

    const assetsRequest = await fetch(ASSET_FETCH_URL.replace('{asset}', asset).replace('{contract}', contract))
    const assetsResponseJson = await assetsRequest.json()

    assert(assetsResponseJson.assets.length > 0, 'Empty response, there is no asset')

    const assetData = assetsResponseJson.assets[0]

    assert(!!assetData.image_preview_url, 'image_preview_url was empty')

    const imageUrl = await fetchBase64Image(assetData.image_preview_url)
    const material = new BasicMaterial()

    material.texture = imageUrl

    const entity = new Entity()

    if (!planeShape) {
      planeShape = new PlaneShape()
    }

    entity.addComponent(planeShape)
    entity.addComponent(material)

    return entity
  }
}

async function fetchBase64Image(url: string) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {}, // 'X-KEY': 'asd'
    mode: 'cors',
    cache: 'default'
  })

  const buffer = await response.arrayBuffer()
  let base64Flag = `data:${response.headers.get('content-type')};base64,`
  let imageStr = arrayBufferToBase64(buffer)

  return base64Flag + imageStr
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  let bytes = [].slice.call(new Uint8Array(buffer))

  bytes.forEach((b: number) => (binary += String.fromCharCode(b)))

  return btoa(binary)
}
