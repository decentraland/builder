import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getQwertyLayout } from 'modules/keyboard/utils'
import { MapStateProps, OwnProps } from './ShortcutTooltip.types'
import ShortcutTooltip from './ShortcutTooltip'

const mapState = (_: RootState, ownProps: OwnProps): MapStateProps => ({
  shortcutDefinition: getQwertyLayout()[ownProps.shortcut]
})

export default connect(mapState)(ShortcutTooltip)
