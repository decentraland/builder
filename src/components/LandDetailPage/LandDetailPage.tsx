import * as React from 'react'
import { Row, Badge, Section, Narrow, Column, Button, Dropdown, Icon, Header, Empty, Layer, Stats } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { env } from 'decentraland-commons'
import { LandType, Land, RoleType } from 'modules/land/types'
import { Deployment } from 'modules/deployment/types'
import { coordsToId, hoverStrokeByRole, hoverFillByRole } from 'modules/land/utils'
import { Atlas } from 'components/Atlas'
import { locations } from 'routing/locations'
import LandProviderPage from 'components/LandProviderPage'
import Back from 'components/Back'
import Profile from 'components/Profile'
import JumpIn from 'components/JumpIn'
import ENSChip from './ENSChip'
import Scene from './Scene'
import { Props, State } from './LandDetailPage.types'
import './LandDetailPage.css'

export default class LandDetailPage extends React.PureComponent<Props, State> {
  state: State = {
    hovered: null,
    mouseX: 0,
    mouseY: 0,
    showTooltip: false
  }

  handleMouseEnter = (deployment: Deployment) => {
    this.setState({ hovered: deployment, showTooltip: false })
  }

  handleMouseLeave = () => {
    this.setState({ hovered: null, showTooltip: false })
  }

  handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState({ mouseX: event.clientX, mouseY: event.clientY })
  }

  handleHover = (deployments: Deployment[]) => (x: number, y: number) => {
    const { deploymentsByCoord } = this.props
    const deployment = deploymentsByCoord[coordsToId(x, y)]
    if (deployment && deployments.some(_deployment => _deployment.id === deployment.id)) {
      this.setState({ hovered: deployment, showTooltip: true })
    } else {
      this.setState({ hovered: null, showTooltip: false })
    }
  }

  handleClick = (x: number, y: number) => {
    const { deploymentsByCoord, projects, onNavigate, onReplace, landTiles } = this.props
    const id = coordsToId(x, y)
    const deployment = deploymentsByCoord[id]
    if (deployment && deployment.projectId && deployment.projectId in projects) {
      onNavigate(locations.sceneDetail(deployment.projectId))
    } else if (id in landTiles) {
      onReplace(locations.landDetail(landTiles[id].land.id))
    }
  }

  isHovered = (x: number, y: number) => {
    const { deploymentsByCoord } = this.props
    const { hovered } = this.state
    const id = coordsToId(x, y)
    const deployment = deploymentsByCoord[id]

    return !!deployment && !!hovered && hovered.id === deployment.id
  }

  getHoverStrokeLayer = (land: Land): Layer => (x, y) => {
    return this.isHovered(x, y) ? { color: hoverStrokeByRole[land.role], scale: 1.4 } : null
  }

  getHoverFillLayer = (land: Land): Layer => (x, y) => {
    return this.isHovered(x, y) ? { color: hoverFillByRole[land.role], scale: 1.2 } : null
  }

  computeOccupiedLand(land: Land, deployments: Deployment[]) {
    const { landTiles } = this.props
    const occupiedTotal = deployments.reduce(
      (total, deployment) =>
        total +
        deployment.parcels.filter(coords => {
          const tile = landTiles[coords]
          return !!tile && tile.land.id === land.id
        }).length,
      0
    )
    return occupiedTotal
  }

  renderDetail(land: Land, deployments: Deployment[]) {
    const { ensList, parcelsAvailableToBuildEstates, projects, onNavigate, onOpenModal } = this.props
    const { hovered, mouseX, mouseY, showTooltip } = this.state
    const occupiedTotal = this.computeOccupiedLand(land, deployments)

    const canBuildEstate = parcelsAvailableToBuildEstates[land.id]
    const isAtlasClickable = showTooltip && hovered && hovered.projectId && hovered.projectId in projects

    return (
      <>
        {hovered && showTooltip ? (
          <div className="tooltip" style={{ top: mouseY, left: mouseX }}>
            {hovered.thumbnail ? <div className="thumbnail" style={{ backgroundImage: `url(${hovered.thumbnail})` }} /> : null}
            <div className="name">{hovered.name}</div>
          </div>
        ) : null}
        <Section size="large">
          <Row>
            <Back absolute onClick={() => onNavigate(locations.land())} />
            <Narrow>
              <Row>
                <Column>
                  <Row>
                    <Header size="huge">{land.name}</Header>
                    {land.type === LandType.PARCEL ? (
                      <>
                        <Badge color="#37333D">
                          <i className="pin" />
                          {land.id}
                        </Badge>
                      </>
                    ) : (
                      <Badge color="#37333D">{land.size!} LAND</Badge>
                    )}
                    <JumpIn land={land} />
                  </Row>
                </Column>
                {land.role === RoleType.OWNER ? (
                  <Column className="actions" align="right">
                    <Row>
                      <Button basic onClick={() => onNavigate(locations.landTransfer(land.id))}>
                        {t('land_detail_page.transfer')}
                      </Button>
                      <Button basic onClick={() => onNavigate(locations.landEdit(land.id))}>
                        {t('global.edit')}
                      </Button>
                      <Dropdown
                        trigger={
                          <Button basic>
                            <Icon name="ellipsis horizontal" />
                          </Button>
                        }
                        inline
                        direction="left"
                      >
                        <Dropdown.Menu>
                          {canBuildEstate ? (
                            <>
                              <Dropdown.Item
                                text={t('land_detail_page.build_estate')}
                                onClick={() => onOpenModal('EstateEditorModal', { land })}
                              />
                              <Dropdown.Divider />
                            </>
                          ) : null}
                          {land.type === LandType.ESTATE ? (
                            <>
                              <Dropdown.Item
                                text={t('land_detail_page.add_or_remove_parcels')}
                                onClick={() => onOpenModal('EstateEditorModal', { land })}
                              />
                              <Dropdown.Item
                                text={t('land_detail_page.dissolve_estate')}
                                onClick={() => onOpenModal('DissolveModal', { land })}
                              />
                              <Dropdown.Divider />
                            </>
                          ) : null}
                          {env.get('REACT_APP_FF_ENS') ? (
                            <>
                              <Dropdown.Item
                                text={t('land_detail_page.assign_name')}
                                onClick={() => onNavigate(locations.landSelectENS(land.id))}
                              />
                              <Dropdown.Divider />
                            </>
                          ) : null}
                          <Dropdown.Item
                            text={t('land_detail_page.set_operator')}
                            onClick={() => onNavigate(locations.landOperator(land.id))}
                          />
                        </Dropdown.Menu>
                      </Dropdown>
                    </Row>
                  </Column>
                ) : null}
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          <Section size="large">
            <div
              className={`atlas-wrapper ${isAtlasClickable ? 'clickable' : ''}`}
              onMouseLeave={this.handleMouseLeave}
              onMouseMove={this.handleMouseMove}
            >
              <Atlas
                landId={land.id}
                layers={[this.getHoverStrokeLayer(land), this.getHoverFillLayer(land)]}
                isDraggable
                zoom={land.size && land.size >= 1000 ? 0.5 : 1}
                onHover={this.handleHover(deployments)}
                onClick={this.handleClick}
              ></Atlas>
            </div>
          </Section>
          <Section size="large">
            <Header sub>{t('land_detail_page.online_scenes')}</Header>
            {deployments.length === 0 ? (
              <Empty height={100}>{t('land_detail_page.none')}</Empty>
            ) : (
              <>
                <div className="deployments">
                  {deployments.map(deployment => (
                    <Scene
                      deployment={deployment}
                      onMouseEnter={this.handleMouseEnter}
                      onMouseLeave={this.handleMouseLeave}
                      onNavigate={onNavigate}
                      onOpenModal={onOpenModal}
                      projects={projects}
                    />
                  ))}
                </div>
                <div className="notice">{t('analytics.notice')}</div>
              </>
            )}
          </Section>
          {env.get('REACT_APP_FF_ENS') && ensList.length > 0 ? (
            <Section size="large">
              <Header sub>
                <Row>
                  <Column>{t('land_detail_page.assigned_names')}</Column>
                </Row>
              </Header>
              <div className="ens-list">
                {ensList.map(ens => (
                  <ENSChip land={land} key={ens.subdomain} ens={ens} />
                ))}
              </div>
            </Section>
          ) : null}
          {land.description ? (
            <Section size="large">
              <Header sub>{t('land_detail_page.description')}</Header>
              <p>{land.description}</p>
            </Section>
          ) : null}
          <Section className="data">
            <Stats title={t('land_detail_page.owner')}>
              <Profile address={land.owner} size="large" />
            </Stats>
            {land.operators.length > 0 ? (
              <Stats title={t('land_detail_page.operators')} className="operators">
                <Row>
                  {land.operators.map(operator => (
                    <Profile address={operator} size="large" />
                  ))}
                </Row>
              </Stats>
            ) : null}
            {land.type === LandType.ESTATE ? (
              <>
                <Stats title={t('land_detail_page.total_land')}>
                  <Header>{land.size}</Header>
                </Stats>
                <Stats title={t('land_detail_page.empty_land')}>
                  <Header>{land.size! - occupiedTotal}</Header>
                </Stats>
              </>
            ) : null}
          </Section>
        </Narrow>
      </>
    )
  }

  render() {
    return <LandProviderPage className="LandDetailPage">{(land, projects) => this.renderDetail(land, projects)}</LandProviderPage>
  }
}
