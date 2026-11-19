import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import Boardfoundations from "./BoardFoundations";

export default function FoundationsCanvas() {
  return (
    <Canvas name="brand foundations" backgroundColor="#232323">
      <Storyboard
        id="Foundations"
        name="Foundations"
        component={Boardfoundations}
        layout={{ x: 0, y: 0, width: 1280, height: 7795 }}
      />
    </Canvas>
  );
}

defineAsset(FoundationsCanvas, {
  libraries: ["Design System"],
  usageInstructions:
    "Ledgerly foundations: colour primitives → semantic tokens, contrast audit, type scale, spacing, radius, elevation, motion and the prepared dark theme. Check here before styling anything; components use semantic utilities only (bg-brand, text-fg-muted, border-line…).",
});
