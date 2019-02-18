import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { closeModal } from 'modules/modal/actions'
import { getQwertyLayout } from 'modules/keyboard/utils'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ShortcutModal.types'
import ShortcutsModal from './ShortcutsModal'

const mapState = (_: RootState): MapStateProps => ({
  shortcuts: getQwertyLayout()
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClose: name => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(ShortcutsModal)
