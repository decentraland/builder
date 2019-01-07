import * as React from 'react'
import { Header, Grid } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Drawer from 'components/Drawer'
import './SideBar.css'

import ItemDrawer from './ItemDrawer'

export default class SideBar extends React.PureComponent {
  render() {
    return (
      <div className="SideBar">
        <ItemDrawer
          assets={[
            {
              id: '1',
              name: 'Test',
              thumbnail: 'https://market.decentraland.org/static/media/logo.b7751b3e.svg',
              url: 'http://example.com',
              tags: ['test'],
              category: 'test',
              variations: []
            },
            {
              id: '1',
              name: 'Other test',
              thumbnail: 'https://market.decentraland.org/static/media/logo.b7751b3e.svg',
              url: 'http://example.com',
              tags: ['test'],
              category: 'test',
              variations: []
            },
            {
              id: '1',
              name: 'Something',
              thumbnail: 'https://market.decentraland.org/static/media/logo.b7751b3e.svg',
              url: 'http://example.com',
              tags: ['test'],
              category: 'test',
              variations: []
            },
            {
              id: '1',
              name: 'Worky Worky',
              thumbnail: 'https://market.decentraland.org/static/media/logo.b7751b3e.svg',
              url: 'http://example.com',
              tags: ['test'],
              category: 'test',
              variations: []
            }
          ]}
        />
      </div>
    )
  }
}
