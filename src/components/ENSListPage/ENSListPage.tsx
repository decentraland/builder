import * as React from 'react'
import { Popup, Button, Table, Row, Column, Header, Section, Container, Pagination, Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { ENS } from 'modules/ens/types'
import Icon from 'components/Icon'
import { getNameFromDomain } from 'modules/ens/utils'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { Props, State, SortBy } from './ENSListPage.types'
import './ENSListPage.css'

const PAGE_SIZE = 12

export default class ENSListPage extends React.PureComponent<Props, State> {
  state: State = {
    sortBy: SortBy.NAME,
    page: 1
  }

  handleNavigateToLand = () => this.props.onNavigate(locations.land())

  handleClaimENS = () => this.props.onNavigate(locations.claimENS())

  handleAssignENS = (ens: ENS) => {
    this.props.onNavigate(locations.ensSelectLand(ens.subdomain))
  }

  renderSortDropdown = () => {
    const { sortBy } = this.state
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.NEWEST, text: t('home_page.sort.newest') },
          { value: SortBy.NAME, text: t('home_page.sort.name') }
        ]}
        onChange={(_event, { value }) => this.setState({ sortBy: value as SortBy })}
      />
    )
  }

  paginate = () => {
    const { ensList } = this.props
    const { page, sortBy } = this.state

    const sortedEnsList = ensList
      .sort((a: ENS, b: ENS) => {
        switch (sortBy) {
          case SortBy.NEWEST: {
            return a.address.toLowerCase() > b.address.toLowerCase() ? -1 : 1
          }
          case SortBy.NAME: {
            return a.subdomain.toLowerCase() > b.subdomain.toLowerCase() ? 1 : -1
          }
          default: {
            return 0
          }
        }
      })
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    return sortedEnsList
  }

  isAlias(ens: ENS): boolean {
    const { alias } = this.props
    const name = getNameFromDomain(ens.subdomain)
    return alias ? name === alias.toLowerCase() : false
  }

  renderEnsList() {
    const { ensList, onOpenModal } = this.props
    const { page } = this.state

    const total = ensList.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const paginatedItems = this.paginate()

    return (
      <>
        <div className="filters">
          <Container>
            <Row height={36}>
              <Column>
                <Row>
                  <Header sub>{t('ens_list_page.items', { count: ensList.length.toLocaleString() })}</Header>
                </Row>
              </Column>
              <Column align="right">
                <Row>{ensList.length > 1 ? this.renderSortDropdown() : null}</Row>
              </Column>
              <Column align="right" className="claim-name" grow={false} shrink>
                <Row>
                  <Button basic onClick={this.handleClaimENS}>
                    <Icon name="add-active" />
                  </Button>
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
                    <Table.HeaderCell width="2">{t('ens_list_page.table.being_assigned')}</Table.HeaderCell>
                    <Table.HeaderCell width="2">{t('ens_list_page.table.assigned_to')}</Table.HeaderCell>
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
                              <div>{ens.subdomain}</div>
                              {this.isAlias(ens) ? (
                                <Popup
                                  className="alias-popup"
                                  content={t('ens_list_page.alias_popup')}
                                  position="top center"
                                  trigger={
                                    <div>
                                      <Icon name="profile" />
                                    </div>
                                  }
                                  hideOnScroll={true}
                                  on="hover"
                                  inverted
                                  basic
                                />
                              ) : null}
                            </Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
                            <Column className="beingAssigned">{ens.landId ? ens.landId : t('global.no')}</Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
                            <Column className="assignedTo">{ens.landId ? ens.subdomain : '--'}</Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
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
                                  {t('ens_list_page.button.re_assign')}
                                </Button>
                              </Column>
                            ) : null}
                            {!this.isAlias(ens) ? (
                              <Column align="right">
                                <Button
                                  className="ui basic button"
                                  onClick={() => {
                                    const newName = getNameFromDomain(ens.subdomain)
                                    onOpenModal('UseAsAliasModal', { newName })
                                  }}
                                >
                                  {t('ens_list_page.button.use_as_alias')}
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
            ) : null}
            {total !== null && totalPages !== null && totalPages > 1 && (
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
