import React from 'react'
import { Link } from 'react-router-dom'
import { config } from 'config'
import { Popup, Button, Dropdown, Icon as DCLIcon } from 'decentraland-ui'
import { TableContainer, TableContent } from 'decentraland-ui/dist/components/v2'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { DataTableType } from 'decentraland-ui/dist/components/v2/Table/TableContent/TableContent.types'
import { shorten } from 'lib/address'
import { locations } from 'routing/locations'
import { isCoords } from 'modules/land/utils'
import { ENS } from 'modules/ens/types'
import Icon from 'components/Icon'
import addRounded from 'icons/add-rounded.svg'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import ethereumImg from '../../icons/ethereum.svg'
import namesImg from '../../images/empty-names.svg'
import { Props, State, SortBy } from './ENSListPage.types'
import './ENSListPage.css'

const PAGE_SIZE = 12
const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL', '')
const MARKETPLACE_API = config.get('MARKETPLACE_API', '')
const REGISTRAR_CONTRACT_ADDRESS = config.get('REGISTRAR_CONTRACT_ADDRESS', '')
export default class ENSListPage extends React.PureComponent<Props, State> {
  state: State = {
    sortBy: SortBy.ASC,
    page: 1
  }

  handleNavigateToLand = () => this.props.onNavigate(locations.land())

  handleAssignENS = (ens: ENS) => {
    this.props.onNavigate(locations.ensSelectLand(ens.subdomain))
  }

  handleUseAsAlias = (name: string) => {
    this.handleOpenModal(name)
  }

  handleAssignENSAddress = (ens: ENS) => {
    const { onOpenModal } = this.props
    onOpenModal('EnsMapAddressModal', { ens })
  }

  handleOpenModal = (newName: string) => {
    const { onOpenModal } = this.props
    onOpenModal('UseAsAliasModal', { newName })
  }

  handleReclaim = (ens: ENS) => {
    const { onOpenModal } = this.props
    onOpenModal('ReclaimNameModal', { ens })
  }

  renderSortDropdown = () => {
    const { sortBy } = this.state
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.ASC, text: t('global.order.name_asc') },
          { value: SortBy.DESC, text: t('global.order.name_desc') }
        ]}
        onChange={(_event, { value }) => this.setState({ sortBy: value as SortBy })}
      />
    )
  }

  paginate = () => {
    const { ensList } = this.props
    const { page, sortBy } = this.state

    return ensList
      .sort((a: ENS, b: ENS) => {
        switch (sortBy) {
          case SortBy.ASC: {
            return a.subdomain.toLowerCase() < b.subdomain.toLowerCase() ? 1 : -1
          }
          case SortBy.DESC: {
            return a.subdomain.toLowerCase() > b.subdomain.toLowerCase() ? 1 : -1
          }
          default: {
            return 0
          }
        }
      })
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }

  isAlias(ens: ENS): boolean {
    const { alias } = this.props
    const { name } = ens
    return alias ? name === alias : false
  }

  getAssignedToMessage(ens: ENS) {
    if (this.isAlias(ens)) {
      return t('global.avatar')
    }
    const { landId } = ens
    if (!landId) {
      return ''
    }
    return (
      <Link to={locations.landDetail(landId)}>
        {isCoords(landId) ? t('ens_list_page.assigned_to_land', { landId }) : t('ens_list_page.assigned_to_estate', { landId })}
      </Link>
    )
  }

  renderUseAsAliasButton(ens: ENS, hasProfileCreated: boolean) {
    return (
      <div className="popup-button">
        <Button className="ui basic button" onClick={() => this.handleOpenModal(ens.name)} disabled={!hasProfileCreated}>
          {t('ens_list_page.button.use_as_alias')}
        </Button>
      </div>
    )
  }

  renderLandLinkInfo(ens: ENS) {
    if (ens.ensOwnerAddress !== ens.nftOwnerAddress) {
      return (
        <Button compact className="ens-list-btn" onClick={this.handleReclaim.bind(null, ens)}>
          <DCLIcon name="arrow alternate circle down outline" className="ens-list-reclaim-icon" />
          {t('ens_list_page.button.reclaim_land')}
        </Button>
      )
    }

    if (!ens.landId) {
      return (
        <Button compact className="ens-list-btn" onClick={this.handleAssignENS.bind(null, ens)}>
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
      )
    } else {
      return (
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
      )
    }
  }

  renderAddressInfo(ens: ENS) {
    if (ens.ensOwnerAddress !== ens.nftOwnerAddress) {
      return (
        <Button compact className="ens-list-btn" onClick={this.handleReclaim.bind(null, ens)}>
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
      <Button compact className="ens-list-btn" onClick={this.handleAssignENSAddress.bind(null, ens)}>
        <img src={addRounded} alt={t('ens_list_page.button.link_to_address')} className="ens-list-add-icon" />
        {t('ens_list_page.button.link_to_address')}
      </Button>
    )
  }

  formatToTable(ensList: ENS[]): DataTableType[] {
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
      alias: this.isAlias(ens) ? (
        <span className="ens-list-avatar">
          {this.props.avatar ? (
            <img className="ens-list-avatar-img" src={this.props.avatar.avatar.snapshots.face256} alt={this.props.avatar.realName} />
          ) : (
            <Icon name="profile" />
          )}
          <span className="ens-list-avatar-name">{ens.name}</span>
          {t('ens_list_page.table.you')}
        </span>
      ) : (
        <Button
          compact
          className="ens-list-btn"
          onClick={this.handleUseAsAlias.bind(null, ens.name)}
          disabled={!this.props.hasProfileCreated}
        >
          <img src={addRounded} alt={t('ens_list_page.button.add_to_avatar')} className="ens-list-add-icon" />
          {t('ens_list_page.button.add_to_avatar')}
        </Button>
      ),
      address: this.renderAddressInfo(ens),
      land: this.renderLandLinkInfo(ens),
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
  }

  renderEmptyEnsList() {
    return (
      <div className="ens-list-page-empty">
        <div className="ens-list-page-empty-image">
          <img src={namesImg} alt="empty names" />
        </div>
        <h3 className="ens-list-page-empty-title">{t('ens_list_page.empty_state.title')}</h3>
        <span className="ens-list-page-empty-subtitle">{t('ens_list_page.empty_state.subtitle')}</span>
        <div className="ens-list-page-empty-actions">
          <Button primary href={`${MARKETPLACE_WEB_URL}/names/claim`} target="_blank">
            {t('ens_list_page.empty_state.mint_name')}
          </Button>
        </div>
      </div>
    )
  }

  renderEnsList() {
    const { ensList } = this.props
    const { page } = this.state

    const total = ensList.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const paginatedItems = this.paginate()

    return (
      <div className="ens-page-content">
        <div className="ens-page-header">
          <div className="ens-page-title">
            <h1>{t('ens_list_page.title')}</h1>
            {t('ens_list_page.result', { count: ensList.length })}
          </div>
          <div className="ens-page-actions">
            {ensList.length > 1 ? (
              <div>
                {t('ens_list_page.sort_by')} {this.renderSortDropdown()}
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
              data={this.formatToTable(paginatedItems)}
              isLoading={this.props.isLoading}
              activePage={page}
              setPage={page => this.setState({ page })}
              totalPages={totalPages}
              empty={() => this.renderEmptyEnsList()}
              total={PAGE_SIZE}
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
  }

  render() {
    const { isLoading, error } = this.props
    return (
      <LoggedInDetailPage
        className="ENSListPage view"
        error={error}
        activeTab={NavigationTab.NAMES}
        isLoading={isLoading}
        isPageFullscreen={true}
      >
        {this.renderEnsList()}
      </LoggedInDetailPage>
    )
  }
}
