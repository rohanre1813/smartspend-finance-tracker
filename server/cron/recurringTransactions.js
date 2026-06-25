import cron from "node-cron";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🔁 Running recurring transactions cron...");

  try {
    const now = new Date();

    // Find all due recurring transactions
    const due = await Transaction.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    });

    console.log(`Found ${due.length} recurring transaction(s) to process`);

    for (const t of due) {
      try {
        const account = await Account.findById(t.account);
        if (!account) {
          console.warn(`Account not found for transaction ${t._id}, skipping`);
          continue;
        }

        // Create new transaction
        await Transaction.create({
          user: t.user,
          account: t.account,
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: now,
          isRecurring: true,
          recurringInterval: t.recurringInterval,
          nextRecurringDate: calculateNextDate(now, t.recurringInterval),
        });

        // Update account balance
        if (t.type === "income") {
          account.balance += Number(t.amount);
        } else {
          account.balance -= Number(t.amount);
        }
        await account.save();

        // Update nextRecurringDate on the original transaction
        t.nextRecurringDate = calculateNextDate(now, t.recurringInterval);
        await t.save();

        console.log(`✅ Recurring transaction created for user ${t.user} — ${t.category} ₹${t.amount}`);
      } catch (err) {
        console.error(`❌ Failed to process transaction ${t._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Recurring cron error:", err.message);
  }
});

// Helper
const calculateNextDate = (date, interval) => {
  const next = new Date(date);
  switch (interval) {
    case "daily":   next.setDate(next.getDate() + 1); break;
    case "weekly":  next.setDate(next.getDate() + 7); break;
    case "monthly": next.setMonth(next.getMonth() + 1); break;
    case "yearly":  next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
};