import { Canvas, RouteStoryboard, Storyboard } from "tempo-sdk/canvas";

export default function MarketingCanvas() {
  return (
    <Canvas name="Marketing" backgroundColor="#232323">
      <RouteStoryboard
        id="LandingDesktop"
        name="Landing · 1440"
        route="/"
        layout={{ x: 0, y: 0, width: 1440, height: 10156 }}
      />
      <RouteStoryboard
        id="LandingTablet"
        name="Landing · 834"
        route="/"
        layout={{ x: 1490, y: 0, width: 834, height: 14422 }}
      />
      <RouteStoryboard
        id="LandingMobile"
        name="Landing · 390"
        route="/"
        layout={{ x: 2374, y: 0, width: 390, height: 14548 }}
      />
      <Storyboard
        id="Storyboard6"
        name="Storyboard6"
        component={() => (
          <div style={{ position: "absolute", width: "641px", height: "488px", inset: "0px auto auto 0px" }} />
        )}
        layout={{ x: -1061, y: 4919, width: 641, height: 488 }}
      />
    </Canvas>
  );
}
