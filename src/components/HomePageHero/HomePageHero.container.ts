import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { MapDispatchProps, MapDispatch } from './HomePageHero.types'
import HomePageHero from './HomePageHero'

const mapState = (_: RootState) => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: name => dispatch(openModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(HomePageHero)
