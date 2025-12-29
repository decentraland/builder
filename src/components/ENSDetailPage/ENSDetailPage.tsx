import { useCallback, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import { config } from 'config'
import { Link, useHistory } from 'react-router-dom'
import { Button, Icon as DCLIcon, InfoTooltip } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { shorten } from 'lib/address'
import { isCoords } from 'modules/land/utils'
import { locations } from 'routing/locations'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import Icon from 'components/Icon'
import ethereumImg from '../../icons/ethereum.svg'
import { Props } from './ENSDetailPage.types'
import styles from './ENSDetailPage.module.css'

const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL', '')
const REGISTRAR_CONTRACT_ADDRESS = config.get('REGISTRAR_CONTRACT_ADDRESS', '')

export default function ENSDetailPage(props: Props) {
  const { ens, isLoading, alias, avatar, name, wallet, onOpenModal, onFetchENS } = props
  const history = useHistory()
  const imgUrl = useMemo<string>(
    () => (ens ? `${config.get('MARKETPLACE_API')}/ens/generate?ens=${ens.name}&width=330&height=330` : ''),
    [ens]
  )

  const shouldReclaim = ens?.ensOwnerAddress !== ens?.nftOwnerAddress

  useEffect(() => {
    if (name && wallet) {
      onFetchENS(name)
    }
  }, [name, wallet, onFetchENS])

  const handleAssignENSAddress = useCallback(() => {
    onOpenModal('EnsMapAddressModal', { ens })
  }, [onOpenModal, ens])

  const handleSetAsAlias = useCallback(() => {
    onOpenModal('UseAsAliasModal', { newName: ens?.name })
  }, [onOpenModal, ens?.name])

  const handleAssignENS = useCallback(() => {
    history.push(locations.ensSelectLand(ens?.subdomain))
  }, [history, ens?.subdomain])

  const handleReclaim = useCallback(() => {
    onOpenModal('ReclaimNameModal', { ens })
  }, [onOpenModal])

  const aliasField = useMemo(() => {
    let field: React.ReactNode
    if (alias !== ens?.name) {
      field = (
        <div className={styles.editableField}>
          <span className={styles.emptyFieldPlaceholder}>{t('ens_detail_page.unassign')}</span>
          <Button compact primary onClick={handleSetAsAlias} className={styles.actionBtn} aria-label={t('ens_detail_page.set_as_primary')}>
            <DCLIcon name="user plus" />
          </Button>
        </div>
      )
    } else {
      field = (
        <div className={styles.editableField}>
          <span className={styles.avatar} data-testid="alias-avatar">
            {avatar ? (
              <img className={styles.avatarImg} src={avatar.avatar.snapshots?.face256 || ''} alt={avatar.realName} />
            ) : (
              <Icon name="profile" />
            )}
            <span className={styles.avatarName}>{ens.name}</span>
            {t('ens_list_page.table.you')}
          </span>
        </div>
      )
    }

    return (
      <div className={styles.field}>
        <span className={styles.fieldTitle}>
          {t('ens_detail_page.alias')}
          <InfoTooltip on="click" content={t('ens_detail_page.tooltips.alias')} />
        </span>
        {field}
      </div>
    )
  }, [ens?.name, shouldReclaim, avatar, alias, handleSetAsAlias])

  const addressField = useMemo(() => {
    let field: React.ReactNode = null
    if (shouldReclaim) {
      field = (
        <div className={classNames(styles.editableField, styles.disabled)}>
          <span className={styles.emptyFieldPlaceholder}>{t('ens_detail_page.reclaim_for_address')}</span>
          <Button compact secondary disabled className={styles.actionBtn} aria-label={t('ens_detail_page.reclaim_for_address')}>
            <DCLIcon name="pencil alternate" />
          </Button>
        </div>
      )
    } else if (!ens?.ensAddressRecord) {
      field = (
        <div className={styles.editableField}>
          <span className={styles.emptyFieldPlaceholder}>{t('ens_detail_page.assign_address')}</span>
          <Button
            compact
            secondary
            onClick={handleAssignENSAddress}
            className={styles.actionBtn}
            aria-label={t('ens_detail_page.assign_address')}
          >
            <DCLIcon name="pencil alternate" />
          </Button>
        </div>
      )
    } else {
      field = (
        <span className={styles.editableField}>
          <span className={styles.editableFieldValue}>
            <img src={ethereumImg} alt="Ethereum" />
            {shorten(ens.ensAddressRecord)}
          </span>
          <Button
            compact
            secondary
            inverted
            onClick={handleAssignENSAddress}
            className={styles.actionBtn}
            aria-label={t('ens_detail_page.edit_address')}
          >
            <DCLIcon name="pencil alternate" />
          </Button>
        </span>
      )
    }
    return (
      <div className={classNames(styles.field, { [styles.disabled]: shouldReclaim })}>
        <span className={styles.fieldTitle}>
          {t('ens_detail_page.address')}
          <InfoTooltip on="click" content={t('ens_detail_page.tooltips.address')} />
        </span>
        {field}
      </div>
    )
  }, [ens?.ensAddressRecord, shouldReclaim, handleAssignENSAddress])

  const landField = useMemo(() => {
    let field: React.ReactNode = null
    if (shouldReclaim) {
      field = (
        <div className={styles.editableField}>
          <span className={styles.emptyFieldPlaceholder}>{t('ens_detail_page.reclaim_for_location')}</span>
          <Button compact disabled className={styles.actionBtn} aria-label={t('ens_detail_page.reclaim_for_location')}>
            <DCLIcon name="crosshairs" />
          </Button>
        </div>
      )
    } else if (!ens?.landId) {
      field = (
        <div className={styles.editableField}>
          <span className={styles.emptyFieldPlaceholder}>{t('ens_detail_page.point_location')}</span>
          <Button compact className={styles.actionBtn} onClick={handleAssignENS} aria-label={t('ens_list_page.button.assign_to_land')}>
            <DCLIcon name="crosshairs" />
          </Button>
        </div>
      )
    } else if (isCoords(ens.landId)) {
      field = (
        <div className={styles.editableField} data-testid="land-field">
          <span className={styles.editableFieldValue}>
            <div className={styles.pin}>
              <Icon name="pin" />
            </div>
            {ens?.landId}
          </span>
          <Button compact onClick={handleAssignENS} className={styles.actionBtn} aria-label={t('ens_list_page.button.assign_to_land')}>
            <DCLIcon name="pencil alternate" />
          </Button>
        </div>
      )
    } else {
      field = (
        <div className={styles.editableField} data-testid="estate-field">
          <span className={styles.editableFieldValue}>
            <div className={styles.pin}>
              <Icon name="pin" />
            </div>
            {`Estate (${ens.landId})`}
          </span>
          <Button compact className={styles.actionBtn} onClick={handleAssignENS} aria-label={t('ens_list_page.button.assign_to_land')}>
            <DCLIcon name="pencil alternate" />
          </Button>
        </div>
      )
    }

    return (
      <div className={classNames(styles.field, { [styles.disabled]: shouldReclaim })}>
        <span className={styles.fieldTitle}>
          {t('ens_detail_page.land')}
          <InfoTooltip on="click" content={t('ens_detail_page.tooltips.land')} />
        </span>
        {field}
      </div>
    )
  }, [ens?.landId, shouldReclaim, handleAssignENS])

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
                  <DCLIcon aria-label="copy name" aria-hidden="false" name="clone outline" />
                </CopyToClipboard>
                {ens?.ensOwnerAddress !== ens?.nftOwnerAddress ? (
                  <span className={styles.unclaimedBadge}>{t('ens_detail_page.unclaimed')}</span>
                ) : null}
              </span>
            </div>
            <div className={styles.actions}>
              <Button
                secondary
                className={styles.transferBtn}
                target="_blank"
                href={`${MARKETPLACE_WEB_URL}/contracts/${REGISTRAR_CONTRACT_ADDRESS}/tokens/${ens?.tokenId}/transfer`}
              >
                {t('ens_detail_page.transfer')}
              </Button>
              {shouldReclaim && (
                <Button primary onClick={handleReclaim}>
                  {t('ens_detail_page.reclaim_name')}
                </Button>
              )}
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
