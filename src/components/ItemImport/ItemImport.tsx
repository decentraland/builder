import * as React from 'react'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { Loader } from 'decentraland-ui'
import FileImport from 'components/FileImport'
import { InfoIcon } from 'components/InfoIcon'
import { Props } from './ItemImport.types'
import styles from './ItemImport.module.css'

export default class ItemImport extends React.PureComponent<Props, any> {
  handleOpenDocs = () => window.open('https://docs.decentraland.org/3d-modeling/3d-models/', '_blank')

  renderDropzoneCTA = (open: () => void) => {
    const { error, isLoading, acceptedExtensions, moreInformation } = this.props

    return (
      <>
        {isLoading ? (
          <div className="overlay">
            <Loader active size="big" />
          </div>
        ) : null}
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon} />
            <div className={styles.errorMessage}>{error}</div>
          </div>
        )}
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
        {moreInformation ? (
          <div className={styles.zipInfo}>
            <InfoIcon className={styles.infoIcon} />
            {moreInformation}
          </div>
        ) : null}
      </>
    )
  }

  render() {
    const { onDropAccepted, onDropRejected, acceptedExtensions } = this.props
    return (
      <>
        <FileImport
          className={styles.dropzone}
          accept={acceptedExtensions}
          onAcceptedFiles={onDropAccepted}
          onRejectedFiles={onDropRejected}
          renderAction={this.renderDropzoneCTA}
        />
      </>
    )
  }
}
