import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import { Sparkles } from "lucide-react";
import { Input } from "../../../../src/ds/forms/Input";
import { Button } from "../../../../src/ds/actions/Button";
import { Select } from "../../../../src/ds/forms/Select";
import { Textarea } from "../../../../src/ds/forms/Textarea";
import { Checkbox } from "../../../../src/ds/forms/Checkbox";
import { Switch } from "../../../../src/ds/forms/Switch";
import { SegmentedControl } from "../../../../src/ds/forms/SegmentedControl";
import { Field } from "../../../../src/ds/forms/Field";
import Boardforms from "./BoardForms";
import Boardstates from "./BoardStates";

export default function FormsCanvas() {
  return (
    <Canvas name="Forms" backgroundColor="#232323">
      <Storyboard
        id="Forms"
        name={"Inputs & form controls"}
        component={Boardforms}
        layout={{ x: 0, y: 0, width: 1200, height: 1703 }}
      />
      <Storyboard
        id="States"
        name="Component states"
        component={Boardstates}
        layout={{ x: 1250, y: 0, width: 1200, height: 1396.40625 }}
      />
    </Canvas>
  );
}

defineAsset(Input, {
  libraries: ["Design System"],
  usageInstructions:
    "Single-line text, email, numbers and amounts. Always give a visible `label`. Amounts use `prefix=\"$\"` + `align=\"end\"` for tabular right alignment. Errors go in `error` (explain the fix), help in `hint`. For single-step entry (AI composer) use `size=\"lg\"` with a small Button in `action`.",
  variants: {
    Default: { props: { label: "Client name", placeholder: "e.g. Northwind Studio" } },
    Amount: { props: { label: "Amount", prefix: "$", align: "end", placeholder: "0.00" } },
    "With error": { props: { label: "Client email", defaultValue: "billing@northwind", error: "Enter a full email address, like name@company.com" } },
    Disabled: { props: { label: "Invoice number", defaultValue: "INV-1043", disabled: true, hint: "Generated automatically" } },
    "With action (composer)": {
      props: {
        size: "lg",
        "aria-label": "Message Ledgerly AI",
        placeholder: "Ask about your books…",
        action: <Button type="submit" size="sm" icon={Sparkles} aria-label="Send message" />,
      },
    },
  },
});

defineAsset(Select, {
  libraries: ["Design System"],
  usageInstructions:
    "Pick one option from a short, known list (payment terms, currency, tax rate). Native select so phones get the OS picker. For 2–4 view switches use SegmentedControl.",
  variants: {
    "Payment terms": {
      props: {
        label: "Payment terms",
        defaultValue: "net-30",
        options: [
          { value: "due-on-receipt", label: "Due on receipt" },
          { value: "net-15", label: "Net 15" },
          { value: "net-30", label: "Net 30" },
        ],
      },
    },
  },
});

defineAsset(Textarea, {
  libraries: ["Design System"],
  usageInstructions: "Multi-line free text: invoice notes, memos, payment instructions.",
  variants: {
    Notes: { props: { label: "Notes to client", optional: true, placeholder: "Thank you for your business!" } },
  },
});

defineAsset(Checkbox, {
  libraries: ["Design System"],
  usageInstructions: "Independent on/off choices submitted with a form (attach PDF, cc myself). For settings that apply instantly use Switch.",
  variants: {
    Checked: { props: { label: "Attach PDF to email", defaultChecked: true } },
    "With description": { props: { label: "Send a copy to myself", description: "We'll cc accounts@ledgerly.app" } },
  },
});

defineAsset(Switch, {
  libraries: ["Design System"],
  usageInstructions: "Settings that take effect immediately (automatic reminders, recurring invoice). Not for form fields that need a Save.",
  variants: {
    On: { props: { label: "Automatic payment reminders", description: "3 days before and after the due date", defaultChecked: true } },
    Off: { props: { label: "Recurring invoice" } },
  },
});

defineAsset(SegmentedControl, {
  libraries: ["Design System"],
  usageInstructions: "Switch between 2–4 views of the same data (Month / Quarter / Year, Chart / Table). Not page navigation — use Tabs.",
  variants: {
    Period: {
      props: {
        "aria-label": "Reporting period",
        defaultValue: "quarter",
        options: [
          { value: "month", label: "Month" },
          { value: "quarter", label: "Quarter" },
          { value: "year", label: "Year" },
        ],
      },
    },
  },
});

defineAsset(Field, {
  libraries: ["Design System"],
  usageInstructions: "Label + hint/error wrapper for CUSTOM controls only. Input, Select and Textarea already render it — don't wrap them again.",
  variants: {
    "Custom control": { render: () => <Field id="custom" label="Due date" hint="Shown on the invoice PDF"><div /></Field> },
  },
});
