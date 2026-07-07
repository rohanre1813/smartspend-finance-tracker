import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";
import Chart from "../components/BarChart";
import StatCard from "../components/dashboard/StatCard";
import TransactionList from "../components/dashboard/TransactionList";
import BudgetBar from "../components/dashboard/BudgetBar";
import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const AccountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [budgetStats, setBudgetStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountRes, monthlyRes, budgetRes] = await Promise.all([
        API.get(`/accounts/${id}`),
        API.get(`/analytics/monthly?accountId=${id}`),
        API.get(`/analytics/budget?accountId=${id}`),
      ]);
      setAccount(accountRes.data.account);
      setTransactions(accountRes.data.transactions);
      setMonthlyData(monthlyRes.data);
      setBudgetStats(budgetRes.data);
    } catch (err) {
      console.error("Account fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async (txId) => {
    try {
      await API.delete(`/transactions/${txId}`);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await API.delete("/transactions/bulk", { data: { ids } });
      fetchData();
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(`Delete "${account.name}" and all its transactions?`)) return;
    try {
      await API.delete(`/accounts/${id}`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Delete account error:", err);
    }
  };

  const handleUpdateBudget = async () => {
    const newBudget = window.prompt(
      "Enter new monthly budget (₹), or 0 to remove:",
      account.budget || ""
    );
    if (newBudget === null) return;
    try {
      await API.put(`/accounts/${id}`, {
        name: account.name,
        type: account.type,
        budget: newBudget ? Number(newBudget) : null,
      });
      fetchData();
    } catch (err) {
      console.error("Update budget error:", err);
    }
  };

  const fmt = (n) =>
    Number(n ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!account) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <p className="text-muted-foreground">Account not found.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {showAddTransaction && (
        <AddTransactionModal
          accounts={[account]}
          onClose={() => setShowAddTransaction(false)}
          onSuccess={fetchData}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 pb-12 flex flex-col gap-6">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mt-4 w-fit"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Account Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{account.name}</h1>
            <p className="text-sm text-muted-foreground capitalize mt-0.5">
              {account.type} Account · {transactions.length} Transactions
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleUpdateBudget}
                className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                Edit Budget
              </button>
              <button
                onClick={handleDeleteAccount}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">₹{fmt(account.balance)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Current Balance</p>
          </div>
        </div>

        {/* Budget Bar */}
        <BudgetBar budget={account.budget} budgetStats={budgetStats} />

        {/* Stat Cards — reusing StatCard component */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Income"
            amount={fmt(income)}
            icon={<TrendingUp size={16} className="text-emerald-600" />}
            colorClass="bg-emerald-500/10"
          />
          <StatCard
            title="Total Expense"
            amount={fmt(expense)}
            icon={<TrendingDown size={16} className="text-red-500" />}
            colorClass="bg-red-500/10"
          />
          <StatCard
            title="Net"
            amount={fmt(income - expense)}
            icon={<Wallet size={16} className="text-blue-500" />}
            colorClass="bg-blue-500/10"
          />
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-base font-bold text-foreground mb-0.5">Transaction Overview</h2>
          <p className="text-xs text-muted-foreground mb-4">Income vs Expenses over time</p>
          {monthlyData.length > 0 ? (
            <Chart data={monthlyData} />
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No transactions yet
            </div>
          )}
        </div>

        {/* Transaction List — reusing shared component with selectable mode */}
        <TransactionList
          transactions={transactions}
          loading={loading}
          onDelete={handleDelete}
          selectable={true}
          onBulkDelete={handleBulkDelete}
          onAdd={() => setShowAddTransaction(true)}
        />

      </div>
    </Layout>
  );
};

export default AccountPage;