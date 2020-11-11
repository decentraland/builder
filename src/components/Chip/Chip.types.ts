import { Props as IconProps } from 'components/Icon/Icon.types'

export type DefaultProps = {
  text: React.ReactNode
  icon: IconProps['name'] | ''
  type: 'square' | 'rectangle' | 'circle'
  isActive: boolean
  isDisabled: boolean
  className: string
}

export type Props = DefaultProps & {
  onClick?: (event: React.MouseEvent<HTMLElement>) => any
  onIconClick?: (event: React.MouseEvent<HTMLElement>) => any
}
