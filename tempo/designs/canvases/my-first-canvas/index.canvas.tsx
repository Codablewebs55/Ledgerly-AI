import { Canvas, RouteStoryboard } from "tempo-sdk/canvas";

export default function GenerationCanvas() {
  return (
    <Canvas name="My first canvas">
      <RouteStoryboard
        id="FoundationsDesktop"
        name="Brand foundations · Desktop 1440"
        route="/design-system/foundations"
        layout={{ x: 0, y: 0, width: 1440, height: 8080 }}
      />
    </Canvas>
  );
}
