import { useState } from "react";
import API from "../../services/api";
import { TrendingUp, TrendingDown, IndianRupee, X } from "lucide-react";

const AddTransactionModal = ({ onClose, onSuccess, accounts = [] }) => {
  const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0];

  const [form, setForm] = useState({
    type: "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    accountId: defaultAccount?._id || "",
    isRecurring: false,
    recurringInterval: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async () => {
    if (!form.category.trim() || !form.amount || Number(form.amount) <= 0) {
      setError("Please fill in category and a valid amount.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await API.post("/transactions", {
        ...form,
        amount: Number(form.amount),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl p-7 w-full max-w-md flex flex-col gap-5 shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">New Transaction</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-3">
          {["income", "expense"].map((t) => (
            <button
              key={t}
              onClick={() => setForm((p) => ({ ...p, type: t }))}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition
                ${form.type === t
                  ? t === "income"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : "bg-red-500/10 text-red-500 border-red-500/30"
                  : "bg-muted text-muted-foreground border-border"
                }`}
            >
              {t === "income" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Account selector */}
        {accounts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Account</label>
            <select
              name="accountId"
              value={form.accountId}
              onChange={handle}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} (₹{Number(a.balance).toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Category</label>
          <input
            name="category"
            placeholder="e.g. Food, Salary, Rent…"
            value={form.category}
            onChange={handle}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Description</label>
          <textarea
            name="description"
            placeholder="Optional notes…"
            value={form.description}
            onChange={handle}
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
            <div className="relative">
              <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                name="amount"
                type="number"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={handle}
                className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handle}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Recurring toggle */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer">
          <input
            type="checkbox"
            name="isRecurring"
            checked={form.isRecurring}
            onChange={handle}
            className="mt-0.5 accent-primary"
          />
          <div>
            <p className="text-sm font-medium text-foreground">Recurring Transaction</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set up a recurring schedule for this transaction
            </p>
          </div>
        </label>

        {/* Recurring interval */}
        {form.isRecurring && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Recurring Interval
            </label>
            <select
              name="recurringInterval"
              value={form.recurringInterval}
              onChange={handle}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select interval</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition disabled:opacity-60
            ${form.type === "income"
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {loading ? "Saving…" : `Add ${form.type === "income" ? "Income" : "Expense"}`}
        </button>
      </div>
    </div>
  );
};

export default AddTransactionModal;