import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { locations } from 'routing/locations'
import Chip from 'components/Chip'
import { Props } from './ENSChip.types'
import './ENSChip.css'

export default class ENSChip extends React.PureComponent<Props> {
  handleOnClick = () => {
    this.props.onNavigate(locations.activity())
  }

  handleOnIconClick = () => {
    const { ens, onUnsetENSContent } = this.props
    onUnsetENSContent(ens)
  }

  render() {
    const { ens, isLoading } = this.props

    return (
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
    )
  }
}
