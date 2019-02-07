import { Props as ParentProps } from '../AssetCard.types'

export type Props = Pick<ParentProps, 'asset' | 'isDragging'>
