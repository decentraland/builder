import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionProvider from 'components/CollectionProvider'
import Header from './Header'
import Items from './Items'
import Collections from './Collections'
import { Props } from './LeftPanel.types'
import './LeftPanel.css'

export default class LeftPanel extends React.PureComponent<Props> {
  render() {
    const {
      items,
      orphanItems,
      collections,
      selectedItemId,
      selectedCollectionId,
      visibleItems,
      onSetItems,
      bodyShape,
      onSetCollection
    } = this.props
    return (
      <div className="LeftPanel">
        <CollectionProvider id={selectedCollectionId}>
          {(collection, collectionItems, isLoading) => {
            const listItems = selectedCollectionId ? collectionItems : orphanItems
            return !collection && isLoading ? (
              <Loader size="massive" active />
            ) : listItems.length === 0 && collections.length === 0 ? (
              <>
                <Header />
                <div className="empty">
                  <div className="subtitle">{t('avatar_page.empty_description')}</div>
                </div>
              </>
            ) : (
              <>
                <Header />
                <Items
                  items={listItems}
                  hasHeader={!selectedCollectionId && collections.length > 0}
                  selectedItemId={selectedItemId}
                  selectedCollectionId={selectedCollectionId}
                  visibleItems={visibleItems}
                  onSetItems={onSetItems}
                  bodyShape={bodyShape}
                />
                {selectedCollectionId ? null : (
                  <Collections
                    collections={collections}
                    items={items}
                    hasHeader={listItems.length > 0}
                    selectedCollectionId={selectedCollectionId}
                    onSetCollection={onSetCollection}
                  />
                )}
              </>
            )
          }}
        </CollectionProvider>
      </div>
    )
  }
}
