import { Props as IconProps } from 'components/Icon/Icon.types'

export type Props = {
  text?: string
  icon?: IconProps['name']
  type: 'square' | 'rectangle'
  isActive: boolean
  isDisabled: boolean
  onClick?: (event: React.MouseEvent<HTMLElement>) => any
}
