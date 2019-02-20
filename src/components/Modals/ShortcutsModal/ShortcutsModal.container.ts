import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getQwertyLayout } from 'modules/keyboard/utils'
import { MapStateProps, MapDispatchProps } from './ShortcutModal.types'
import ShortcutsModal from './ShortcutsModal'

const mapState = (_: RootState): MapStateProps => ({
  shortcuts: getQwertyLayout()
})

const mapDispatch = (_: Dispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(ShortcutsModal)
