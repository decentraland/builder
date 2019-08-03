import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Manifest } from 'modules/project/types'
import { importProject } from 'modules/project/actions'
import { MapDispatchProps } from './ImportModal.types'
import ImportModal from './ImportModal'

const mapState = () => ({})

const mapDispatch = (dispatch: Dispatch): MapDispatchProps => ({
  onImport: (project: Manifest[]) => dispatch(importProject(project))
})

export default connect(
  mapState,
  mapDispatch
)(ImportModal)
