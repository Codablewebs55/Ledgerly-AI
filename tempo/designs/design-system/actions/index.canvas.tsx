import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import { ArrowRight, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../../src/ds/actions/Button";
import Boardbuttons from "./BoardButtons";

export default function ActionsCanvas() {
  return (
    <Canvas name="Actions" backgroundColor="#232323">
      <Storyboard
        id="Buttons"
        name="Buttons"
        component={Boardbuttons}
        layout={{ x: 0, y: 0, width: 1200, height: 1830 }}
      />
    </Canvas>
  );
}

defineAsset(Button, {
  libraries: ["Design System"],
  usageInstructions:
    "Every action: submits, confirmations, creates. One `primary` per view; `accent` only for the single key CTA (marketing, accepting an AI suggestion); `secondary`/`ghost` for supporting actions (secondary is outlined in the `line-control` token, sand-200 #e8e3d7 — use `border-line-control` for any custom outline button); `danger` for destructive confirms; `inverse` on dark surfaces. Pass `to` for navigation-styled links. Icon-only needs aria-label. Editable rows (invoice line items) end with ghost icon-only actions pulled together (`-ml-2` on the second button, 16px between icons, icons stay 16px): Duplicate (`Copy`) first, disabled until the row has an entry in any field, then Remove (`Trash2`), disabled while it is the only row; never recolour them.",
  variants: {
    Primary: { props: { icon: Plus, children: "New invoice" } },
    "Primary create sm": { props: { size: "sm", icon: Plus, children: "New invoice" } },
    Secondary: { props: { variant: "secondary", children: "Export CSV" } },
    "Accent CTA": { props: { variant: "accent", size: "lg", icon: ArrowRight, iconPosition: "end", children: "Start free trial" } },
    "Accent action sm": { props: { variant: "accent", size: "sm", icon: ArrowRight, iconPosition: "end", children: "See breakdown" } },
    Ghost: { props: { variant: "ghost", children: "Cancel" } },
    Danger: { props: { variant: "danger", children: "Void invoice" } },
    "Duplicate row (icon)": { props: { variant: "ghost", icon: Copy, "aria-label": "Duplicate line 1" } },
    "Remove row (icon)": { props: { variant: "ghost", icon: Trash2, "aria-label": "Remove line 1" } },
    "Small loading": { props: { size: "sm", loading: true, children: "Saving" } },
  },
});
