import { Props as IconProps } from 'components/Icon/Icon.types'

export type DefaultProps = {
  text: string
  icon: IconProps['name'] | ''
  type: 'square' | 'rectangle'
  isActive: boolean
  isDisabled: boolean
}

export type Props = DefaultProps & {
  onClick?: (event: React.MouseEvent<HTMLElement>) => any
}
