import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import { Alert } from "../../../../src/ds/feedback/Alert";
import { ToastCard } from "../../../../src/ds/feedback/Toast";
import { Dialog } from "../../../../src/ds/feedback/Dialog";
import { EmptyState } from "../../../../src/ds/feedback/EmptyState";
import { Skeleton } from "../../../../src/ds/feedback/Skeleton";
import Boardfeedback from "./BoardFeedback";

export default function FeedbackCanvas() {
  return (
    <Canvas name="Feedback" backgroundColor="#232323">
      <Storyboard
        id="Feedback"
        name="Feedback"
        component={Boardfeedback}
        layout={{ x: 0, y: 0, width: 1200, height: 2334 }}
      />
    </Canvas>
  );
}

defineAsset(Alert, {
  libraries: ["Design System"],
  usageInstructions: "Inline, persistent message tied to nearby content. `insight` tone is reserved for the AI assistant. Transient confirmations use useToast(); blocking decisions use Dialog.",
  variants: {
    Insight: { props: { tone: "insight", title: "Cash is trending 18% above forecast", children: "Three invoices were paid early this week." } },
    Warning: { props: { tone: "warning", title: "2 invoices are overdue", children: "Harbor & Pine Co. and Mira Okafor owe $4,650 combined." } },
    Success: { props: { tone: "positive", title: "Invoice INV-1040 paid in full" } },
  },
});

defineAsset(ToastCard, {
  libraries: ["Design System"],
  usageInstructions: "Visual of a toast. In screens call `useToast().show({ title, description, action })` — don't render ToastCard directly.",
  variants: {
    Success: { props: { title: "Invoice saved as draft", description: "INV-1043 · Northwind Studio · $4,200.00" } },
    Info: { props: { title: "Match accepted", description: "Stripe payout → INV-1040", tone: "info" } },
  },
});

defineAsset(Dialog, {
  libraries: ["Design System"],
  usageInstructions: "Modal for decisions that block the flow (send, discard, void). Controlled via `open`/`onClose`; buttons go in `footer` (secondary cancel, then primary/danger confirm). Becomes a bottom sheet on phones.",
});

defineAsset(EmptyState, {
  libraries: ["Design System"],
  usageInstructions: "Any empty list or panel. Always say why it's empty and offer the next step in `actions`.",
  variants: {
    "All caught up": { props: { title: "You're all caught up", description: "Every bank transaction is reconciled." } },
    "First invoice": { props: { title: "Send your first invoice", description: "Create an invoice in under a minute. Ledgerly tracks it until it's paid." } },
  },
});

defineAsset(Skeleton, {
  libraries: ["Design System"],
  usageInstructions: "Loading placeholder shaped like the final content (size it with className). Never a bare spinner for page content.",
  variants: {
    Line: { props: { className: "h-4 w-48" } },
    Avatar: { props: { className: "size-8 rounded-full" } },
  },
});
