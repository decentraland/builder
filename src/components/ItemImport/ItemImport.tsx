import * as React from 'react'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { Loader } from 'decentraland-ui'
import FileImport from 'components/FileImport'
import { InfoIcon } from 'components/InfoIcon'
import { Props, State } from './ItemImport.types'
import styles from './ItemImport.module.css'
import { ITEM_LOADED_CHECK_DELAY } from 'components/Modals/CreateSingleItemModal/constants'

export default class ItemImport extends React.PureComponent<Props, State> {
  timer: ReturnType<typeof setTimeout> | undefined
  state: State = this.getInitialState()

  getInitialState(): State {
    return {
      itemLoaded: false
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.isLoading && !this.props.isLoading) {
      this.timer = setTimeout(() => {
        this.setState({ itemLoaded: false })
      }, ITEM_LOADED_CHECK_DELAY)
      this.setState({ itemLoaded: true })
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  handleOpenDocs = () => window.open('https://docs.decentraland.org/3d-modeling/3d-models/', '_blank')

  renderDropzoneCTA = (open: () => void) => {
    const { error, isLoading, acceptedExtensions, moreInformation } = this.props
    const { itemLoaded } = this.state

    return (
      <>
        {isLoading ? (
          <div className="overlay">
            <Loader active size="huge" />
          </div>
        ) : null}
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon} />
            <div className={styles.errorMessage}>{error}</div>
          </div>
        )}
        {itemLoaded ? (
          t('asset_pack.import.loaded')
        ) : (
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
        )}
        {moreInformation && !itemLoaded ? (
          <div className={styles.zipInfo}>
            <InfoIcon className={styles.infoIcon} />
            {moreInformation}
          </div>
        ) : null}
      </>
    )
  }

  render() {
    const { acceptedExtensions, isLoading, onDropAccepted, onDropRejected } = this.props
    const { itemLoaded } = this.state

    const classNames = [styles.dropzone, itemLoaded && styles.itemLoaded, isLoading && styles.isLoading].filter(Boolean).join(' ')

    return (
      <>
        <FileImport
          className={classNames}
          accept={acceptedExtensions}
          onAcceptedFiles={onDropAccepted}
          onRejectedFiles={onDropRejected}
          renderAction={this.renderDropzoneCTA}
        />
      </>
    )
  }
}
