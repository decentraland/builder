import { add } from 'decentraland-dapps/dist/modules/analytics/utils'
import { REGISTER_EMAIL, RegisterEmailAction } from 'modules/contest/actions'

add(REGISTER_EMAIL, 'Contest email', action => (action as RegisterEmailAction).payload.email)
