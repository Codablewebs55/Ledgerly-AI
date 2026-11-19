import { Canvas, RouteStoryboard } from "tempo-sdk/canvas";

// Stage 4A — Ledgerly app shell at the three review viewports (row 1) and
// its open states (row 2). `?panel=` opens a surface on load (see AppShell).

export default function AppShellCanvas() {
  return (
    <Canvas name="App shell" backgroundColor="#232323">
      <RouteStoryboard
        id="Desktop1440"
        name="Desktop · 1440"
        route="/app"
        layout={{ x: 0, y: 0, width: 1440, height: 900 }}
      />
      <RouteStoryboard
        id="Tablet834"
        name="Tablet · 834"
        route="/app"
        layout={{ x: 1490, y: 0, width: 834, height: 1112 }}
      />
      <RouteStoryboard
        id="Mobile390"
        name="Mobile · 390"
        route="/app"
        layout={{ x: 2374, y: 0, width: 390, height: 844 }}
      />
      <RouteStoryboard
        id="DesktopAssistant"
        name="Desktop · Ledgerly AI open"
        route="/app/invoices?panel=assistant&view=desktop"
        layout={{ x: 0, y: 1262, width: 1440, height: 900 }}
      />
      <RouteStoryboard
        id="TabletDrawer"
        name="Tablet · navigation drawer"
        route="/app/banking?panel=nav"
        layout={{ x: 1490, y: 1262, width: 834, height: 1112 }}
      />
      <RouteStoryboard
        id="MobileDrawer"
        name="Mobile · navigation drawer"
        route="/app?panel=nav"
        layout={{ x: 2374, y: 1262, width: 390, height: 844 }}
      />
      <RouteStoryboard
        id="MobileAssistant"
        name="Mobile · Ledgerly AI open"
        route="/app/invoices?panel=assistant"
        layout={{ x: 2814, y: 1262, width: 390, height: 844 }}
      />
      <RouteStoryboard
        id="MobileSearch"
        name="Mobile · search"
        route="/app?panel=search"
        layout={{ x: 3254, y: 1262, width: 390, height: 844 }}
      />
    </Canvas>
  );
}
