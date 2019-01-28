import { Props as IconProps } from 'components/Icon/Icon.types'

export type Props = {
  name: IconProps['name']
  isActive?: boolean
  onClick?: (event: React.MouseEvent<HTMLElement>) => any
}

export type MapStateProps = Pick<Props, 'name'>
export type MapDispatchProps = Pick<Props, 'onClick'>
