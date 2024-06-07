export enum NavigationTab {
  OVERVIEW = 'overview',
  SCENES = 'scenes',
  LAND = 'land',
  COLLECTIONS = 'collections',
  NAMES = 'names',
  WORLDS = 'worlds',
  CURATION = 'curation'
}

export type Props = {
  children?: React.ReactNode
  activeTab?: NavigationTab
  isFullscreen?: boolean
  isCommitteeMember: boolean
}

export type MapStateProps = Pick<Props, 'isCommitteeMember'>
