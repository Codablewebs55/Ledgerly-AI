import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import { Table } from "../../../../src/ds/data/Table";
import { Pagination } from "../../../../src/ds/data/Pagination";
import { RowActions } from "../../../../src/ds/data/RowActions";
import { SortMenu } from "../../../../src/ds/data/SortMenu";
import { FilterMenu } from "../../../../src/ds/data/FilterMenu";
import { MenuItem, MenuSeparator } from "../../../../src/ds/navigation/Popover";
import { Copy, Download, Eye, Send } from "lucide-react";
import Boardtablesdesktop from "./BoardTablesDesktop";
import Boardtablesmobile from "./BoardTablesMobile";

export default function TablesCanvas() {
  return (
    <Canvas name="Tables" backgroundColor="#232323">
      <Storyboard
        id="TablesDesktop"
        name="Tables · desktop 1200"
        component={Boardtablesdesktop}
        layout={{ x: 0, y: 0, width: 1200, height: 2640 }}
      />
      <Storyboard
        id="TablesMobile"
        name="Tables · mobile 390"
        component={Boardtablesmobile}
        layout={{ x: 1250, y: 0, width: 390, height: 3480 }}
      />
    </Canvas>
  );
}

defineAsset(Table, {
  libraries: ["Design System"],
  usageInstructions:
    "Lists of records (invoices, expenses, transactions). Define `columns` with `cell` renderers; amounts last with `align: 'end'`; add `sortValue` to sortable columns (each gets the same ArrowUpDown icon after its label, never flipped for end-aligned columns; the active column is marked by fg colour and aria-sort) and `hideBelow` for low-priority ones. Always provide `renderMobileRow` — below 768px rows become two-line summaries, never a sideways-scrolling table. For per-row secondary actions pass `rowActions={(row) => <RowActions …/>}`: it adds a trailing right-aligned 'Actions' column holding a 32px round ••• button with a 14px icon and a `border-line-control` outline (and puts the button at the end of each mobile row). List tables sit in a padding-none Card under a table header: `flex flex-col gap-3 px-5 pt-2 md:px-6 lg:flex-row lg:items-center lg:gap-6` holding status Tabs (`order-last lg:order-none lg:self-end`, so the underline sits on the table's top rule), then a size `sm` search Input, a SortMenu and an optional total pushed right with `lg:ml-auto`. Keep the 8px (pt-2) space above the tabs at every width; never let the tabs touch the card edge. Inside the card pass `embedded` to the Table (drops its radius and side/bottom borders, keeping the top rule) — never `!` overrides.",
});

defineAsset(RowActions, {
  libraries: ["Design System"],
  usageInstructions:
    "Per-row overflow menu for a Table, passed through `rowActions`. A 32px round outlined button (border-line, bg-surface, 14px Ellipsis) opens a Popover menu of MenuItems (w-52) with `strategy=\"fixed\"`, so it escapes the table/card overflow and flips above near the viewport bottom. `label` names the record ('Actions for INV-1037'). Put the primary row action first (View), status-specific actions next, destructive or copy actions after a MenuSeparator. Clicks never trigger the row's onRowClick.",
  variants: {
    "Invoice row": {
      render: () => (
        <RowActions label="Actions for INV-1037">
          <MenuItem icon={Eye}>View invoice</MenuItem>
          <MenuItem icon={Send}>Send invoice</MenuItem>
          <MenuItem icon={Download}>Download PDF</MenuItem>
          <MenuSeparator />
          <MenuItem icon={Copy}>Duplicate</MenuItem>
        </RowActions>
      ),
    },
  },
});

defineAsset(Pagination, {
  libraries: ["Design System"],
  usageInstructions: "Footer for a paginated Table: 'Showing 1–8 of 42' plus page controls. When paginating, sort the full list (Table's controlled `sort`) before slicing a page.",
  variants: {
    "First page": { props: { page: 1, pageSize: 8, total: 42, noun: "invoices", onPageChange: () => {} } },
  },
});

defineAsset(SortMenu, {
  libraries: ["Design System"],
  usageInstructions:
    "Sort control for a table header, placed right after the size `sm` search Input. A 32px round outlined button (`border-line-control`, 14px ListFilter icon) opens a menu of the sortable columns; the active one shows an up/down arrow and choosing it again flips the direction, a new column starts descending. Bind `value`/`onChange` to the same state as the Table's controlled `sort` so header arrows and the menu agree, and reset pagination on change.",
  variants: {
    "Invoice sort": {
      props: {
        label: "Sort invoices",
        options: [
          { key: "issued", label: "Issue date" },
          { key: "due", label: "Due date" },
          { key: "amount", label: "Amount" },
          { key: "client", label: "Client" },
        ],
        value: { key: "issued", dir: "desc" },
        onChange: () => {},
      },
    },
  },
});

defineAsset(FilterMenu, {
  libraries: ["Design System"],
  usageInstructions:
    "Single-choice dropdown filter for a page header or toolbar, e.g. a date range placed immediately left of Export in PageHeader `actions`. A 40px filled `bg-surface-sunken` trigger (no border, `text-fg-muted` label, 14px ChevronDown) shows the chosen option; the menu marks it with a check. Use it to scope a list (the Invoices list filters by issue date) and reset pagination on change. Not for sorting (use SortMenu) or for form fields (use Select).",
  variants: {
    "Date range": {
      props: {
        label: "Date range",
        value: "90",
        options: [
          { value: "30", label: "Past 30 days" },
          { value: "90", label: "Past 90 days" },
          { value: "365", label: "Past 12 months" },
          { value: "all", label: "All time" },
        ],
        onChange: () => {},
      },
    },
  },
});
