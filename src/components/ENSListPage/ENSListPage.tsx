import * as React from 'react'
import { Link } from 'react-router-dom'
import { Popup, Button, Table, Row, Column, Header, Section, Container, Pagination, Dropdown, Empty } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { isCoords } from 'modules/land/utils'
import { ENS } from 'modules/ens/types'
import Icon from 'components/Icon'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { Props, State, SortBy } from './ENSListPage.types'
import './ENSListPage.css'

const PAGE_SIZE = 12

export default class ENSListPage extends React.PureComponent<Props, State> {
  state: State = {
    sortBy: SortBy.ASC,
    page: 1
  }

  handleNavigateToLand = () => this.props.onNavigate(locations.land())

  handleClaimENS = () => this.props.onNavigate(locations.claimENS())

  handleAssignENS = (ens: ENS) => {
    this.props.onNavigate(locations.ensSelectLand(ens.subdomain))
  }

  handleOpenModal = (newName: string) => {
    const { onOpenModal } = this.props
    onOpenModal('UseAsAliasModal', { newName })
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

  renderEnsList() {
    const { ensList } = this.props
    const { page } = this.state

    const total = ensList.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const paginatedItems = this.paginate()

    return (
      <>
        <div className="filters">
          <Container>
            <Row>
              <Column>
                <Row>
                  <Header sub className="items-count">
                    {t('ens_list_page.items', { count: ensList.length.toLocaleString() })}
                  </Header>
                </Row>
              </Column>
              <Column align="right">
                <Row>{ensList.length > 1 ? this.renderSortDropdown() : null}</Row>
              </Column>
              <Column align="right" grow={false} shrink>
                <Row>
                  <div className="actions">
                    <Button basic onClick={this.handleClaimENS}>
                      <Icon name="add-active" />
                    </Button>
                  </div>
                </Row>
              </Column>
            </Row>
          </Container>
        </div>
        <Container>
          <Section className="table-section">
            {ensList.length > 0 ? (
              <Table basic="very">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width="2">{t('ens_list_page.table.name')}</Table.HeaderCell>
                    <Table.HeaderCell width="2">{t('ens_list_page.table.assigned_to')}</Table.HeaderCell>
                    <Table.HeaderCell width="2">{t('ens_list_page.table.link')}</Table.HeaderCell>
                    <Table.HeaderCell width="2"></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedItems.map((ens: ENS, index) => {
                    return (
                      <Table.Row className="TableRow" key={index}>
                        <Table.Cell>
                          <Row>
                            <Column className="subdomain-wrapper">
                              <div>{ens.name}</div>
                              {this.isAlias(ens) ? (
                                <Popup
                                  content={t('ens_list_page.alias_popup')}
                                  position="top center"
                                  trigger={
                                    <div>
                                      <Icon name="profile" />
                                    </div>
                                  }
                                  on="hover"
                                />
                              ) : null}
                            </Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
                            <Column>{this.getAssignedToMessage(ens)}</Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
                            <Column className="link">
                              {ens.landId ? (
                                <a target="_blank" href={`https://${ens.subdomain}.link`}>
                                  {ens.subdomain} <Icon name="right-round-arrow" />
                                </a>
                              ) : null}
                            </Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
                            {!this.isAlias(ens) ? (
                              <Column align="right">
                                <Button className="ui basic button" onClick={() => this.handleOpenModal(ens.name)}>
                                  {t('ens_list_page.button.use_as_alias')}
                                </Button>
                              </Column>
                            ) : null}
                            {!ens.landId ? (
                              <Column align="right">
                                <Button className="ui basic button" onClick={() => this.handleAssignENS(ens)}>
                                  {t('ens_list_page.button.assign')}
                                </Button>
                              </Column>
                            ) : null}
                            {ens.landId ? (
                              <Column align="right">
                                <Button className="ui basic button" onClick={() => this.handleAssignENS(ens)}>
                                  {t('ens_list_page.button.edit')}
                                </Button>
                              </Column>
                            ) : null}
                          </Row>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            ) : (
              <Empty className="empty-names" height={200}>
                <div>
                  <T
                    id="ens_list_page.empty_names"
                    values={{
                      br: <br />,
                      link: <Link to={locations.claimENS()}>{t('global.click_here')}</Link>
                    }}
                  />
                </div>
              </Empty>
            )}
            {totalPages > 1 && (
              <Pagination
                firstItem={null}
                lastItem={null}
                totalPages={totalPages}
                activePage={page}
                onPageChange={(_event, props) => this.setState({ page: +props.activePage! })}
              />
            )}
          </Section>
        </Container>
      </>
    )
  }

  render() {
    const { isLoading } = this.props
    return (
      <LoggedInDetailPage className="ENSListPage view" activeTab={NavigationTab.NAMES} isLoading={isLoading} isPageFullscreen={true}>
        {this.renderEnsList()}
      </LoggedInDetailPage>
    )
  }
}
