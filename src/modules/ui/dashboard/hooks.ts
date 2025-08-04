import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getPageFromSearchParams } from 'modules/location/url-parsers'
import { getProjects, getTotalPages } from './selectors'

export const useGetProjects = () => {
  const location = useLocation()
  return useSelector((state: RootState) => getProjects(state, location.search))
}

export const useGetProjectCurrentPage = () => {
  const location = useLocation()
  const totalPages = useSelector(getTotalPages)
  return getPageFromSearchParams(location.search, totalPages)
}
