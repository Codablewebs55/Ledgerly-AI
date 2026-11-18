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
        id="Storyboard5"
        name="Storyboard5"
        component={() => (
          <div style={{ position: "relative", width: "641px", height: "591px" }}>
            <img
              src="/marketing/assistant-panel.webp"
              width={416}
              height={900}
              alt="The Ledgerly AI panel's chat input, asking you to ask about your books, with a note that Ledgerly AI can make mistakes."
              loading="eager"
              decoding="async"
              className="block w-full h-full object-cover object-bottom"
              style={{ height: "1403px", position: "absolute", inset: "0px auto auto 0px", width: "641px", boxSizing: "border-box", margin: "0px" }}
            />
          </div>
        )}
        layout={{ x: -822, y: 4279, width: 641, height: 591 }}
      />
    </Canvas>
  );
}
