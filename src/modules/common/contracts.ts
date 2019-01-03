import { env } from 'decentraland-commons'
import { contracts } from 'decentraland-eth'

const MANAToken = new contracts.MANAToken(env.get('REACT_APP_MANA_TOKEN_CONTRACT_ADDRESS'))
export { MANAToken }
