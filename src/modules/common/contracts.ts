import { config } from 'config'

export const MANA_ADDRESS = config.get('MANA_TOKEN_CONTRACT_ADDRESS', '')
export const LAND_REGISTRY_ADDRESS = config.get('LAND_REGISTRY_CONTRACT_ADDRESS', '')
export const ESTATE_REGISTRY_ADDRESS = config.get('ESTATE_REGISTRY_CONTRACT_ADDRESS', '')
export const ERC721_COLLECTION_ADDRESS = config.get('ERC721_COLLECTION_CONTRACT_ADDRESS', '')
export const ENS_ADDRESS = config.get('ENS_CONTRACT_ADDRESS', '')
export const ENS_RESOLVER_ADDRESS = config.get('RESOLVER_CONTRACT_ADDRESS', '')
export const CONTROLLER_ADDRESS = config.get('CONTROLLER_ADDRESS', '')
export const REGISTRAR_ADDRESS = config.get('REGISTRAR_ADDRESS', '')
