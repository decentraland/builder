import * as React from 'react'
import { Field, FieldProps } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { MIN_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH } from 'modules/project/utils'

export default class DescriptionField extends React.PureComponent<FieldProps> {
  render() {
    return (
      <Field
        icon={this.props.required ? 'asterisk' : ''}
        label={t('project_fields.description_field_label')}
        placeholder={t('project_fields.description_field_placeholder')}
        pattern={`.{${MIN_DESCRIPTION_LENGTH},${MAX_DESCRIPTION_LENGTH}}`}
        title={t('validation.project.description.length', {
          min: MIN_DESCRIPTION_LENGTH,
          max: MAX_DESCRIPTION_LENGTH
        })}
        {...this.props}
      />
    )
  }
}
