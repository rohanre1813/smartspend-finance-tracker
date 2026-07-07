import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const AccountCard = ({ account, onSetDefault, budgetStats }) => {
  const navigate = useNavigate();
  const isDefault = account.isDefault;

  // Use real monthly spend from analytics, not balance
  const pct = budgetStats?.percentUsed ?? null;

  return (
    <div
      onClick={() => navigate(`/account/${account._id}`)}
      className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:shadow-md transition group relative"
    >
      {/* Default badge */}
      {isDefault && (
        <span className="absolute top-3 right-3 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
          Default
        </span>
      )}

      {/* Account info */}
      <div className="mb-4">
        <p className="text-base font-bold text-foreground">{account.name}</p>
        <p className="text-xs text-muted-foreground capitalize mt-0.5">
          {account.type} Account
        </p>
      </div>

      {/* Balance */}
      <p className="text-2xl font-bold text-foreground mb-4">
        ₹{Number(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>

      {/* Budget progress — only if budget set and stats loaded */}
      {account.budget && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Monthly Budget</span>
            <span>{pct !== null ? `${pct.toFixed(1)}% used` : "—"}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            {pct !== null && (
              <div
                className={`h-full rounded-full transition-all ${
                  pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ₹{Number(account.budget).toLocaleString("en-IN")} budget
          </p>
        </div>
      )}

      {/* Set default button */}
      {!isDefault && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault(account._id);
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition mt-1"
        >
          <Star size={12} />
          Set as default
        </button>
      )}
    </div>
  );
};

export default AccountCard;