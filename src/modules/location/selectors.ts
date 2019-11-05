import { RootState } from "modules/common/types"

export const getProjectId = () => window.location.pathname.split('/').pop()

export const getPublicProjectData = (state: RootState) => state.location
