import { WearableCategory } from '@dcl/schemas'

type ThreeModules = typeof import('three')

/**
 * Avatar skeleton landmark body-part tokens used to locate body regions.
 *
 * Decentraland base avatars rig their bones with an `Avatar_` prefix and a side
 * segment, e.g. `Avatar_Head`, `Avatar_Spine`, `Avatar_LeftUpLeg`, `Avatar_RightFoot`,
 * `Avatar_LeftHandIndex1`. Before matching we strip the `avatar_` prefix and any
 * leading `left`/`right` side segment (see {@link normalizeBoneName}), so the tokens
 * below match the body part regardless of side and minor exporter variations.
 *
 * Order within each region does not matter, but region precedence does — see the
 * `order` array in {@link classifyBone}: more specific regions (feet, hands) are
 * tested before broader ones (legs, spine) so a foot/toe bone is never absorbed by legs.
 */
const LANDMARK_BONES = {
  head: ['head', 'neck'],
  spine: ['spine', 'chest', 'shoulder', 'arm'],
  legs: ['upleg', 'leg', 'knee'],
  feet: ['foot', 'toebase', 'toe'],
  hands: ['hand', 'finger', 'thumb']
}

/** The avatar region a piece of geometry is dominantly attached to. */
type AvatarRegion = keyof typeof LANDMARK_BONES

/**
 * Minimum share of total skin weight a single region must own for the suggestion
 * to be considered unambiguous. Below this the geometry spans multiple regions
 * (e.g. a full-body skin) and we return `null` so the creator picks manually.
 */
const DOMINANT_REGION_THRESHOLD = 0.6

/** Maps a winning avatar region to the default wearable category we suggest for it. */
const REGION_TO_CATEGORY: Record<AvatarRegion, WearableCategory> = {
  // Default head category is `hat`. We deliberately do NOT over-fit to helmet/top_head/hair:
  // those are visually distinct sub-types the creator should confirm.
  head: WearableCategory.HAT,
  spine: WearableCategory.UPPER_BODY,
  legs: WearableCategory.LOWER_BODY,
  feet: WearableCategory.FEET,
  hands: WearableCategory.HANDS_WEAR
}

/**
 * Lowercases the bone name and strips the `avatar_` prefix plus a leading
 * `left`/`right` side segment so body-part tokens can be matched directly.
 * e.g. `Avatar_LeftUpLeg` → `upleg`, `Avatar_RightToeBase` → `toebase`, `Avatar_Head` → `head`.
 */
function normalizeBoneName(boneName: string): string {
  return boneName
    .toLowerCase()
    .replace(/^avatar[_-]?/, '')
    .replace(/^(left|right)[_-]?/, '')
}

/** Returns the region whose landmark tokens match the given bone name, or null. */
function classifyBone(boneName: string): AvatarRegion | null {
  const name = normalizeBoneName(boneName)
  // Feet and hands are checked before legs and spine because a foot/toe or hand/finger
  // bone must never be absorbed by the broader leg ("upleg" contains "leg") or arm regions.
  const order: AvatarRegion[] = ['feet', 'hands', 'head', 'legs', 'spine']
  for (const region of order) {
    if (LANDMARK_BONES[region].some(pattern => name.includes(pattern))) {
      return region
    }
  }
  return null
}

/**
 * Accumulates, per region, the total skin weight bound to bones of that region.
 *
 * For every skinned mesh we read the `skinIndex` (which bone each vertex is bound to)
 * and `skinWeight` (how strongly) attributes. Each vertex has up to 4 influences.
 * We resolve the influencing bone via the mesh skeleton and add the weight to its region.
 */
function accumulateRegionWeights(Three: ThreeModules, scene: THREE.Scene): Record<AvatarRegion, number> {
  const weights: Record<AvatarRegion, number> = { head: 0, spine: 0, legs: 0, feet: 0, hands: 0 }

  scene.traverse((node: THREE.Object3D) => {
    if (!(node instanceof Three.SkinnedMesh) || !node.skeleton) {
      return
    }

    const bones = node.skeleton.bones
    const geometry = node.geometry as THREE.BufferGeometry
    const skinIndex = geometry.getAttribute('skinIndex')
    const skinWeight = geometry.getAttribute('skinWeight')
    if (!skinIndex || !skinWeight) {
      return
    }

    // Pre-classify each bone once so the per-vertex loop stays cheap.
    const boneRegions = bones.map(bone => classifyBone(bone.name))

    // Skin attributes are Vector4 (up to 4 bone influences per vertex). We read each
    // of the 4 components via getX/getY/getZ/getW, capped by the attribute's itemSize.
    const indexAccessors = [skinIndex.getX, skinIndex.getY, skinIndex.getZ, skinIndex.getW]
    const weightAccessors = [skinWeight.getX, skinWeight.getY, skinWeight.getZ, skinWeight.getW]

    const vertexCount = skinIndex.count
    const componentsPerVertex = Math.min(skinIndex.itemSize, 4)
    for (let v = 0; v < vertexCount; v++) {
      for (let c = 0; c < componentsPerVertex; c++) {
        const boneIdx = indexAccessors[c].call(skinIndex, v)
        const weight = weightAccessors[c].call(skinWeight, v)
        if (weight <= 0) {
          continue
        }
        const region = boneRegions[boneIdx]
        if (region) {
          weights[region] += weight
        }
      }
    }
  })

  return weights
}

/**
 * Suggests the most likely wearable category for a model based on the body region
 * its geometry is dominantly skinned to.
 *
 * The heuristic, in plain terms:
 *   - Walk the skinned meshes and tally how much skin weight is bound to each avatar
 *     region (head, spine/arms, legs, feet, hands).
 *   - If one region owns at least {@link DOMINANT_REGION_THRESHOLD} of all classified
 *     weight, suggest that region's default category.
 *   - Otherwise return `null` (ambiguous / multi-region geometry — let the creator pick).
 *
 * Region → category mapping (intentionally conservative):
 *   - head (Avatar_Head / Avatar_Neck and above) → `hat` (default head category)
 *   - spine/arms (Avatar_Spine* / Avatar_Arm) → `upper_body`
 *   - legs (Avatar_*UpLeg / Avatar_*Leg) → `lower_body`
 *   - feet (Avatar_*Foot / Avatar_*ToeBase) → `feet`
 *   - hands (Avatar_*Hand / fingers) → `hands_wear`
 *
 * Returns `null` (rather than guessing) when there are no skinned meshes, no usable
 * skin data, or no clearly dominant region.
 *
 * @param Three - The Three.js module (passed in to support `instanceof` against the same realm).
 * @param scene - The parsed GLTF scene.
 */
export function suggestWearableCategory(Three: ThreeModules, scene: THREE.Scene): WearableCategory | null {
  const weights = accumulateRegionWeights(Three, scene)

  const total = Object.values(weights).reduce((sum, w) => sum + w, 0)
  if (total <= 0) {
    return null
  }

  let bestRegion: AvatarRegion | null = null
  let bestWeight = 0
  for (const region of Object.keys(weights) as AvatarRegion[]) {
    if (weights[region] > bestWeight) {
      bestWeight = weights[region]
      bestRegion = region
    }
  }

  if (!bestRegion || bestWeight / total < DOMINANT_REGION_THRESHOLD) {
    return null
  }

  return REGION_TO_CATEGORY[bestRegion]
}
