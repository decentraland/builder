import * as React from 'react'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { Row } from 'decentraland-ui'
import FileImport from 'components/FileImport'
import { Props } from './ImportItemsModal.types'

export default class ImportItemsModal extends React.PureComponent<Props, any> {
  handleOpenDocs = () => window.open('https://docs.decentraland.org/3d-modeling/3d-models/', '_blank')

  renderDropzoneCTA = (open: () => void) => {
    const { error, acceptedExtensions } = this.props

    return (
      <>
        {/* {isLoading ? (
          <div className="overlay">
            <Loader active size="big" />
          </div>
        ) : null} */}
        <T
          id="asset_pack.import.cta"
          values={{
            models_link: (
              <span className="link" onClick={this.handleOpenDocs}>
                {acceptedExtensions.map(ext => ext.replace('.', '').toUpperCase()).join(', ')}
              </span>
            ),
            action: (
              <span className="action" onClick={open}>
                {t('import_modal.upload_manually')}
              </span>
            )
          }}
        />
        {error ? (
          <Row className="error" align="center">
            <p className="danger-text">{error}</p>
          </Row>
        ) : null}
      </>
    )
  }

  render() {
    const { onDropAccepted, onDropRejected, acceptedExtensions } = this.props
    return (
      <>
        {/* <ModalNavigation title={title} onClose={onClose} />
        <Modal.Content> */}
        <FileImport
          // isRepresentation || changeItemFile ? (isImageCategory(category!) ? IMAGE_EXTENSIONS : MODEL_EXTENSIONS) : ITEM_EXTENSIONS
          accept={acceptedExtensions}
          onAcceptedFiles={onDropAccepted}
          onRejectedFiles={onDropRejected}
          renderAction={this.renderDropzoneCTA}
        />
        {/* </Modal.Content> */}
      </>
    )
  }
}
