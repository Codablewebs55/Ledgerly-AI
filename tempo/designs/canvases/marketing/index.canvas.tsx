import { Canvas, RouteStoryboard } from "tempo-sdk/canvas";

export default function MarketingCanvas() {
  return (
    <Canvas name="Marketing" backgroundColor="#232323">
      <RouteStoryboard
        id="LandingDesktop"
        name="Landing · 1440"
        route="/"
        layout={{ x: 0, y: 0, width: 1440, height: 10526 }}
      />
      <RouteStoryboard
        id="LandingTablet"
        name="Landing · 834"
        route="/"
        layout={{ x: 1490, y: 0, width: 834, height: 15332 }}
      />
      <RouteStoryboard
        id="LandingMobile"
        name="Landing · 390"
        route="/"
        layout={{ x: 2374, y: 0, width: 390, height: 14783 }}
      />
    </Canvas>
  );
}
