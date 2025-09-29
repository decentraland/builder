import { ArmatureId } from '@dcl/schemas'
import { autocompleteEmoteData } from './utils'

describe('autocompleteEmoteData', () => {
  describe('when processing animations with _Start suffix', () => {
    it('should create startAnimation for animations ending with _Start', () => {
      const animations = ['HighFive_Start', 'Wave_Prop_Start']

      const result = autocompleteEmoteData(animations)

      expect(result.startAnimation).toBeDefined()
      expect(result.startAnimation?.[ArmatureId.Armature]).toEqual({
        animation: 'HighFive_Start',
        loop: true
      })
    })

    it('should handle prop start animations', () => {
      const animations = ['HighFive_Prop_Start']

      const result = autocompleteEmoteData(animations)

      expect(result.startAnimation).toBeDefined()
      expect(result.startAnimation?.[ArmatureId.Armature_Prop]).toEqual({
        animation: 'HighFive_Prop_Start',
        loop: true
      })
    })
  })

  describe('when processing animations without _Start suffix', () => {
    it('should create outcomes for non-start animations', () => {
      const animations = ['HighFive_Avatar', 'Wave_Avatar']

      const result = autocompleteEmoteData(animations)

      expect(result.outcomes).toBeDefined()
      expect(result.outcomes).toHaveLength(2)
      expect(result.outcomes?.[0]).toEqual({
        title: 'High Five',
        clips: {
          Armature: {
            animation: 'HighFive_Avatar',
            loop: true
          }
        }
      })
      expect(result.outcomes?.[1]).toEqual({
        title: 'Wave',
        clips: {
          [ArmatureId.Armature]: {
            animation: 'Wave_Avatar',
            loop: true
          }
        }
      })
    })

    it('should handle AvatarOther animations', () => {
      const animations = ['HighFive_AvatarOther']

      const result = autocompleteEmoteData(animations)

      expect(result.outcomes).toBeDefined()
      expect(result.outcomes?.[0]).toEqual({
        title: 'High Five',
        clips: {
          [ArmatureId.Armature_Other]: {
            animation: 'HighFive_AvatarOther',
            loop: true
          }
        }
      })
    })

    it('should handle Prop animations', () => {
      const animations = ['HighFive_Prop']

      const result = autocompleteEmoteData(animations)

      expect(result.outcomes).toBeDefined()
      expect(result.outcomes?.[0]).toEqual({
        title: 'High Five',
        clips: {
          [ArmatureId.Armature_Prop]: {
            animation: 'HighFive_Prop',
            loop: true
          }
        }
      })
    })
  })

  describe('when processing mixed animations', () => {
    it('should handle both start animations and outcomes', () => {
      const animations = ['HighFive_Start', 'HighFive_Avatar', 'HighFive_Prop', 'Wave_Prop_Start', 'Wave_Avatar']

      const result = autocompleteEmoteData(animations)

      expect(result.startAnimation).toBeDefined()
      expect(result.startAnimation?.[ArmatureId.Armature]).toEqual({
        animation: 'HighFive_Start',
        loop: true
      })

      expect(result.startAnimation?.[ArmatureId.Armature_Prop]).toEqual({
        animation: 'Wave_Prop_Start',
        loop: true
      })

      expect(result.outcomes).toBeDefined()
      expect(result.outcomes).toHaveLength(2)

      // HighFive group
      const highFiveOutcome = result.outcomes?.find(o => o.title === 'High Five')
      expect(highFiveOutcome).toBeDefined()
      expect(highFiveOutcome?.clips).toEqual({
        [ArmatureId.Armature]: {
          animation: 'HighFive_Avatar',
          loop: true
        },
        [ArmatureId.Armature_Prop]: {
          animation: 'HighFive_Prop',
          loop: true
        }
      })

      // Wave group
      const waveOutcome = result.outcomes?.find(o => o.title === 'Wave')
      expect(waveOutcome).toBeDefined()
      expect(waveOutcome?.clips).toEqual({
        [ArmatureId.Armature]: {
          animation: 'Wave_Avatar',
          loop: true
        }
      })
    })
  })

  describe('when processing animations with complex names', () => {
    it('should format camelCase names correctly', () => {
      const animations = ['SuperJump_Avatar', 'CamelCaseTest_Avatar']

      const result = autocompleteEmoteData(animations)

      expect(result.outcomes).toBeDefined()
      expect(result.outcomes?.[0].title).toBe('Super Jump')
      expect(result.outcomes?.[1].title).toBe('Camel Case Test')
    })
  })

  describe('when processing empty or invalid animations', () => {
    it('should handle empty array', () => {
      const result = autocompleteEmoteData([])

      expect(result.startAnimation).toBeUndefined()
      expect(result.outcomes).toBeUndefined()
    })

    it('should handle animations without recognized suffixes', () => {
      const animations = ['UnknownAnimation', 'AnotherUnknown']

      const result = autocompleteEmoteData(animations)

      expect(result.outcomes).toBeDefined()
      expect(result.outcomes?.[0].clips[ArmatureId.Armature]).toBeDefined() // Default to Armature
    })
  })
})
