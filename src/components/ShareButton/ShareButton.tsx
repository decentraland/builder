import * as React from 'react'

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
        <span>
          <Chip icon="share" onClick={this.handleClick} isDisabled={isLoading} />
        </span>
      </span>
    )
  }
}
