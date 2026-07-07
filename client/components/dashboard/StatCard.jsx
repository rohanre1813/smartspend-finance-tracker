import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

const StatCard = ({ title, amount, icon, colorClass }) => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-foreground">₹{amount}</p>
  </div>
);

export default StatCard;