import { Search, Wallet, Trash2, Plus, Download } from "lucide-react";
import TransactionRow from "./TransactionRow";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-3 py-3 animate-pulse">
    <div className="w-2 h-2 rounded-full bg-muted shrink-0" />
    <div className="flex-1">
      <div className="h-3 w-2/5 bg-muted rounded mb-2" />
      <div className="h-2.5 w-3/5 bg-muted rounded" />
    </div>
    <div className="h-3 w-14 bg-muted rounded" />
  </div>
);

const ITEMS_PER_PAGE = 10;

/* ─── PDF Export ──────────────────────────────────────────────────
   Uses jsPDF + jspdf-autotable.
   Install: npm install jspdf jspdf-autotable
──────────────────────────────────────────────────────────────────*/
const exportToPDF = async (transactions) => {
  // Dynamic import so bundle only loads when user clicks export
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // ── Header ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(24, 24, 27); // zinc-900
  doc.text("SmartSpend", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(113, 113, 122); // zinc-500
  doc.text("Transaction Report", 14, 25);
  doc.text(`Generated: ${dateStr}`, 14, 31);

  // summary line
  const totalIncome  = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net          = totalIncome - totalExpense;

  doc.setFontSize(9);
  doc.text(
    `Total Transactions: ${transactions.length}   |   Income: Rs. ${totalIncome.toLocaleString("en-IN")}   |   Expense: Rs. ${totalExpense.toLocaleString("en-IN")}   |   Net: Rs. ${net.toLocaleString("en-IN")}`,
    14, 38
  );

  // ── Table ──
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    t.type.charAt(0).toUpperCase() + t.type.slice(1),
    t.category || "—",
    t.description || "—",
    `Rs. ${Number(t.amount).toLocaleString("en-IN")}`,
    t.isRecurring ? `Yes (${t.recurringInterval || ""})` : "No",
  ]);

  autoTable(doc, {
    startY: 43,
    head: [["Date", "Type", "Category", "Description", "Amount", "Recurring"]],
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: [24, 24, 27],   // zinc-900
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [39, 39, 42],   // zinc-800
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250], // zinc-50
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 22 },
      2: { cellWidth: 36 },
      3: { cellWidth: "auto" },
      4: { cellWidth: 38, halign: "right" },
      5: { cellWidth: 30 },
    },
    // colour-code income vs expense rows
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 1) {
        const type = data.cell.raw?.toString().toLowerCase();
        if (type === "income")  data.cell.styles.textColor = [22, 163, 74];   // green-600
        if (type === "expense") data.cell.styles.textColor = [220, 38, 38];   // red-600
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer on every page ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170); // zinc-400
    doc.text(
      `SmartSpend — Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`smartspend-transactions-${now.toISOString().slice(0, 10)}.pdf`);
};

/* ─── Component ──────────────────────────────────────────────────*/
const TransactionList = ({
  transactions,
  loading,
  onDelete,
  selectable = false,
  onBulkDelete,
  onAdd,
}) => {
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    setPage(1);
    return transactions.filter((t) => {
      const matchText =
        t.category?.toLowerCase().includes(filter.toLowerCase()) ||
        t.description?.toLowerCase().includes(filter.toLowerCase());
      const matchType = typeFilter === "all" || t.type === typeFilter;
      return matchText && matchType;
    });
  }, [transactions, filter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSelect    = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map((t) => t._id));

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} transaction(s)?`)) return;
    await onBulkDelete(selected);
    setSelected([]);
  };

  const handleExport = async () => {
    if (!filtered.length) return;
    setExporting(true);
    try {
      // Export all filtered transactions (not just current page)
      await exportToPDF(filtered);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-base font-bold text-foreground">Transactions</h2>
        <div className="flex items-center gap-2 flex-wrap">

          {/* Bulk delete */}
          {selectable && selected.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-1.5">
              <Trash2 size={13} />
              Delete {selected.length}
            </Button>
          )}

          {/* Add button */}
          {onAdd && (
            <Button size="sm" onClick={onAdd} className="gap-1.5">
              <Plus size={13} /> Add
            </Button>
          )}

          {/* ── Export PDF ── */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={exporting || !filtered.length}
            className="gap-1.5"
          >
            <Download size={13} />
            {exporting ? "Exporting…" : "Export PDF"}
          </Button>

          {/* Type filter */}
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {["all", "income", "expense"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  typeFilter === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search…"
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-40"
            />
          </div>

        </div>
      </div>

      {/* ── Select all row ── */}
      {selectable && paginated.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border mb-1">
          <input
            type="checkbox"
            checked={selected.length === paginated.length && paginated.length > 0}
            onChange={toggleSelectAll}
            className="accent-primary"
          />
          <span className="text-xs text-muted-foreground">
            {selected.length > 0 ? `${selected.length} selected` : "Select all"}
          </span>
        </div>
      )}

      {/* ── Rows ── */}
      <div className="flex flex-col">
        {loading ? (
          [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Wallet size={28} className="mb-2 opacity-40" />
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          paginated.map((t) =>
            selectable ? (
              <div key={t._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(t._id)}
                  onChange={() => toggleSelect(t._id)}
                  className="ml-3 accent-primary shrink-0"
                />
                <div className="flex-1">
                  <TransactionRow t={t} onDelete={onDelete} />
                </div>
              </div>
            ) : (
              <TransactionRow key={t._id} t={t} onDelete={onDelete} />
            )
          )
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {filtered.length} transactions
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground disabled:opacity-40 hover:bg-muted transition"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground disabled:opacity-40 hover:bg-muted transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransactionList;
