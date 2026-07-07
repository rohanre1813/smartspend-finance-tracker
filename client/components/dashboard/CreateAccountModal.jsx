import { useState } from "react";
import API from "../../services/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreateAccountModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    type: "current",
    balance: "",
    isDefault: false,
    budget: "",
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
    if (!form.name.trim()) {
      setError("Account name is required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await API.post("/accounts", {
        ...form,
        balance: Number(form.balance) || 0,
        budget: form.budget ? Number(form.budget) : null,
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
      <div className="bg-card border border-border rounded-2xl p-7 w-full max-w-md flex flex-col gap-5 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Create New Account</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Account Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Account Name
          </label>
          <input
            name="name"
            placeholder="e.g. Personal, Work, Savings…"
            value={form.name}
            onChange={handle}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Account Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Account Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handle}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="current">Current Account</option>
            <option value="savings">Savings Account</option>
          </select>
        </div>

        {/* Initial Balance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Initial Balance (₹)
          </label>
          <input
            name="balance"
            type="number"
            min="0"
            placeholder="0.00"
            value={form.balance}
            onChange={handle}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Monthly Budget */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Monthly Budget (₹) — optional
          </label>
          <input
            name="budget"
            type="number"
            min="0"
            placeholder="Leave empty for no budget"
            value={form.budget}
            onChange={handle}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Set as Default */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={handle}
            className="mt-0.5 accent-primary"
          />
          <div>
            <p className="text-sm font-medium text-foreground">Set as Default</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This account will be selected by default for transactions
            </p>
          </div>
        </label>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Creating…" : "Create Account"}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default CreateAccountModal;