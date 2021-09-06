import { ENS } from "modules/ens/types";
import { Land } from "modules/land/types";

export type Props = {
  land: Land
  ens: ENS
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}