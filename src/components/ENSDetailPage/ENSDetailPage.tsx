import { useCallback, useEffect, useMemo } from 'react'
import { config } from 'config'
import { Link } from 'react-router-dom'
import { Button, Icon as DCLIcon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isCoords } from 'modules/land/utils'
import { locations } from 'routing/locations'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { getCroppedAddress } from 'components/ENSListPage/utils'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import Icon from 'components/Icon'
import ethereumImg from '../../icons/ethereum.svg'
import { Props } from './ENSDetailPage.types'
import styles from './ENSDetailPage.module.css'

export default function ENSDetailPage(props: Props) {
  const { ens, isLoading, alias, avatar, name, onNavigate, onOpenModal, onFetchENS } = props
  const imgUrl = useMemo<string>(
    () => (ens ? `http://marketplace-api.decentraland.zone/v1/ens/generate?ens=${ens.name}&width=330&height=330` : ''),
    [ens]
  )

  useEffect(() => {
    if (name) {
      onFetchENS(name)
    }
  }, [name, onFetchENS])

  const handleAssignENSAddress = useCallback(() => {
    onOpenModal('EnsMapAddressModal', { ens })
  }, [onOpenModal, ens])

  const handleSetAsAlias = useCallback(() => {
    onOpenModal('UseAsAliasModal', { newName: ens?.name })
  }, [onOpenModal, ens?.name])

  const handleAssignENS = useCallback(() => {
    onNavigate(locations.ensSelectLand(ens?.subdomain))
  }, [onNavigate, ens?.subdomain])

  const aliasField = useMemo(() => {
    if (alias !== ens?.name) {
      return (
        <div className={styles.field}>
          <span className={styles.fieldTitle}>{t('ens_detail_page.alias')}</span>
          <span className={styles.unassign}>{t('ens_detail_page.unassign')}</span>
          <Button compact primary onClick={handleSetAsAlias} className={styles.actionBtn}>
            {t('ens_detail_page.set_as_primary')}
          </Button>
        </div>
      )
    }
    return (
      <div className={styles.field}>
        <span className={styles.fieldTitle}>{t('ens_detail_page.alias')}</span>
        <span className={styles.avatar} data-testid="alias-avatar">
          {avatar ? (
            <img className={styles.avatarImg} src={avatar.avatar.snapshots.face256} alt={avatar.realName} />
          ) : (
            <Icon name="profile" />
          )}
          <span className={styles.avatarName}>{ens.name}</span>
          {t('ens_list_page.table.you')}
        </span>
      </div>
    )
  }, [ens?.name, avatar, alias, handleSetAsAlias])

  const addressField = useMemo(() => {
    if (!ens?.ensAddressRecord) {
      return (
        <div className={styles.field}>
          <span className={styles.fieldTitle}>{t('ens_detail_page.address')}</span>
          <Button compact secondary onClick={handleAssignENSAddress} className={styles.ensBtn}>
            <DCLIcon name="add" />
            {t('ens_list_page.button.link_to_address')}
          </Button>
        </div>
      )
    }
    return (
      <div className={styles.field}>
        <span className={styles.fieldTitle}>{t('ens_detail_page.address')}</span>
        <span className={styles.address}>
          <img src={ethereumImg} alt="Ethereum" />
          {getCroppedAddress(ens.ensAddressRecord)}
          <CopyToClipboard role="button" text={ens.ensAddressRecord} showPopup={true} className="copy-to-clipboard">
            <DCLIcon aria-label="Copy urn" aria-hidden="false" name="copy outline" />
          </CopyToClipboard>
        </span>
        <Button compact primary onClick={handleAssignENSAddress} className={styles.actionBtn}>
          {t('ens_detail_page.edit_address')}
        </Button>
      </div>
    )
  }, [ens?.ensAddressRecord, handleAssignENSAddress])

  const landField = useMemo(() => {
    if (!ens?.landId) {
      return (
        <div className={styles.field}>
          <span className={styles.fieldTitle}>{t('ens_detail_page.land')}</span>
          <Button compact className="ens-list-btn" onClick={handleAssignENS}>
            <Icon name="pin" />
            {t('ens_list_page.button.assign_to_land')}
          </Button>
        </div>
      )
    }
    if (isCoords(ens.landId)) {
      return (
        <div className={styles.field} data-testid="land-field">
          <span className={styles.fieldTitle}>{t('ens_detail_page.land')}</span>
          <div className="ens-list-land">
            <span className="ens-list-land-coord">
              <Icon name="pin" />
              {ens?.landId}
            </span>
            <Button
              compact
              className="ens-list-land-redirect"
              target="_blank"
              href={`https://${ens.subdomain}.${config.get('ENS_GATEWAY')}`}
              rel="noopener noreferrer"
            >
              <Icon name="right-round-arrow" className="ens-list-land-redirect-icon" />
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div className={styles.field} data-testid="estate-field">
          <span className={styles.fieldTitle}>{t('ens_detail_page.land')}</span>
          <div className="ens-list-land">
            <span className="ens-list-land-coord">
              <Icon name="pin" />
              {`Estate (${ens.landId})`}
            </span>
            <Button
              compact
              className="ens-list-land-redirect"
              target="_blank"
              href={`https://${ens.subdomain}.${config.get('ENS_GATEWAY')}`}
              rel="noopener noreferrer"
            >
              <Icon name="right-round-arrow" className="ens-list-land-redirect-icon" />
            </Button>
          </div>
        </div>
      )
    }
  }, [ens?.landId, ens?.subdomain, handleAssignENS])

  return (
    <LoggedInDetailPage activeTab={NavigationTab.NAMES} isPageFullscreen={true} isLoading={isLoading || !ens}>
      <Link to={locations.ens()}>
        <Button basic className={styles.returnLink}>
          <DCLIcon name="chevron left" />
          Return
        </Button>
      </Link>
      <div className={styles.main}>
        <img alt={ens?.subdomain} src={imgUrl} className={styles.ensImage} />
        <div className={styles.fields}>
          <div className={styles.fieldContainer}>
            <div>
              <span className={styles.fieldTitle}>{t('ens_detail_page.name')}</span>
              <span className={styles.subdomain}>
                <span>
                  <span>{ens?.name}</span>.dcl.eth
                </span>
                <CopyToClipboard role="button" text={ens?.subdomain || ''} showPopup={true} className="copy-to-clipboard">
                  <DCLIcon aria-label="Copy urn" aria-hidden="false" name="copy outline" />
                </CopyToClipboard>
              </span>
            </div>
          </div>
          <div className={styles.fieldContainer}>
            {aliasField}
            {addressField}
            {landField}
          </div>
        </div>
      </div>
    </LoggedInDetailPage>
  )
}
