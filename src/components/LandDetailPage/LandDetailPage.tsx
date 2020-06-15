import * as React from 'react'
import { Row, Back, Badge, Section, Narrow, Column, Button, Dropdown, Icon, Header, Empty, Layer, Stats } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { LandType, Land } from 'modules/land/types'
import { getSelection, getCenter, coordsToId } from 'modules/land/utils'
import { Atlas } from 'components/Atlas'
import { Project } from 'modules/project/types'
import { locations } from 'routing/locations'
import LandProviderPage from 'components/LandProviderPage'
import Profile from 'components/Profile'
import Scene from './Scene'
import { Props, State } from './LandDetailPage.types'
import './LandDetailPage.css'

export default class LandDetailPage extends React.PureComponent<Props, State> {
  state = {
    hovered: null
  }

  handleMouseEnter = (project: Project) => {
    this.setState({ hovered: project.id })
  }

  handleMouseLeave = () => {
    this.setState({ hovered: null })
  }

  isHovered = (x: number, y: number) => {
    const { occupiedParcels } = this.props
    const { hovered } = this.state
    const id = coordsToId(x, y)
    const parcel = occupiedParcels[id]
    return !!parcel && hovered === parcel.projectId
  }

  hoverLayer: Layer = (x, y) => {
    return this.isHovered(x, y) ? { color: '#ffffff', scale: 1.2 } : null
  }

  renderDetail(land: Land, projects: Project[]) {
    const { onNavigate, occupiedParcels } = this.props
    const projectIds = projects.reduce((set, project) => set.add(project.id), new Set<string>())
    const occupiedTotal = Object.values(occupiedParcels).reduce((total, parcel) => total + (projectIds.has(parcel.projectId) ? 1 : 0), 0)
    const selection = getSelection(land)
    const [x, y] = getCenter(selection)
    return (
      <>
        <Section>
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
                    <a
                      className="jump-in"
                      target="_blank"
                      rel="no:opener no:referrer"
                      href={`https://play.decentraland.org?position=${coordsToId(x, y)}`}
                    />
                  </Row>
                </Column>
                <Column className="actions" align="right">
                  <Row>
                    <Button basic onClick={() => onNavigate(locations.landTransfer(land.id))}>
                      {t('land_detail_page.transfer')}
                    </Button>
                    <Button basic onClick={() => onNavigate(locations.landEdit(land.id))}>
                      {t('land_detail_page.edit')}
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
                        <Dropdown.Item text={t('land_detail_page.set_operator')} />
                        <Dropdown.Item text={t('land_detail_page.build_estate')} />
                        <Dropdown.Item text={t('land_detail_page.add_or_remove_parcels')} />
                        <Dropdown.Item text={t('land_detail_page.dissolve_estate')} />
                      </Dropdown.Menu>
                    </Dropdown>
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          <Section>
            <div className="atlas-wrapper">
              <Atlas selection={selection} hasPopup x={x} y={y} layers={[this.hoverLayer]} isDraggable={false}></Atlas>
            </div>
          </Section>
          <Section>
            <Header sub>Online Scenes</Header>
            {projects.length === 0 ? (
              <Empty height={100}>None</Empty>
            ) : (
              <div className="projects">
                {projects.map(project => (
                  <Scene project={project} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} />
                ))}
              </div>
            )}
          </Section>
          {land.description ? (
            <Section className="description">
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
