import * as React from 'react'
import { Loader, Row, Column, Section, Header, Button, Narrow } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { locations } from 'routing/locations'
import { Land } from 'modules/land/types'
import { idToCoords, coordsToId, locateNextLand } from 'modules/land/utils'
import { Atlas } from 'components/Atlas'
import Back from 'components/Back'
import NotFound from 'components/NotFound'
import { Props, State } from './ENSSelectLandPage.types'
import './ENSSelectLandPage.css'

export default class ENSSelectLandPage extends React.PureComponent<Props, State> {
  state: State = {}

  componentDidUpdate() {
    const { isLoading, ens } = this.props
    const { selectedLand } = this.state

    if (!selectedLand && !isLoading && ens) {
      this.setState({ selectedLand: this.getFirstAvailableLand() })
    }
  }

  handleBack = () => {
    this.props.onNavigate(locations.root())
  }

  handleSelectLand = (x: number, y: number) => {
    const selectedLand = this.getOwnedLand(x, y)
    if (selectedLand) {
      this.setState({ selectedLand })
    }
  }

  handleLocateLand = () => {
    const { landTiles } = this.props
    const { selectedLand } = this.state

    const nextLand = locateNextLand(landTiles!, selectedLand!.id)
    this.setState({ selectedLand: nextLand })
  }

  handleReassignENS = () => {
    const { onNavigate, ens } = this.props
    const { selectedLand } = this.state
    if (selectedLand) {
      onNavigate(locations.landAssignENS(selectedLand!.id, ens!.subdomain))
    }
  }

  hoverLayer = (x: number, y: number) => {
    return this.isHovered(x, y) && this.getOwnedLand(x, y) ? { color: '#fcc6d1', scale: 1.4 } : null
  }

  isHovered(x: number, y: number) {
    const { selectedLand, hoveredLandId } = this.state
    const landId = coordsToId(x, y)
    return (!selectedLand || selectedLand.id !== landId) && hoveredLandId === landId
  }

  getOwnedLand(x: number, y: number) {
    const { landTiles } = this.props
    const landId = coordsToId(x, y)
    return landTiles && landId in landTiles ? landTiles[landId].land : undefined
  }

  handleOnHover = (x: number, y: number) => {
    this.setState({ hoveredLandId: coordsToId(x, y) })
  }

  getFirstAvailableLand() {
    const { ens, landTiles } = this.props
    const tiles = Object.values(landTiles || {})
    if (tiles.length === 1) {
      return tiles[0].land
    }

    let land: Land | undefined
    for (const tile of tiles) {
      if (tile.land.id !== ens!.landId) {
        land = tile.land
        break
      }
    }
    return land
  }

  render() {
    const { ens, isLoading, onBack } = this.props
    const { selectedLand } = this.state

    const isSameLand = selectedLand && ens && selectedLand.id === ens.landId

    return (
      <LoggedInDetailPage className="ENSSelectLandPage" hasNavigation={false}>
        {isLoading ? (
          <Loader active size="massive" />
        ) : !ens ? (
          <NotFound />
        ) : (
          <>
            <Back absolute onClick={this.handleBack} />
            <Narrow>
              <Row>
                <Column>
                  <Section>
                    <Header className="title" size="large">
                      {t('ens_select_land_page.title', { name: ens ? ens.subdomain : t('global.name') })}
                    </Header>
                    <span className="subtitle">{t('ens_select_land_page.subtitle')}</span>
                  </Section>
                </Column>
              </Row>
              <div className="atlas-wrapper">
                <Atlas
                  showControls
                  showOwner
                  isDraggable
                  landId={selectedLand ? selectedLand.id : undefined}
                  onClick={this.handleSelectLand}
                  onHover={this.handleOnHover}
                  onLocateLand={this.handleLocateLand}
                  layers={[this.hoverLayer]}
                />
              </div>
              <Row className="atlas-footer">
                <Column grow>
                  {selectedLand ? (
                    <div className="selected-land">
                      <div className="label">{t('ens_select_land_page.land_selected')}</div>
                      <div className="land">
                        {selectedLand.name} ({idToCoords(selectedLand.id)})
                      </div>
                    </div>
                  ) : null}
                </Column>
                <Column grow={false}>
                  <div className="actions">
                    <Button secondary onClick={onBack}>
                      {t('global.cancel')}
                    </Button>
                    <Button primary disabled={!selectedLand || isSameLand} onClick={this.handleReassignENS}>
                      {isSameLand ? t('ens_select_land_page.already_assigned') : t('global.continue')}
                    </Button>
                  </div>
                </Column>
              </Row>
            </Narrow>
          </>
        )}
      </LoggedInDetailPage>
    )
  }
}
