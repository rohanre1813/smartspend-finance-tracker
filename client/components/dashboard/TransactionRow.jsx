import { Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TransactionRow = ({ t, onDelete }) => {
  const isIncome = t.type === "income";
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition group">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isIncome ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{t.category}</p>
        {t.description && (
          <p className="text-xs text-muted-foreground truncate">{t.description}</p>
        )}
        {t.date && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {new Date(t.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${isIncome ? "text-emerald-500" : "text-red-500"}`}>
          {isIncome ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
        </span>
        {/* Edit button */}
        <button
          onClick={() => navigate(`/transaction/edit/${t._id}`)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
        >
          <Pencil size={13} />
        </button>
        {/* Delete button */}
        <button
          onClick={() => onDelete(t._id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default TransactionRow;