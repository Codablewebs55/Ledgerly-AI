import { Canvas, Storyboard } from "tempo-sdk/canvas";
import Landingdesktop from "./LandingDesktop";
import Landingtablet from "./LandingTablet";
import Landingmobile from "./LandingMobile";

export default function MarketingReviewCanvas() {
  return (
    <Canvas name="Marketing Review" backgroundColor="#232323">
      <Storyboard
        id="LandingDesktop"
        name="Landing · 1440"
        component={Landingdesktop}
        layout={{ x: 0, y: 0, width: 1440, height: 10514, intrinsicSizing: "root-element" }}
      />
      <Storyboard
        id="LandingTablet"
        name="Landing · 834"
        component={Landingtablet}
        layout={{ x: 1490, y: 0, width: 834, height: 15332, intrinsicSizing: "root-element" }}
      />
      <Storyboard
        id="LandingMobile"
        name="Landing · 390"
        component={Landingmobile}
        layout={{ x: 2374, y: 0, width: 390, height: 14781, intrinsicSizing: "root-element" }}
      />
    </Canvas>
  );
}
