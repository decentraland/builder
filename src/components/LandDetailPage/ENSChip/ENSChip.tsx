import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { locations } from 'routing/locations'
import Chip from 'components/Chip'
import { Props } from './ENSChip.types'
import './ENSChip.css'

export default class ENSChip extends React.PureComponent<Props> {
  handleOnClick = () => {
    const { isLoading, onNavigate } = this.props
    if (isLoading) {
      onNavigate(locations.activity())
    }
  }

  render() {
    const { ens, isLoading, onIconClick } = this.props

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
        onClick={this.handleOnClick}
        onIconClick={onIconClick}
      />
    )
  }
}
