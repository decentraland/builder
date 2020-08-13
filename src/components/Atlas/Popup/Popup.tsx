import * as React from 'react'
import { Badge, Row, Section, Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { LandType } from 'modules/land/types'
import Profile from 'components/Profile'
import { Props } from './Popup.types'
import './Popup.css'

export default class Popup extends React.PureComponent<Props> {
  render() {
    const { x, y, visible, land, deployments } = this.props
    return (
      <div className="Popup" style={{ top: y, left: x, opacity: visible ? 1 : 0 }}>
        <Section className="land-name">
          <Row className="name-row">
            <span className="name">{land.name}</span>
            {land.type === LandType.PARCEL ? (
              <Badge color="#37333D">
                <i className="pin" />
                {land.id}
              </Badge>
            ) : null}
          </Row>
        </Section>
        <Section className="owner">
          <Header sub>{t('land_page.owner')}</Header>
          <Profile address={land.owner} />
        </Section>

        {land.operators.length > 0 ? (
          <Section className="operators">
            <Header sub>{t('land_page.operators')}</Header>
            {land.operators.map(operator => (
              <Profile address={operator} />
            ))}
          </Section>
        ) : null}

        <Section className="online-scenes">
          <Header sub>{t('land_page.online_scenes')}</Header>
          {deployments.length > 0 ? (
            deployments.map(deployment => (
              <Row className="scene">
                {deployment.thumbnail ? <div className="thumbnail" style={{ backgroundImage: `url(${deployment.thumbnail})` }} /> : null}
                <div className="title">{deployment.name}</div>
              </Row>
            ))
          ) : (
            <div className="no-scenes">{t('land_page.none')}</div>
          )}
        </Section>
      </div>
    )
  }
}
