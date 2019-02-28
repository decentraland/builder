import { Omit } from 'decentraland-dapps/dist/lib/types'

import { ProjectLayout } from 'modules/project/types'
import { Props as LayoutProps } from 'components/LayoutPicker/LayoutPicker.types'

export type Props = Omit<LayoutProps, 'onChange'> & {
  onChange: (layout: ProjectLayout) => void
}

export type State = {
  hasMaxError: boolean
}
