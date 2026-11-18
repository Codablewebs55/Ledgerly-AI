import { Canvas, RouteStoryboard, Storyboard } from "tempo-sdk/canvas";

export default function MarketingCanvas() {
  return (
    <Canvas name="Marketing" backgroundColor="#232323">
      <RouteStoryboard
        id="LandingDesktop"
        name="Landing · 1440"
        route="/"
        layout={{ x: 0, y: 0, width: 1440, height: 10194 }}
      />
      <RouteStoryboard
        id="LandingTablet"
        name="Landing · 834"
        route="/"
        layout={{ x: 1490, y: 0, width: 834, height: 14634 }}
      />
      <RouteStoryboard
        id="LandingMobile"
        name="Landing · 390"
        route="/"
        layout={{ x: 2374, y: 0, width: 390, height: 15002 }}
      />
      <Storyboard
        id="Storyboard2"
        name="Storyboard2"
        component={() => (
          <div className="flex flex-1 flex-col bg-surface-sunken px-6 pt-6 md:px-8 md:pt-8 justify-end" style={{ height: "509px" }}>
            <div className="overflow-hidden border rounded-lg border-line bg-surface rounded-b-none border-b-0">
              <img
                src="/marketing/cashflow.webp"
                width={747}
                height={494}
                alt="Cash flow chart: net cash flow +$65,045, money in $182,285 and money out $117,240 across June to November, with November shown as in progress."
                loading="eager"
                decoding="async"
                className="block w-full"
              />
            </div>
          </div>
        )}
        layout={{ x: 994, y: 14702, width: 801, height: 509 }}
      />
    </Canvas>
  );
}
