import * as React from 'react'
import { Link } from 'react-router-dom'
import { Page, Tabs, Center, Loader, Table, Row, Radio, Column, Header, Pagination, Section, Container, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import Chip from 'components/Chip'
import { RoleType } from 'modules/land/types'
import { Atlas } from 'components/Atlas'
import { getCoords } from 'modules/land/utils'
import TableRow from './TableRow'
import { Props, State, LandPageView } from './LandPage.types'
import './LandPage.css'

const PAGE_SIZE = 20

export default class LandPage extends React.PureComponent<Props, State> {
  state: State = {
    showOwner: true,
    showOperator: true,
    view: LandPageView.GRID,
    page: 1,
    selectedLand: 0
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.lands !== this.props.lands) {
      this.setState({ page: 1 })
    }
  }

  renderLogin() {
    return (
      <Center>
        <div className="secondary-text">
          You need to <Link to={locations.signIn()}>Sign In</Link> to access this page.
        </div>
      </Center>
    )
  }

  renderLoading() {
    return <Loader size="large" active />
  }

  renderLand() {
    const { page, showOwner, showOperator, view, selectedLand } = this.state

    const filteredLands = this.getFilteredLands()

    const totalPages = Math.ceil(filteredLands.length / PAGE_SIZE)

    let selectedX
    let selectedY
    if (filteredLands.length > 1 && selectedLand < filteredLands.length) {
      const { x, y } = getCoords(filteredLands[selectedLand])
      selectedX = x
      selectedY = y
    } else if (filteredLands.length === 1) {
      const { x, y } = getCoords(filteredLands[0])
      selectedX = x
      selectedY = y
    }
    return (
      <>
        <div className="filters">
          <Container>
            <Row height={30}>
              <Column>
                <Row>
                  <Header sub>{filteredLands.length.toLocaleString()} Results</Header>
                  {view === LandPageView.ATLAS && filteredLands.length > 1 ? (
                    <>
                      <div className="arrow prev" onClick={this.handlePrev}></div>
                      <div className="arrow next" onClick={this.handleNext}></div>
                    </>
                  ) : null}
                </Row>
              </Column>
              <Column align="right">
                <Row>
                  <Popup
                    trigger={
                      <Radio
                        className="owner-checkbox"
                        value="owner"
                        checked={showOwner}
                        onClick={() => this.setState({ showOwner: !showOwner })}
                        label="Owner"
                      />
                    }
                    content="These are lands you own."
                  />
                  <Popup
                    trigger={
                      <Radio
                        className="operator-checkbox"
                        value="operator"
                        checked={showOperator}
                        onClick={() => this.setState({ showOperator: !showOperator })}
                        label="Operator"
                      />
                    }
                    className="operator-popup"
                    content={<div>These are lands you don't own, but the owner gave you permission to use them.</div>}
                  />
                  <Chip
                    className="grid"
                    icon="table"
                    isActive={view === LandPageView.GRID}
                    onClick={() => this.setState({ view: LandPageView.GRID })}
                  />
                  <Chip
                    className="atlas"
                    icon="pin"
                    isActive={view === LandPageView.ATLAS}
                    onClick={() => this.setState({ view: LandPageView.ATLAS })}
                  />
                </Row>
              </Column>
            </Row>
          </Container>
        </div>
        {view === LandPageView.GRID ? (
          <Container>
            <Section className="table-section">
              {filteredLands.length > 0 ? (
                <Table basic="very">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell width="4">Name</Table.HeaderCell>
                      <Table.HeaderCell width="2">Coordinates</Table.HeaderCell>
                      <Table.HeaderCell width="2">Owner</Table.HeaderCell>
                      <Table.HeaderCell width="4">Operators</Table.HeaderCell>
                      <Table.HeaderCell width="1">Type</Table.HeaderCell>
                      <Table.HeaderCell width="3">Current Scene</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {filteredLands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(land => (
                      <TableRow land={land} />
                    ))}
                  </Table.Body>
                </Table>
              ) : null}
            </Section>
            {totalPages > 1 ? (
              <Section className="pagination-section">
                <Pagination
                  firstItem={null}
                  lastItem={null}
                  activePage={page}
                  onPageChange={(_event, props) => this.setState({ page: +props.activePage! })}
                  totalPages={totalPages}
                ></Pagination>
              </Section>
            ) : null}
          </Container>
        ) : (
          <div className="atlas-wrapper">
            <Atlas className="main" x={selectedX} y={selectedY} showOperator={showOperator} showOwner={showOwner} hasPopup />
          </div>
        )}
      </>
    )
  }

  getFilteredLands() {
    const { lands } = this.props
    const { showOwner, showOperator } = this.state

    const filteredLands = lands.filter(land => {
      if (showOwner && land.role === RoleType.OWNER) {
        return true
      }
      if (showOperator && land.role === RoleType.OPERATOR) {
        return true
      }
      return false
    })

    return filteredLands
  }

  handleNext = () => {
    const { selectedLand } = this.state
    const lands = this.getFilteredLands()
    if (selectedLand === lands.length - 1) {
      this.setState({ selectedLand: 0 })
    } else {
      this.setState({ selectedLand: selectedLand + 1 })
    }
  }

  handlePrev = () => {
    const { selectedLand } = this.state
    if (selectedLand === 0) {
      const lands = this.getFilteredLands()
      this.setState({ selectedLand: lands.length - 1 })
    } else {
      this.setState({ selectedLand: selectedLand - 1 })
    }
  }

  // handleHover = (x: number, y: number) => {
  //   const id = coordsToId(x, y)
  //   const { showPopup } = this.state
  //   const tile = this.props.landTiles[id]
  //   if (tile && !showPopup) {
  //     this.setState({ hoveredLand: tile.land, mouseX: -1, mouseY: -1, showPopup: true })
  //   } else if (!tile && showPopup) {
  //     this.setState({ showPopup: false })
  //     setTimeout(() => {
  //       if (!this.state.showPopup) {
  //         this.setState({ hoveredLand: null })
  //       }
  //     }, 500)
  //   }
  // }

  render() {
    const { isLoggedIn, isLoading, onNavigate } = this.props
    const { view } = this.state
    return (
      <>
        <Navbar isFullscreen />
        <Page className={`LandPage ${view}-view`} isFullscreen>
          <Tabs>
            <Tabs.Tab onClick={() => onNavigate(locations.root())}>{t('navigation.scenes')}</Tabs.Tab>
            <Tabs.Tab active>{t('navigation.land')}</Tabs.Tab>
          </Tabs>
          {!isLoggedIn ? this.renderLogin() : null}
          {isLoggedIn && isLoading ? this.renderLoading() : null}
          {isLoggedIn && !isLoading ? this.renderLand() : null}
        </Page>
        <Footer isFullscreen />
      </>
    )
  }
}
