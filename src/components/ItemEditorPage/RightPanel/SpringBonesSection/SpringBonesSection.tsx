import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { BodyShape } from '@dcl/schemas'
import { Box, Dropdown, Header } from 'decentraland-ui'
import { Button, Popover, Slider } from 'decentraland-ui2'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { BoneNode, SpringBoneNode, SpringBoneParams } from 'modules/editor/types'
import {
  MAX_SPRING_BONES,
  SPRING_BONE_STIFFNESS_MIN,
  SPRING_BONE_STIFFNESS_MAX,
  SPRING_BONE_GRAVITY_POWER_MIN,
  SPRING_BONE_GRAVITY_POWER_MAX,
  SPRING_BONE_DRAG_MIN,
  SPRING_BONE_DRAG_MAX,
  SPRING_BONE_GRAVITY_DIR_MIN,
  SPRING_BONE_GRAVITY_DIR_MAX
} from 'lib/glbValidation/constants'
import Collapsable from 'components/Collapsable'
import Icon from 'components/Icon'
import CheckIcon from 'icons/check.svg'
import MenuIcon from 'icons/ellipsis.svg'
import { Props } from './SpringBonesSection.types'
import './SpringBonesSection.css'
import { buildSubtreeSizes, sumConfiguredBones } from './utils'

function BoneTreeNode({
  bone,
  boneMap,
  depth,
  expanded,
  onToggle,
  disableType,
  boneSubtreeSizes,
  selected,
  onSelect,
  selectLabel
}: {
  bone: BoneNode
  boneMap: Map<number, BoneNode>
  depth: number
  expanded: Set<number>
  selected?: Set<string>
  disableType?: BoneNode['type']
  boneSubtreeSizes?: Map<string, number>
  selectLabel?: string
  onToggle: (nodeId: number) => void
  onSelect: (bone: BoneNode) => void
}) {
  const hasChildren = bone.children.length > 0
  const isExpanded = expanded.has(bone.nodeId)
  const isSelected = !!selected?.has(bone.name)
  const isDisabled = isSelected || (!!disableType && bone.type === disableType)

  return (
    <>
      <div
        className={classNames('bone-tree-node', { disabled: isDisabled, children: hasChildren })}
        style={{ paddingLeft: depth * 12 }}
        onClick={hasChildren ? () => onToggle(bone.nodeId) : undefined}
      >
        <Icon name="chevron-right" className={classNames('bone-tree-chevron', { expanded: isExpanded, hidden: !hasChildren })} />
        {bone.type === 'spring' && <span className="bone-icon" />}
        <span className="bone-tree-name" title={bone.name}>
          {bone.name}
          {bone.type === 'spring' && boneSubtreeSizes && (boneSubtreeSizes.get(bone.name) ?? 0) > 1 && (
            <span className="children-count">({boneSubtreeSizes.get(bone.name)})</span>
          )}
        </span>
        {isSelected && <img src={CheckIcon} className="bone-tree-checkmark" alt="Already added" />}
        {!isDisabled && (
          <Button
            size="small"
            className="bone-tree-select-button"
            onClick={e => {
              e.stopPropagation()
              onSelect(bone)
            }}
          >
            {selectLabel || t('item_editor.right_panel.spring_bones.actions.select')}
          </Button>
        )}
      </div>
      {hasChildren &&
        isExpanded &&
        bone.children.map(childId => {
          const child = boneMap.get(childId)
          if (!child) return null
          return (
            <BoneTreeNode
              key={childId}
              bone={child}
              boneMap={boneMap}
              depth={depth + 1}
              expanded={expanded}
              selected={selected}
              selectLabel={selectLabel}
              boneSubtreeSizes={boneSubtreeSizes}
              disableType={disableType}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          )
        })}
    </>
  )
}

function BoneHierarchyPicker({
  open,
  bones,
  selected,
  disableType,
  anchorEl,
  boneSubtreeSizes,
  selectLabel,
  onSelect,
  onClose
}: {
  open: boolean
  bones: BoneNode[]
  selected?: Set<string>
  disableType?: BoneNode['type']
  anchorEl: HTMLElement | null
  boneSubtreeSizes?: Map<string, number>
  selectLabel?: string
  onSelect: (bone: BoneNode) => void
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(bones.map(b => b.nodeId))) // Start with all expanded

  const { boneMap, roots } = useMemo(() => {
    const boneMap = new Map<number, BoneNode>()
    const childIds = new Set<number>()
    for (const bone of bones) {
      boneMap.set(bone.nodeId, bone)
      for (const childId of bone.children) {
        childIds.add(childId)
      }
    }
    const roots = bones.filter(b => !childIds.has(b.nodeId))
    return { boneMap, roots }
  }, [bones])

  const handleToggle = useCallback((nodeId: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId)
      return next
    })
  }, [])

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      classes={{ paper: 'bone-hierarchy-picker' }}
    >
      {roots.map(root => (
        <BoneTreeNode
          key={root.nodeId}
          bone={root}
          boneMap={boneMap}
          depth={0}
          expanded={expanded}
          onToggle={handleToggle}
          boneSubtreeSizes={boneSubtreeSizes}
          selected={selected}
          selectLabel={selectLabel}
          disableType={disableType}
          onSelect={onSelect}
        />
      ))}
    </Popover>
  )
}

function BonesCounter({ count, limit }: { count: number; limit?: number }) {
  return (
    <span className="spring-bones-counter">
      <span className="bone-icon" />
      {count}
      {limit !== undefined && `/${limit}`}
    </span>
  )
}

function InputNumber({ max, min, value, onChange }: { max?: number; min?: number; value: number; onChange: (value: number) => void }) {
  const [localValue, setLocalValue] = useState(`${value}`)

  useEffect(() => {
    setLocalValue(`${value}`)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '' || /^-?\d*[.,]?\d*$/.test(raw)) {
      setLocalValue(raw)
    }
  }

  const handleBlur = () => {
    let v = parseFloat((localValue || '0').replace(',', '.'))
    if (!isNaN(v)) {
      if (max !== undefined) v = Math.min(max, v)
      if (min !== undefined) v = Math.max(min, v)
      onChange(v)
      setLocalValue(`${v}`)
    } else {
      setLocalValue(`${value}`)
    }
  }

  return (
    <input type="text" inputMode="decimal" value={localValue} onChange={handleChange} onBlur={handleBlur} className="spring-bones-number" />
  )
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  const handleSliderChange = (_: Event, newValue: number | number[]) => onChange(newValue as number)

  return (
    <div className="spring-bones-slider-row">
      <span className="spring-bones-label">{label}</span>
      <Slider size="small" min={min} max={max} step={step} value={value} onChange={handleSliderChange} />
      <InputNumber min={min} max={max} value={value} onChange={onChange} />
    </div>
  )
}

function Vec3Input({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string
  value: [number, number, number]
  min?: number
  max?: number
  onChange: (value: [number, number, number]) => void
}) {
  const handleAxis = (index: number) => (v: number) => {
    if (!isNaN(v)) {
      const next: [number, number, number] = [...value]
      next[index] = v
      onChange(next)
    }
  }

  return (
    <div className="spring-bones-vec3-row">
      <span className="spring-bones-label">{label}</span>
      <div className="spring-bones-vec3-inputs">
        <label>
          X<InputNumber min={min} max={max} value={value[0]} onChange={handleAxis(0)} />
        </label>
        <label>
          Y<InputNumber min={min} max={max} value={value[1]} onChange={handleAxis(1)} />
        </label>
        <label>
          Z<InputNumber min={min} max={max} value={value[2]} onChange={handleAxis(2)} />
        </label>
      </div>
    </div>
  )
}

function CenterDropdown({
  label,
  value,
  bones,
  onChange
}: {
  label: string
  value: string | undefined
  bones: BoneNode[]
  onChange: (value: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const pickerAnchorRef = useRef<HTMLSpanElement>(null)
  const selectedBone = useMemo(() => bones.find(b => b.name === value), [bones, value])

  const handleCenterChange = (bone: BoneNode) => {
    onChange(bone.name)
    setOpen(false)
  }

  return (
    <div className="spring-bones-center-row">
      <span className="spring-bones-label">{label}</span>
      <span
        className={classNames('spring-bones-center-value', { empty: !selectedBone })}
        onClick={() => setOpen(!open)}
        ref={pickerAnchorRef}
      >
        {selectedBone ? selectedBone.name : t('item_editor.right_panel.spring_bones.center_none')}
      </span>
      {selectedBone ? (
        <Icon name="close" className="spring-bones-center-clear" onClick={() => onChange(undefined)} />
      ) : (
        <Icon name="arrow-down" className={classNames('spring-bones-center-arrow', { open })} onClick={() => setOpen(!open)} />
      )}
      <BoneHierarchyPicker
        open={open}
        bones={bones}
        anchorEl={pickerAnchorRef.current}
        disableType="spring"
        selected={value !== undefined ? new Set([value]) : undefined}
        onSelect={handleCenterChange}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

function SpringBoneCard({
  nodeName,
  params,
  boneCount,
  allBones,
  onParamChange,
  onDelete,
  onCopy,
  onPaste
}: {
  nodeName: string
  params: SpringBoneParams
  boneCount: number
  allBones: BoneNode[]
  onParamChange: (field: keyof SpringBoneParams, value: SpringBoneParams[typeof field]) => void
  onDelete: () => void
  onCopy: () => void
  onPaste: (() => void) | null
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Box
      className={classNames('spring-bone-card', { expanded: isExpanded })}
      header={
        <Header className="spring-bone-card-header" onClick={() => setIsExpanded(prev => !prev)}>
          <Icon name="chevron-right" className="spring-bone-chevron" />
          <h6 className="spring-bone-name">{nodeName}</h6>
          <BonesCounter count={boneCount} />

          <Dropdown trigger={<img src={MenuIcon} className="spring-bone-card-menu" alt="Actions" />} inline direction="left">
            <Dropdown.Menu>
              <Dropdown.Item text={t('item_editor.right_panel.spring_bones.actions.copy_params')} onClick={onCopy} />
              <Dropdown.Item
                text={t('item_editor.right_panel.spring_bones.actions.paste_params')}
                onClick={onPaste || (() => {})}
                disabled={!onPaste}
              />
              <Dropdown.Item text={t('item_editor.right_panel.spring_bones.actions.remove_bone')} onClick={onDelete} />
            </Dropdown.Menu>
          </Dropdown>
        </Header>
      }
    >
      {isExpanded && (
        <div className="spring-bone-card-children">
          <SliderInput
            label={t('item_editor.right_panel.spring_bones.stiffness')}
            value={params.stiffness}
            min={SPRING_BONE_STIFFNESS_MIN}
            max={SPRING_BONE_STIFFNESS_MAX}
            step={0.01}
            onChange={v => onParamChange('stiffness', v)}
          />
          <SliderInput
            label={t('item_editor.right_panel.spring_bones.gravity_power')}
            value={params.gravityPower}
            min={SPRING_BONE_GRAVITY_POWER_MIN}
            max={SPRING_BONE_GRAVITY_POWER_MAX}
            step={0.01}
            onChange={v => onParamChange('gravityPower', v)}
          />
          <Vec3Input
            label={t('item_editor.right_panel.spring_bones.gravity_dir')}
            value={params.gravityDir}
            min={SPRING_BONE_GRAVITY_DIR_MIN}
            max={SPRING_BONE_GRAVITY_DIR_MAX}
            onChange={v => onParamChange('gravityDir', v)}
          />
          <SliderInput
            label={t('item_editor.right_panel.spring_bones.drag_force')}
            value={params.drag}
            min={SPRING_BONE_DRAG_MIN}
            max={SPRING_BONE_DRAG_MAX}
            step={0.01}
            onChange={v => onParamChange('drag', v)}
          />
          <CenterDropdown
            label={t('item_editor.right_panel.spring_bones.center')}
            value={params.center}
            bones={allBones}
            onChange={v => onParamChange('center', v)}
          />
        </div>
      )}
    </Box>
  )
}

export default function SpringBonesSection({
  bones,
  springBoneParams,
  onParamChange,
  onAddSpringBoneParams,
  onDeleteSpringBoneParams,
  hasSpringBonesInGlb,
  hasTwoRepresentations = false,
  activeBodyShape,
  springBoneParamsByShape,
  bonesByShape,
  onBodyShapeTabChange
}: Props) {
  const [copiedParams, setCopiedParams] = useState<SpringBoneParams | null>(null)
  const [showBonePicker, setShowBonePicker] = useState(false)
  const pickerAnchorRef = useRef<HTMLButtonElement>(null)
  const springBones: SpringBoneNode[] = useMemo(() => bones.filter(b => b.type === 'spring'), [bones])
  const selectedSpringBoneNames: Set<string> = useMemo(() => new Set(Object.keys(springBoneParams)), [springBoneParams])
  const boneSubtreeSizes: Map<string, number> = useMemo(() => buildSubtreeSizes(bones), [bones])
  const configuredBonesCount = useMemo(() => sumConfiguredBones(boneSubtreeSizes, springBoneParams), [springBoneParams, boneSubtreeSizes])

  /** Precomputed subtree-aware configured bone counts per body shape (used for tab badges) */
  const configuredBonesCountByShape: Map<BodyShape, number> = useMemo(() => {
    if (!hasTwoRepresentations) return new Map() // Only compute if we have multiple representations, otherwise it's not going to be shown and we can save the computation
    const result = new Map<BodyShape, number>()
    for (const shape of [BodyShape.MALE, BodyShape.FEMALE]) {
      const shapeParams = springBoneParamsByShape?.[shape]
      const shapeBones = bonesByShape?.[shape]
      if (!shapeParams || !shapeBones) {
        result.set(shape, 0)
        continue
      }
      result.set(shape, sumConfiguredBones(buildSubtreeSizes(shapeBones), shapeParams))
    }
    return result
  }, [springBoneParamsByShape, bonesByShape])

  /** Sort spring bone params by hierarchy */
  const sortedSpringBoneParams: [string, SpringBoneParams][] = useMemo(() => {
    const dfsOrder = new Map<string, number>()
    const boneMap = new Map(bones.map(bone => [bone.nodeId, bone]))
    const childIds = new Set(bones.flatMap(bone => bone.children))
    let order = 0
    const recursiveVisit = (id: number) => {
      const bone = boneMap.get(id)
      if (!bone) return
      dfsOrder.set(bone.name, order++)
      bone.children.forEach(recursiveVisit)
    }
    bones.filter(bone => !childIds.has(bone.nodeId)).forEach(bone => recursiveVisit(bone.nodeId))
    return Object.entries(springBoneParams).sort(([a], [b]) => (dfsOrder.get(a) ?? 0) - (dfsOrder.get(b) ?? 0))
  }, [springBoneParams, bones])

  const canAddMore = sortedSpringBoneParams.length < springBones.length && configuredBonesCount < MAX_SPRING_BONES

  const handleSelectBone = useCallback(
    (bone: BoneNode) => {
      onAddSpringBoneParams(bone.name)
      setShowBonePicker(false)
    },
    [onAddSpringBoneParams]
  )

  const handlePasteParams = useCallback(
    (nodeName: string) => {
      if (!copiedParams) return
      for (const field of Object.keys(copiedParams) as (keyof SpringBoneParams)[]) {
        onParamChange(nodeName, field, copiedParams[field])
      }
    },
    [copiedParams, onParamChange]
  )

  if (!hasSpringBonesInGlb) return null

  return (
    <Collapsable
      label={
        <div className="spring-bones-header-label">
          {t('item_editor.right_panel.spring_bones.title')}
          {!hasTwoRepresentations && <BonesCounter count={configuredBonesCount} limit={MAX_SPRING_BONES} />}
        </div>
      }
    >
      {hasTwoRepresentations && activeBodyShape && onBodyShapeTabChange && (
        <div className="spring-bones-body-shape-tabs">
          <span className="spring-bones-body-shape-label">{t('item_editor.right_panel.spring_bones.body_shape')}</span>
          {[BodyShape.MALE, BodyShape.FEMALE].map(shape => {
            const shapeBonesCount = configuredBonesCountByShape.get(shape) ?? 0
            const isActive = shape === activeBodyShape
            return (
              <button
                key={shape}
                className={classNames('spring-bones-tab', { active: isActive })}
                onClick={() => !isActive && onBodyShapeTabChange(shape)}
              >
                {shape === BodyShape.MALE
                  ? t('item_editor.right_panel.spring_bones.tab_male')
                  : t('item_editor.right_panel.spring_bones.tab_female')}
                <BonesCounter count={shapeBonesCount} limit={MAX_SPRING_BONES} />
              </button>
            )
          })}
        </div>
      )}
      <div className="spring-bones-section">
        {sortedSpringBoneParams.map(([nodeName, params]) => (
          <SpringBoneCard
            key={nodeName}
            nodeName={nodeName}
            params={params}
            boneCount={boneSubtreeSizes.get(nodeName) ?? 1}
            allBones={bones}
            onParamChange={(field, value) => onParamChange(nodeName, field, value)}
            onDelete={() => onDeleteSpringBoneParams(nodeName)}
            onCopy={() => setCopiedParams({ ...params })}
            onPaste={copiedParams ? () => handlePasteParams(nodeName) : null}
          />
        ))}
        {canAddMore && (
          <div className="spring-bone-add-box">
            <Button
              className="spring-bone-add-button"
              color="secondary"
              startIcon={<Icon name="add" />}
              onClick={() => setShowBonePicker(prev => !prev)}
              ref={pickerAnchorRef}
            >
              {t('item_editor.right_panel.spring_bones.actions.add_bone')}
            </Button>
            <BoneHierarchyPicker
              open={showBonePicker}
              bones={bones}
              anchorEl={pickerAnchorRef.current}
              selected={selectedSpringBoneNames}
              disableType="avatar"
              selectLabel={t('item_editor.right_panel.spring_bones.actions.add')}
              boneSubtreeSizes={boneSubtreeSizes}
              onSelect={handleSelectBone}
              onClose={() => setShowBonePicker(false)}
            />
          </div>
        )}
      </div>
    </Collapsable>
  )
}
