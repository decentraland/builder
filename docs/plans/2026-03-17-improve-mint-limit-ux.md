# Plan: Improve UX when minting more than 50 NFTs

**Issue**: https://github.com/decentraland/builder/issues/3365

## Problem Statement

Currently, when a user tries to mint more than 50 NFTs in a single transaction, the `MAX_NFTS_PER_MINT` limit (50) silently blocks the action without showing a clear alert or warning until they click "Next". This creates a poor user experience because:

1. Users don't know there's a limit until they attempt to proceed
2. The error appears at the bottom of the form after clicking "Next", which is easy to miss
3. There's no real-time feedback about how many NFTs they're trying to mint vs the limit

## Root Cause

The validation in `MintItemsModal.tsx` only runs when `handleMintItems` is called (when the user clicks "Next" button):

```typescript
if (total > MAX_NFTS_PER_MINT) {
  this.setState({ error: t('mint_items_modal.limit_reached', { max: MAX_NFTS_PER_MINT }) })
  return
}
```

The component already calculates `totalMints` in the render method but doesn't use it for proactive validation.

## Solution

Improve the UX by adding proactive, real-time feedback about the mint limit:

### Changes Required

1. **Add a visible counter/warning banner** in the MINT view (before confirmation)
   - Show: "X / 50 NFTs to mint" 
   - Style it as a warning/error when approaching or exceeding the limit
   - Position it prominently above the items list

2. **Disable the "Next" button** when the limit is exceeded
   - Prevent users from even attempting to proceed if `totalMints > MAX_NFTS_PER_MINT`
   - Keep the existing error message as a fallback

3. **Add color coding** to the counter
   - Normal: when totalMints <= MAX_NFTS_PER_MINT
   - Warning/Danger: when totalMints > MAX_NFTS_PER_MINT

### Implementation Details

**File: `src/components/Modals/MintItemsModal/MintItemsModal.tsx`**

Changes needed in the render method, within the `confirm === View.MINT` section:

1. The `totalMints` variable is already calculated in render — we'll use it
2. Add a new info/warning section that displays:
   - The current total vs the limit
   - A clear message when the limit is exceeded
3. Update the "Next" button disabled condition to include `totalMints > MAX_NFTS_PER_MINT`

**File: `src/components/Modals/MintItemsModal/MintItemsModal.css`**

Add styles for:
- `.mint-counter` — container for the counter display
- `.mint-counter.warning` — danger/warning styling when limit exceeded
- `.mint-counter .count` — styling for the count text

**Translation key** (may already exist):
- Check if `mint_items_modal.limit_reached` exists in translations
- Check if we need to add a new key for the counter display like `mint_items_modal.nft_count`

## Files to Modify

1. `src/components/Modals/MintItemsModal/MintItemsModal.tsx` — Add counter UI, update button disabled logic
2. `src/components/Modals/MintItemsModal/MintItemsModal.css` — Add styles for counter/warning

## Files to Review (no changes needed)

- `src/modules/item/utils.ts` — Constant is correctly defined, no changes needed

## Testing Plan

1. **Manual testing**:
   - Open the Mint Items modal with mintable items
   - Add multiple items and adjust amounts
   - Verify the counter updates in real-time
   - Verify the counter turns red/shows warning when > 50
   - Verify the "Next" button is disabled when > 50
   - Verify the counter shows correctly when <= 50
   - Verify the existing error message still appears if somehow bypassed

2. **Edge cases**:
   - 0 NFTs (should show 0/50, button disabled for different reason)
   - Exactly 50 NFTs (should be allowed)
   - 51+ NFTs (should show warning, button disabled)
   - Removing items to go back under 50 (should clear warning, enable button)

## Success Criteria

- Users can see in real-time how many NFTs they're attempting to mint
- Users see a clear warning when they exceed the 50 NFT limit
- Users cannot proceed past the MINT view when the limit is exceeded
- The UI clearly communicates why they cannot proceed
