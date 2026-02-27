import React, { useEffect, useCallback, useMemo } from 'react'
import { Env } from '@dcl/ui-env'
import { Link, useHistory } from 'react-router-dom'
import { config } from 'config'
import { Popup, Button, Dropdown, Icon as DCLIcon } from 'decentraland-ui'
import { TableContainer, TableContent } from 'decentraland-ui/dist/components/v2'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { shorten } from 'lib/address'
import { locations } from 'routing/locations'
import { isCoords } from 'modules/land/utils'
import { ENS } from 'modules/ens/types'
import Icon from 'components/Icon'
import addRounded from 'icons/add-rounded.svg'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import ENSEmptyState from 'components/ENSEmptyState'
import ethereumImg from '../../icons/ethereum.svg'
import { Props, SortBy } from './ENSListPage.types'
import './ENSListPage.css'

const PAGE_SIZE = 12
const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL', '')
const MARKETPLACE_API = config.get('MARKETPLACE_API', '')
const REGISTRAR_CONTRACT_ADDRESS = config.get('REGISTRAR_CONTRACT_ADDRESS', '')
const ENS_GATEWAY = config.get('ENS_GATEWAY')

export default function ENSListPage(props: Props) {
  const { ensList, alias, hasProfileCreated, avatar, isLoading, isLoggedIn, error, onOpenModal, total, onFetchENSList } = props
  const [sortBy, setSortBy] = React.useState(SortBy.ASC)
  const [page, setPage] = React.useState(1)
  const history = useHistory()

  useEffect(() => {
    if (isLoggedIn) {
      onFetchENSList(PAGE_SIZE, (page - 1) * PAGE_SIZE)
    }
  }, [isLoggedIn, onFetchENSList, page])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const sortedEnsList = useMemo(() => {
    return [...ensList].sort((a: ENS, b: ENS) => {
      switch (sortBy) {
        case SortBy.ASC: {
          return a.subdomain.toLowerCase() < b.subdomain.toLowerCase() ? -1 : 1
        }
        case SortBy.DESC: {
          return a.subdomain.toLowerCase() > b.subdomain.toLowerCase() ? -1 : 1
        }
        default: {
          return 0
        }
      }
    })
  }, [ensList, sortBy])

  const handleAssignENS = useCallback((ens: ENS) => history.push(locations.ensSelectLand(ens.subdomain)), [history])
  const buildENSLink = useCallback(
    (ens: ENS) => {
      if (config.is(Env.DEVELOPMENT)) {
        const splittedDomain = ens.subdomain.split('.')
        splittedDomain.splice(splittedDomain.length - 1, 0, 'istest')
        return `https://${splittedDomain.join('.')}.${ENS_GATEWAY}`
      }
      return `https://${ens.subdomain}.${ENS_GATEWAY}`
    },
    [ENS_GATEWAY]
  )

  const handleOpenModal = useCallback(
    (newName: string) => {
      onOpenModal('UseAsAliasModal', { newName })
    },
    [onOpenModal]
  )

  const handleUseAsAlias = useCallback((name: string) => handleOpenModal(name), [])

  const handleAssignENSAddress = useCallback(
    (ens: ENS) => {
      onOpenModal('EnsMapAddressModal', { ens })
    },
    [onOpenModal]
  )

  const handleReclaim = useCallback(
    (ens: ENS) => {
      onOpenModal('ReclaimNameModal', { ens })
    },
    [onOpenModal]
  )

  const renderSortDropdown = useCallback(() => {
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.ASC, text: t('global.order.name_asc') },
          { value: SortBy.DESC, text: t('global.order.name_desc') }
        ]}
        onChange={(_event, { value }) => setSortBy(value as SortBy)}
      />
    )
  }, [sortBy])

  const isAlias = useCallback(
    (ens: ENS) => {
      return alias ? ens.name == alias : false
    },
    [alias]
  )

  const renderLandLinkInfo = useCallback(
    (ens: ENS) => {
      if (ens.ensOwnerAddress !== ens.nftOwnerAddress) {
        return (
          <Button compact className="ens-list-btn" onClick={handleReclaim.bind(null, ens)}>
            <DCLIcon name="arrow alternate circle down outline" className="ens-list-reclaim-icon" />
            {t('ens_list_page.button.reclaim_land')}
          </Button>
        )
      }

      if (!ens.landId) {
        return (
          <Button compact className="ens-list-btn" onClick={handleAssignENS.bind(null, ens)}>
            <Icon name="pin" />
            {t('ens_list_page.button.assign_to_land')}
          </Button>
        )
      }
      if (isCoords(ens.landId)) {
        return (
          <div className="ens-list-land">
            <span className="ens-list-land-coord">
              <Icon name="pin" />
              {ens.landId}
            </span>
            <Button compact className="ens-list-land-redirect" target="_blank" href={buildENSLink(ens)} rel="noopener noreferrer">
              <Icon name="right-round-arrow" className="ens-list-land-redirect-icon" />
            </Button>
          </div>
        )
      } else {
        return (
          <div className="ens-list-land">
            <span className="ens-list-land-coord">
              <Icon name="pin" />
              {`Estate (${ens.landId})`}
            </span>
            <Button compact className="ens-list-land-redirect" target="_blank" href={buildENSLink(ens)} rel="noopener noreferrer">
              <Icon name="right-round-arrow" className="ens-list-land-redirect-icon" />
            </Button>
          </div>
        )
      }
    },
    [handleAssignENS, handleReclaim]
  )

  const renderAddressInfo = useCallback(
    (ens: ENS) => {
      if (ens.ensOwnerAddress !== ens.nftOwnerAddress) {
        return (
          <Button compact className="ens-list-btn" onClick={handleReclaim.bind(null, ens)}>
            <DCLIcon name="arrow alternate circle down outline" className="ens-list-reclaim-icon" />
            {t('ens_list_page.button.reclaim_address')}
          </Button>
        )
      }

      if (ens.ensAddressRecord) {
        return (
          <span className="ens-list-address">
            <img className="ens-list-address-icon" src={ethereumImg} alt="Ethereum" />
            {shorten(ens.ensAddressRecord)}
            <CopyToClipboard role="button" text={ens.ensAddressRecord} showPopup={true} className="copy-to-clipboard">
              <DCLIcon aria-label="copy address" aria-hidden="false" name="clone outline" />
            </CopyToClipboard>
          </span>
        )
      }
      return (
        <Button compact className="ens-list-btn" onClick={handleAssignENSAddress.bind(null, ens)}>
          <img src={addRounded} alt={t('ens_list_page.button.link_to_address')} className="ens-list-add-icon" />
          {t('ens_list_page.button.link_to_address')}
        </Button>
      )
    },
    [handleAssignENSAddress, handleReclaim]
  )

  const formatToTable = useCallback(
    (ensList: ENS[]) => {
      return ensList.map(ens => ({
        name: (
          <div className="ens-list-name">
            <img
              className="ens-list-name-icon"
              alt={ens.subdomain}
              src={`${MARKETPLACE_API}/ens/generate?ens=${ens.name}&width=330&height=330&onlyLogo=true`}
            />
            <span className="ens-list-subdomain">
              <span>{ens.name}</span>.dcl.eth
            </span>
            <CopyToClipboard role="button" text={ens.subdomain} showPopup={true} className="copy-to-clipboard">
              <DCLIcon aria-label="copy subdomain" aria-hidden="false" name="clone outline" />
            </CopyToClipboard>
            {ens.ensOwnerAddress !== ens.nftOwnerAddress ? (
              <span className="ens-list-unclaimed-badge">{t('ens_list_page.unclaimed')}</span>
            ) : null}
          </div>
        ),
        alias: isAlias(ens) ? (
          <span className="ens-list-avatar">
            {avatar ? (
              <img className="ens-list-avatar-img" src={avatar.avatar.snapshots?.face256 || ''} alt={avatar.realName} />
            ) : (
              <Icon name="profile" />
            )}
            <span className="ens-list-avatar-name">{ens.name}</span>
            {t('ens_list_page.table.you')}
          </span>
        ) : (
          <Button compact className="ens-list-btn" onClick={handleUseAsAlias.bind(null, ens.name)} disabled={!hasProfileCreated}>
            <img src={addRounded} alt={t('ens_list_page.button.add_to_avatar')} className="ens-list-add-icon" />
            {t('ens_list_page.button.add_to_avatar')}
          </Button>
        ),
        address: renderAddressInfo(ens),
        land: renderLandLinkInfo(ens),
        actions: (
          <div className="ens-list-actions">
            <Button
              secondary
              compact
              className="ens-list-transfer-btn"
              target="_blank"
              href={`${MARKETPLACE_WEB_URL}/contracts/${REGISTRAR_CONTRACT_ADDRESS}/tokens/${ens.tokenId}/transfer`}
            >
              <DCLIcon name="exchange" />
              {t('ens_list_page.transfer')}
            </Button>
            <Link to={locations.ensDetail(ens.name)}>
              <Button primary compact className="ens-list-edit-btn">
                <DCLIcon name="pencil alternate" />
                {t('ens_list_page.edit')}
              </Button>
            </Link>
          </div>
        )
      }))
    },
    [hasProfileCreated, isAlias, renderLandLinkInfo, renderAddressInfo, handleUseAsAlias]
  )

  const renderEmptyEnsList = useCallback(() => {
    return <ENSEmptyState />
  }, [])

  const renderEnsList = useCallback(() => {
    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
      <div className="ens-page-content">
        <div className="ens-page-header">
          <div className="ens-page-title">
            <h1>{t('ens_list_page.title')}</h1>
            {t('ens_list_page.result', { count: total })}
          </div>
          <div className="ens-page-actions">
            {ensList.length > 1 ? (
              <div>
                {t('ens_list_page.sort_by')} {renderSortDropdown()}
              </div>
            ) : null}
            <Button compact href={`${MARKETPLACE_WEB_URL}/names/claim`} target="_blank" primary>
              {t('ens_list_page.mint_name')}
            </Button>
          </div>
        </div>
        <TableContainer
          children={
            <TableContent
              data={formatToTable(sortedEnsList)}
              isLoading={isLoading}
              activePage={page}
              setPage={handlePageChange}
              totalPages={totalPages}
              empty={renderEmptyEnsList}
              total={total}
              rowsPerPage={PAGE_SIZE}
              hasHeaders
              customHeaders={{
                name: <span className="ens-list-page-table-headers">{t('ens_list_page.table.name')}</span>,
                alias: (
                  <span className="ens-list-page-table-headers">
                    {t('ens_list_page.table.alias')}
                    <Popup on="click" content={t('ens_detail_page.tooltips.alias')} trigger={<DCLIcon name="info circle" />} />
                  </span>
                ),
                address: (
                  <span className="ens-list-page-table-headers">
                    {t('ens_list_page.table.address')}
                    <Popup on="click" content={t('ens_detail_page.tooltips.address')} trigger={<DCLIcon name="info circle" />} />
                  </span>
                ),
                land: (
                  <span className="ens-list-page-table-headers">
                    {t('ens_list_page.table.land')}
                    <Popup on="click" content={t('ens_detail_page.tooltips.land')} trigger={<DCLIcon name="info circle" />} />
                  </span>
                ),
                actions: <span className="ens-list-page-table-headers">{t('ens_list_page.table.actions')}</span>
              }}
            />
          }
          tabsList={[]}
        />
      </div>
    )
  }, [sortedEnsList, isLoading, page, total, handlePageChange, formatToTable, renderEmptyEnsList, renderSortDropdown, ensList.length])

  return (
    <LoggedInDetailPage
      className="ENSListPage view"
      error={error}
      activeTab={NavigationTab.NAMES}
      isLoading={isLoading}
      isPageFullscreen={true}
    >
      {renderEnsList()}
    </LoggedInDetailPage>
  )
}
