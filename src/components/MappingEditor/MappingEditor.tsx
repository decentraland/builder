import { SyntheticEvent, useCallback, useMemo } from 'react'
import { DropdownProps, Field, InputOnChangeData, SelectField, TextAreaField, TextAreaProps } from 'decentraland-ui'
import { MappingType, MultipleMapping } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation'
import allIcon from '../../icons/all.svg'
import multipleIcon from '../../icons/multiple.svg'
import singleIcon from '../../icons/single.svg'
import rangeIcon from '../../icons/range.svg'
import { Props } from './MappingEditor.types'
import styles from './MappingEditor.module.css'
import classNames from 'classnames'

const mappingTypeIcons = {
  [MappingType.ANY]: allIcon,
  [MappingType.MULTIPLE]: multipleIcon,
  [MappingType.SINGLE]: singleIcon,
  [MappingType.RANGE]: rangeIcon
}

export const MappingEditor = (props: Props) => {
  const { mapping, error, disabled, isCompact, onChange } = props

  const [mappingType, mappingValue] = useMemo(() => {
    switch (mapping.type) {
      case MappingType.MULTIPLE:
        return [MappingType.MULTIPLE, mapping.ids.join(', ')]
      case MappingType.SINGLE:
        return [MappingType.SINGLE, mapping.id]
      case MappingType.RANGE:
        return [MappingType.RANGE, `${mapping.from},${mapping.to}`]
      case MappingType.ANY:
      default:
        return [MappingType.ANY, '']
    }
  }, [mapping])

  const mappingTypeOptions = useMemo(
    () =>
      Object.values(MappingType).map((mapping: MappingType) => ({
        value: mapping,
        image: mappingTypeIcons[mapping],
        text: t(`mapping_editor.mapping_types.${mapping}`)
      })),
    []
  )

  const handleMappingTypeChange = useCallback(
    (_: SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
      const mappingType = value as MappingType
      switch (mappingType) {
        case MappingType.ANY:
          onChange({ type: mappingType })
          break
        case MappingType.MULTIPLE:
          onChange({ type: mappingType, ids: [] })
          break
        case MappingType.SINGLE:
          onChange({ type: mappingType, id: '' })
          break
        case MappingType.RANGE:
          onChange({ type: mappingType, to: '', from: '' })
          break
      }
    },
    [onChange]
  )

  const handleSingleMappingValueChange = useCallback((_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    onChange({ type: MappingType.SINGLE, id: data.value })
  }, [])

  const handleMultipleMappingValueChange = useCallback((_: React.ChangeEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
    const ids =
      data.value
        ?.toString()
        .replaceAll(/[^0-9,\s]/g, '')
        .split(',')
        .map(value => value.trim()) ?? []

    onChange({
      type: MappingType.MULTIPLE,
      ids
    })
  }, [])

  const handleFromMappingValueChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      onChange({ type: MappingType.RANGE, from: data.value, to: mappingValue.split(',')[1] })
    },
    [mappingValue]
  )

  const handleToMappingValueChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      onChange({ type: MappingType.RANGE, from: mappingValue.split(',')[0], to: data.value })
    },
    [mappingValue]
  )

  return (
    <div className={classNames(styles.main, isCompact ? styles.compact : styles.full)}>
      <div>
        <SelectField
          label={isCompact ? undefined : t('mapping_editor.mapping_type_label')}
          onChange={handleMappingTypeChange}
          value={mappingType}
          className={styles.mappingType}
          options={mappingTypeOptions}
        />{' '}
      </div>
      <div className={styles.mappings}>
        {mappingType === MappingType.ANY ? (
          <Field
            label={isCompact ? undefined : t('mapping_editor.mapping_value_label')}
            disabled
            value={t('mapping_editor.mapping_value_any')}
          />
        ) : mappingType === MappingType.SINGLE ? (
          <Field
            label={isCompact ? undefined : t('mapping_editor.mapping_value_label')}
            disabled={disabled}
            type="number"
            value={mappingValue}
            error={!!error}
            message={error}
            placeholder={'1234567890'}
            maxLength={78}
            onChange={handleSingleMappingValueChange}
          />
        ) : mappingType === MappingType.MULTIPLE ? (
          <TextAreaField
            label={t('mapping_editor.mapping_value_label')}
            disabled={disabled}
            info={
              mappingValue.length === 0 && !error
                ? t('mapping_editor.mapping_value_multiple_info')
                : t('mapping_editor.mapping_value_multiple_amount_info', { count: (mapping as MultipleMapping).ids.length })
            }
            error={error}
            placeholder={'1, 2, 3, 4'}
            value={mappingValue}
            onChange={handleMultipleMappingValueChange}
          />
        ) : mappingType === MappingType.RANGE ? (
          <div className={classNames(styles.range, isCompact ? styles.compact : styles.full)}>
            <Field
              label={isCompact ? undefined : t('mapping_editor.mapping_value_from_label')}
              disabled={disabled}
              type="number"
              placeholder={'1'}
              maxLength={78}
              value={mappingValue.split(',')[0]}
              onChange={handleFromMappingValueChange}
            />
            <Field
              label={isCompact ? undefined : t('mapping_editor.mapping_value_to_label')}
              disabled={disabled}
              type="number"
              placeholder={'4000'}
              maxLength={78}
              value={mappingValue.split(',')[1]}
              onChange={handleToMappingValueChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
