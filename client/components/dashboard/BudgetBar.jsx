const BudgetBar = ({ budget, budgetStats }) => {
  if (!budget || !budgetStats) return null;

  const fmt = (n) =>
    Number(n ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const pct = budgetStats.percentUsed ?? 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Monthly Budget</p>
          <p className="text-xs text-muted-foreground mt-2">
  {budgetStats.remaining >= 0
    ? `₹${fmt(budgetStats.remaining)} remaining`
    : `₹${fmt(Math.abs(budgetStats.remaining))} over budget`}
</p>
        </div>
        <span className={`text-sm font-bold ${
          pct > 90 ? "text-red-500" : pct > 70 ? "text-amber-500" : "text-emerald-500"
        }`}>
          {pct.toFixed(1)}% used
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

    </div>
  );
};

export default BudgetBar;