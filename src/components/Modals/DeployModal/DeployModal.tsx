import ClearDeployment from './ClearDeployment'
import { Props } from './DeployModal.types'
import './DeployModal.css'

export default function DeployModal({ name, metadata, onClose }: Props) {
  return <ClearDeployment deploymentId={metadata.deploymentId} name={name} onClose={onClose} />
}
