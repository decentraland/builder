import { User } from 'modules/auth/types'

export type Props = {
  user?: User | null
  size: 'small' | 'medium' | 'large' | 'responsive'
}
