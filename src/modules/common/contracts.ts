import { env } from 'decentraland-commons'

export const MANA_ADDRESS = env.get('REACT_APP_MANA_TOKEN_CONTRACT_ADDRESS', '')
export const LAND_REGISTRY_ADDRESS = env.get('REACT_APP_LAND_REGISTRY_CONTRACT_ADDRESS', '')
export const ESTATE_REGISTRY_ADDRESS = env.get('REACT_APP_ESTATE_REGISTRY_CONTRACT_ADDRESS', '')
