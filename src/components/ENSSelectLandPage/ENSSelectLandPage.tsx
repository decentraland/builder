import { useMemo, useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { Loader, Row, Column, Section, Header, Button, Narrow } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { locations } from 'routing/locations'
import { Land } from 'modules/land/types'
import { coordsToId, locateNextLand } from 'modules/land/utils'
import { Atlas } from 'components/Atlas'
import Back from 'components/Back'
import NotFound from 'components/NotFound'
import { Props } from './ENSSelectLandPage.types'
import './ENSSelectLandPage.css'

export default function ENSSelectLandPage(props: Props) {
  const [selectedLand, setSelectedLand] = useState<Land | undefined>(undefined)
  const [hoveredLandId, setHoveredLandId] = useState<string | undefined>(undefined)
  const { isLoading, ens, landTiles } = props
  const history = useHistory()

  const firstAvailableLand = useMemo(() => {
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
  }, [landTiles])

  useEffect(() => {
    if (!selectedLand && !isLoading && ens) {
      setSelectedLand(firstAvailableLand)
    }
  }, [firstAvailableLand])

  const getOwnedLand = useCallback(
    (x: number, y: number) => {
      const landId = coordsToId(x, y)
      return landTiles && landId in landTiles ? landTiles[landId].land : undefined
    },
    [landTiles]
  )

  const handleSelectLand = useCallback((x: number, y: number) => {
    const land = getOwnedLand(x, y)
    if (land) {
      setSelectedLand(land)
    }
  }, [])

  const handleLocateLand = useCallback(() => {
    const nextLand = locateNextLand(landTiles!, selectedLand!.id)
    setSelectedLand(nextLand)
  }, [selectedLand, landTiles])

  const handleReassignENS = useCallback(() => {
    if (selectedLand) {
      history.push(locations.landAssignENS(selectedLand.id, ens!.subdomain))
    }
  }, [ens, history, selectedLand])

  const isHovered = useCallback((x: number, y: number) => {
    const landId = coordsToId(x, y)
    return (!selectedLand || selectedLand.id !== landId) && hoveredLandId === landId
  }, [])

  const hoverLayer = useCallback((x: number, y: number) => {
    return isHovered(x, y) && getOwnedLand(x, y) ? { color: '#fcc6d1', scale: 1.4 } : null
  }, [])

  const handleOnHover = useCallback((x: number, y: number) => {
    setHoveredLandId(coordsToId(x, y))
  }, [])

  const handleGoBack = useCallback(() => {
    history.goBack()
  }, [history])

  const isSameLand = selectedLand && ens && selectedLand.id === ens.landId
  return (
    <LoggedInDetailPage className="ENSSelectLandPage" hasNavigation={false}>
      {isLoading ? (
        <Loader active size="massive" />
      ) : !ens ? (
        <NotFound />
      ) : (
        <>
          <Back absolute onClick={handleGoBack} />
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
                onClick={handleSelectLand}
                onHover={handleOnHover}
                onLocateLand={handleLocateLand}
                layers={[hoverLayer]}
              />
            </div>
            <Row className="atlas-footer">
              <Column grow>
                {selectedLand ? (
                  <div className="selected-land">
                    <div className="label">{t('ens_select_land_page.land_selected')}</div>
                    <div className="land">
                      {selectedLand.name} ({selectedLand.id})
                    </div>
                  </div>
                ) : null}
              </Column>
              <Column grow={false}>
                <div className="actions">
                  <Button secondary onClick={handleGoBack}>
                    {t('global.cancel')}
                  </Button>
                  <Button primary disabled={!selectedLand || isSameLand} onClick={handleReassignENS}>
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
