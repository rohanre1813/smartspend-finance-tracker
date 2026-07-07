import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import Chart from "../components/BarChart";
import StatCard from "../components/dashboard/StatCard";
import TransactionList from "../components/dashboard/TransactionList";
import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import CreateAccountModal from "../components/dashboard/CreateAccountModal";
import AccountCard from "../components/dashboard/AccountCard";
import ExpensePieChart from "../components/dashboard/PieChart";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgetStatsMap, setBudgetStatsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, transRes, monthlyRes, accountsRes, categoryRes] = await Promise.all([
        API.get("/analytics/dashboard"),
        API.get("/transactions"),
        API.get("/analytics/monthly"),
        API.get("/accounts"),
        API.get("/analytics/categories"),
      ]);

      setStats(statsRes.data);
      setTransactions(transRes.data);
      setMonthlyData(monthlyRes.data);
      setAccounts(accountsRes.data);
      setCategoryData(categoryRes.data);

      // Fetch budget stats for accounts that have a budget set
      const accountsWithBudget = accountsRes.data.filter((a) => a.budget);
      const budgetResults = await Promise.all(
        accountsWithBudget.map((a) =>
          API.get(`/analytics/budget?accountId=${a._id}`)
            .then((res) => ({ id: a._id, data: res.data }))
            .catch(() => ({ id: a._id, data: null }))
        )
      );

      const map = {};
      budgetResults.forEach(({ id, data }) => { map[id] = data; });
      setBudgetStatsMap(map);

    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await API.patch(`/accounts/${id}/default`);
      fetchData();
    } catch (err) {
      console.error("Set Default Error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fmt = (n) =>
    Number(n ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Layout>
      {showAddTransaction && (
        <AddTransactionModal
          accounts={accounts}
          onClose={() => setShowAddTransaction(false)}
          onSuccess={fetchData}
        />
      )}
      {showCreateAccount && (
        <CreateAccountModal
          onClose={() => setShowCreateAccount(false)}
          onSuccess={fetchData}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 pb-12 flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track your financial activity
            </p>
          </div>
          <Button onClick={() => setShowAddTransaction(true)} className="gap-2">
            <Plus size={15} />
            Add Transaction
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Income"
            amount={fmt(stats.totalIncome)}
            icon={<TrendingUp size={16} className="text-emerald-600" />}
            colorClass="bg-emerald-500/10"
          />
          <StatCard
            title="Total Expense"
            amount={fmt(stats.totalExpense)}
            icon={<TrendingDown size={16} className="text-red-500" />}
            colorClass="bg-red-500/10"
          />
          <StatCard
            title="Net Balance"
            amount={fmt(stats.balance)}
            icon={<Wallet size={16} className="text-blue-500" />}
            colorClass="bg-blue-500/10"
          />
        </div>

        {/* Accounts Section */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">My Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <AccountCard
                key={acc._id}
                account={acc}
                onSetDefault={handleSetDefault}
                budgetStats={budgetStatsMap[acc._id] || null}
              />
            ))}
            <button
              onClick={() => setShowCreateAccount(true)}
              className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground hover:text-foreground min-h-35"
            >
              <Plus size={22} />
              <span className="text-sm font-medium">Add New Account</span>
            </button>
          </div>
        </div>

        {/* Charts Row — full width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-base font-bold text-foreground mb-0.5">Monthly Overview</h2>
            <p className="text-xs text-muted-foreground mb-4">Income vs Expenses</p>
            {loading ? (
              <div className="h-56 bg-muted rounded-xl animate-pulse" />
            ) : (
              <Chart data={monthlyData} />
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-base font-bold text-foreground mb-0.5">Expense Breakdown</h2>
            <p className="text-xs text-muted-foreground mb-4">Spending by category</p>
            {loading ? (
              <div className="h-56 bg-muted rounded-xl animate-pulse" />
            ) : (
              <ExpensePieChart data={categoryData} />
            )}
          </div>
        </div>

        {/* Transactions — full width */}
        <TransactionList
          transactions={transactions}
          loading={loading}
          onDelete={handleDelete}
        />

      </div>
    </Layout>
  );
};

export default Dashboard;
