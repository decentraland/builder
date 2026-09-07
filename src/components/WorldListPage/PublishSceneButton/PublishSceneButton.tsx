import { Button, Popup } from 'decentraland-ui'
import { Props } from './PublishSceneButton.types'
import { isWorldDeployed } from '../utils'
import { t } from 'decentraland-dapps/dist/modules/translation'

export default function PublishSceneButton({ deploymentsByWorlds, ens, projects, onViewScene, onUnpublishScene }: Props): JSX.Element {
  const deployment = deploymentsByWorlds[ens.subdomain]
  return isWorldDeployed(deploymentsByWorlds, ens) ? (
    <div className="publish-scene">
      <Popup content={deployment?.name} on="hover" trigger={<span>{deployment?.name}</span>} />
      {projects.find(project => project.id === deployment?.projectId)
        ? onViewScene && (
            <Button inverted size="small" onClick={() => onViewScene(ens)}>
              {t('worlds_list_page.table.view_scene')}
            </Button>
          )
        : onUnpublishScene && (
            <Popup
              content={t('worlds_list_page.table.scene_published_outside_builder')}
              on="hover"
              position="top center"
              trigger={
                <Button inverted size="small" onClick={() => onUnpublishScene(ens)}>
                  {t('worlds_list_page.table.unpublish_scene')}
                </Button>
              }
            />
          )}
    </div>
  ) : (
    <div className="publish-scene">
      <span>-</span>
    </div>
  )
}
