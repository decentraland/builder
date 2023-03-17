import React, { ReactNode } from 'react'
import { ModelMetrics, WearableCategory } from '@dcl/builder-client'
import { isValidWearableTextures, isValidWearableTriangles } from '../utils'
import { WearableExceedsMaxTexturesError, WearableExceedsMaxTrianglesError } from 'modules/item/errors'
import './ErrorMetrics.css'

export const ErrorMetrics: React.FC<{ metrics: ModelMetrics; category: WearableCategory }> = props => {
  const { metrics, category } = props

  const renderError = (error: { message: ReactNode }) => {
    return (
      <div className="errorContainer">
        <div className="errorIcon" />
        <div className="errorMessage">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="ErrorMetrics">
      {!isValidWearableTriangles(metrics, category) ? renderError(new WearableExceedsMaxTrianglesError(category)) : null}
      {!isValidWearableTextures(metrics, category) ? renderError(new WearableExceedsMaxTexturesError(category)) : null}
    </div>
  )
}

export default ErrorMetrics
