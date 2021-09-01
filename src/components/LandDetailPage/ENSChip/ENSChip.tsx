import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { locations } from 'routing/locations'
import Chip from 'components/Chip'
import { Props, State } from './ENSChip.types'
import './ENSChip.css'
import UnsetENSContentModal from '../UnsetENSContentModal'

export default class ENSChip extends React.PureComponent<Props, State> {
  state: State = {
    showConfirmationModal: false
  }

  handleOnClick = () => {
    this.props.onNavigate(locations.activity())
  }

  handleOnIconClick = () => {
    this.setState({ showConfirmationModal: true })
  }

  handleCancel = () => {
    this.setState({ showConfirmationModal: false })
  }

  handleConfirm = () => {
    const { ens, onUnsetENSContent } = this.props
    onUnsetENSContent(ens)
    this.setState({ showConfirmationModal: false })
  }

  render() {
    const { land, ens, isLoading } = this.props

    return (
      <>
        <Chip
          className="ENSChip"
          text={
            isLoading ? (
              <>
                {ens.subdomain}
                <Loader active size="tiny" />
              </>
            ) : (
              ens.subdomain
            )
          }
          isActive={isLoading}
          icon={isLoading ? '' : 'minus'}
          onClick={isLoading ? this.handleOnClick : undefined}
          onIconClick={this.handleOnIconClick}
        />
        <UnsetENSContentModal
          land={land}
          ens={ens}
          open={this.state.showConfirmationModal}
          onCancel={this.handleCancel}
          onConfirm={this.handleConfirm}
        />
      </>
    )
  }
}
