export type Profile = {
  id: string
  type: 'profile'
  timestamp: number
  pointers: string
  content: { file: string; hash: string }[]
  metadata: {
    avatars: Avatar[]
  }
}

export type Avatar = {
  userId: string
  email: string
  name: string
  hasClaimedName: boolean
  description: string
  ethAddress: string
  version: number
  avatar: {
    bodyShape: string
    snapshots: { face: string; body: string }
    eyes: { color: { r: number; g: number; b: number } }
    hair: { color: { r: number; g: number; b: number } }
    skin: { color: { r: number; g: number; b: number } }
    wearables: string[]
    version: 36
  }
  inventory: string[]
  tutorialStep: 99
  hasConnectedWeb3: true
}
