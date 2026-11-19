import { Canvas, RouteStoryboard } from "tempo-sdk/canvas";

// Stage 4B — dashboard, invoice list and create invoice. Row 1: desktop at
// full page height; row 2: the same screens on a phone.

export default function CoreScreensCanvas() {
  return (
    <Canvas name="Core screens" backgroundColor="#232323">
      <RouteStoryboard
        id="DashboardDesktop"
        name="Overview · 1440"
        route="/app"
        layout={{ x: -2799, y: 0, width: 1440, height: 1480 }}
      />
      <RouteStoryboard
        id="InvoicesDesktop"
        name="Invoices · 1440"
        route="/app/invoices"
        layout={{ x: -147, y: 0, width: 1440, height: 952 }}
      />
      <RouteStoryboard
        id="CreateInvoiceDesktop"
        name="Create invoice · 1440"
        route="/app/invoices/new"
        layout={{ x: 2505, y: 0, width: 1440, height: 1000 }}
      />
      <RouteStoryboard
        id="DashboardMobile"
        name="Overview · 390"
        route="/app"
        layout={{ x: -3271, y: 0, width: 390, height: 3300 }}
      />
      <RouteStoryboard
        id="InvoicesMobile"
        name="Invoices · 390"
        route="/app/invoices"
        layout={{ x: -619, y: 0, width: 390, height: 1295 }}
      />
      <RouteStoryboard
        id="CreateInvoiceMobile"
        name="Create invoice · 390"
        route="/app/invoices/new"
        layout={{ x: 2033, y: 0, width: 390, height: 1672 }}
      />
    </Canvas>
  );
}
