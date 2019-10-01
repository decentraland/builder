import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'

export type AuthState = {
  loading: LoadingState
  data: AuthData | null
  error: string | null
}

export type AuthData = {
  email: string
  sub: string
  idToken: string
  accessToken: string
  expiresAt: number
  user?: User
}

export type User = {
  avatar: {
    bodyShape: string
    eyes: { color: Color }
    hair: { color: Color }
    skin: { color: Color }
    version: number
    wearables: string[]
    snapshots: {
      body: string
      face: string
    }
  }
  name: string
  description: string
  createdAt: number
  updatedAt: number
  version: number
}

export type Color = {
  r: number
  g: number
  b: number
}

export type LoginOptions = {
  returnUrl?: string
  openModal?: {
    name: string
    metadata?: any
  }
}
