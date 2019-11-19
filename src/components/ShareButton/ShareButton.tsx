import * as React from 'react'

import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

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
          <Button size="mini" onClick={this.handleClick} disabled={isLoading}>
            {t('share_modal.share')}
          </Button>
        </span>
      </span>
    )
  }
}
