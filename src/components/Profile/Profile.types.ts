import { ProfileProps } from 'decentraland-ui'

export type Props = ProfileProps & { currentAddress?: string }

export type MapStateProps = Pick<Props, 'currentAddress'>
