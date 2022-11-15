import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getQwertyLayout } from 'modules/keyboard/utils'
import { MapStateProps } from './ShortcutModal.types'
import ShortcutsModal from './ShortcutsModal'

const mapState = (_: RootState): MapStateProps => ({
  shortcuts: getQwertyLayout()
})

export default connect(mapState)(ShortcutsModal)
