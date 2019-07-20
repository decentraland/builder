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
  email: string
  profile: {
    avatar: {
      bodyShape: string
      eyes: { color: Color }
      hair: { color: Color }
      skin: { color: Color }
      version: number
      wearables: string[]
    }
    created_at: number
    description: string
    name: string
  }
  snapshots: {
    body: string
    face: string
  }
  updatedAt: number
  userId: string
}

export type Color = {
  r: number
  g: number
  b: number
}
