import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";
import {
  TrendingUp, TrendingDown, IndianRupee,
  ArrowLeft, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = {
  income: [
    "Salary", "Freelance", "Business", "Investment",
    "Rental", "Gift", "Refund", "Other",
  ],
  expense: [
    "Food", "Transport", "Shopping", "Entertainment",
    "Bills", "Healthcare", "Education", "Rent",
    "Travel", "Groceries", "Fuel", "Other",
  ],
};

const TransactionCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // present = edit mode
  const isEdit = Boolean(id);

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    accountId: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    isRecurring: false,
    recurringInterval: "",
  });

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await API.get("/accounts");
        setAccounts(data);
        const def = data.find((a) => a.isDefault) || data[0];
        if (def && !isEdit) {
          setForm((p) => ({ ...p, accountId: def._id }));
        }
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  // If edit mode, fetch existing transaction and pre-fill
  useEffect(() => {
    if (!isEdit) return;
    const fetchTransaction = async () => {
      try {
        setFetchLoading(true);
        const { data } = await API.get(`/transactions/${id}`);
        setForm({
          type: data.type,
          amount: data.amount,
          accountId: data.account?._id || data.account,
          category: data.category,
          date: data.date?.split("T")[0] || new Date().toISOString().split("T")[0],
          description: data.description || "",
          isRecurring: data.isRecurring || false,
          recurringInterval: data.recurringInterval || "",
        });
      } catch (err) {
        setError("Could not load transaction.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setScanLoading(true);
      setError("");
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { data } = await API.post("/ai/scan-receipt", {
        imageBase64: base64,
        mimeType: file.type,
      });
      setForm((p) => ({
        ...p,
        amount: data.amount || p.amount,
        category: data.category || p.category,
        date: data.date || p.date,
        description: data.description || p.description,
        type: data.type || p.type,
      }));
    } catch (err) {
      setError("Could not scan receipt. Fill in manually.");
    } finally {
      setScanLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!form.category) {
      setError("Please select a category.");
      return;
    }
    if (!form.accountId) {
      setError("Please select an account.");
      return;
    }
    if (form.isRecurring && !form.recurringInterval) {
      setError("Please select a recurring interval.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      if (isEdit) {
        await API.put(`/transactions/${id}`, {
          ...form,
          amount: Number(form.amount),
        });
      } else {
        await API.post("/transactions", {
          ...form,
          amount: Number(form.amount),
        });
      }
      navigate(-1);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Loading transaction…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 pb-12">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mt-6 mb-6 w-fit"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">
          {isEdit ? "Edit Transaction" : "Add Transaction"}
        </h1>

        {/* AI Receipt Scanner — only show on create */}
        {!isEdit && (
          <label className={`
            w-full flex items-center justify-center gap-3 py-4 rounded-xl
            border-2 border-dashed border-border cursor-pointer mb-6
            hover:border-primary/50 hover:bg-muted/30 transition
            ${scanLoading ? "opacity-60 pointer-events-none" : ""}
          `}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScanReceipt}
            />
            <Camera size={20} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {scanLoading ? "Scanning receipt with AI…" : "Scan Receipt with AI"}
            </span>
          </label>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">

          {/* Type toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <div className="grid grid-cols-2 gap-3">
              {["income", "expense"].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((p) => ({ ...p, type: t, category: "" }))}
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
          </div>

          {/* Amount + Account */}
          <div className="grid grid-cols-2 gap-4">
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
              <label className="text-sm font-medium text-muted-foreground">Account</label>
              <select
                name="accountId"
                value={form.accountId}
                onChange={handle}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {accounts.length === 0 && <option value="">No accounts found</option>}
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} (₹{Number(a.balance).toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handle}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select category</option>
              {CATEGORIES[form.type].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date */}
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

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <textarea
              name="description"
              placeholder="Enter description"
              value={form.description}
              onChange={handle}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Recurring toggle */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30 cursor-pointer">
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
              <label className="text-sm font-medium text-muted-foreground">Recurring Interval</label>
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

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className={form.type === "income" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
            >
              {loading
                ? isEdit ? "Saving…" : "Creating…"
                : isEdit ? "Save Changes" : "Create Transaction"
              }
            </Button>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default TransactionCreate;