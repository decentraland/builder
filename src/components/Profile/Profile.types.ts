import { ProfileProps } from 'decentraland-ui/dist/components/Profile/Profile'

export type Props = ProfileProps<React.ElementType> & { currentAddress?: string }

export type MapStateProps = Pick<Props, 'currentAddress'>

export type OwnProps = ProfileProps<React.ElementType>
