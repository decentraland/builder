import * as React from 'react'

import { Popup } from 'decentraland-ui'
import Chip from 'components/Chip'
import { ShareModalMetadata, ShareModalType } from 'components/Modals/ShareModal/ShareModal.types'
import { Props, DefaultProps } from './ShareButton.types'
import './ShareButton.css'

export default class ShareButton extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    onClick: () => {
      /* noop */
    }
  }

  handleClick = () => {
    const { project, onOpenModal } = this.props

    onOpenModal('ShareModal', {
      type: ShareModalType.PROJECT,
      id: project.id
    } as ShareModalMetadata)
  }

  render() {
    const { isLoading } = this.props

    return (
      <span className="ShareButton tool">
        <Popup
          className="publish-disabled"
          position="bottom center"
          disabled={isLoading}
          trigger={
            <span>
              <Chip icon="share" onClick={this.handleClick} isDisabled={isLoading} />
            </span>
          }
          on="hover"
          inverted
          basic
        />
      </span>
    )
  }
}
