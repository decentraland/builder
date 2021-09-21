import * as React from 'react'
import { Field, FieldProps } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { MIN_TITLE_LENGTH, MAX_TITLE_LENGTH } from 'modules/project/constants'

export default class TitleField extends React.PureComponent<FieldProps> {
  render() {
    return (
      <Field
        label={t('project_fields.title_field_label')}
        placeholder={t('project_fields.title_field_placeholder')}
        pattern={`.{${MIN_TITLE_LENGTH},${MAX_TITLE_LENGTH}}`}
        title={t('validation.project.title.length', {
          min: MIN_TITLE_LENGTH,
          max: MAX_TITLE_LENGTH
        })}
        {...this.props}
      />
    )
  }
}
