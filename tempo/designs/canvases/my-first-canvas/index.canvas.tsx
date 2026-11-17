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
      <RouteStoryboard
        id="FoundationsTablet"
        name="Brand foundations · Tablet 834"
        route="/design-system/foundations"
        layout={{ x: 1540, y: 0, width: 834, height: 1194 }}
      />
      <RouteStoryboard
        id="FoundationsMobile"
        name="Brand foundations · Mobile 390"
        route="/design-system/foundations"
        layout={{ x: 2474, y: 0, width: 390, height: 844 }}
      />
    </Canvas>
  );
}
