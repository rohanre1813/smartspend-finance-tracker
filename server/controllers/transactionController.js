import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import budgetAlertEmail from "../utils/budgetAlertEmail.js";

// CREATE
export const createTransaction = async (req, res) => {
  try {
    const {
      type, amount, category, description,
      date, accountId, isRecurring, recurringInterval,
    } = req.body;

    let account = accountId
      ? await Account.findOne({ _id: accountId, user: req.user._id })
      : await Account.findOne({ user: req.user._id, isDefault: true });

    if (!account) {
      return res.status(400).json({ message: "No account found. Please create an account first." });
    }

    let nextRecurringDate = null;
    if (isRecurring && recurringInterval) {
      nextRecurringDate = calculateNextDate(date || new Date(), recurringInterval);
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      type,
      amount,
      category,
      description,
      date: date || Date.now(),
      isRecurring: isRecurring || false,
      recurringInterval: isRecurring ? recurringInterval : null,
      nextRecurringDate,
    });

    // Update account balance
    if (type === "income") {
      account.balance += Number(amount);
    } else {
      account.balance -= Number(amount);
    }
    await account.save();

    // ── Budget Alert Check (only for expenses) ──────────────────────
    if (type === "expense" && account.budget) {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const result = await Transaction.aggregate([
          {
            $match: {
              user: account.user,
              account: account._id,
              type: "expense",
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const spentThisMonth = result[0]?.total || 0;
        const percent = (spentThisMonth / account.budget) * 100;

        // Send alert at 80% and again at 100%
        if (percent >= 80) {
          const user = await User.findById(req.user._id);
          const html = budgetAlertEmail(
            user.name,
            account.name,
            account.budget,
            spentThisMonth,
            percent
          );
          await sendEmail(
            user.email,
            percent >= 100
              ? `🚨 Budget Exceeded — ${account.name}`
              : `⚠️ Budget Alert — ${account.name}`,
            html
          );
          console.log(`📧 Budget alert sent to ${user.email} (${percent.toFixed(1)}% used)`);
        }
      } catch (alertErr) {
        // Don't fail the transaction if alert email fails
        console.error("Budget alert error:", alertErr.message);
      }
    }
    // ────────────────────────────────────────────────────────────────

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Create Transaction Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL (optionally filter by accountId)
export const getTransactions = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.accountId) {
      filter.account = req.query.accountId;
    }
    const transactions = await Transaction.find(filter)
      .populate("account", "name type")
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET SINGLE
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("account", "name type");
    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }
    const account = await Account.findById(transaction.account);

    // Reverse old effect
    if (transaction.type === "income") {
      account.balance -= transaction.amount;
    } else {
      account.balance += transaction.amount;
    }

    const { type, amount, category, description, date } = req.body;
    transaction.type = type;
    transaction.amount = amount;
    transaction.category = category;
    transaction.description = description;
    transaction.date = date;
    await transaction.save();

    // Apply new effect
    if (type === "income") {
      account.balance += Number(amount);
    } else {
      account.balance -= Number(amount);
    }
    await account.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }
    const account = await Account.findById(transaction.account);
    if (account) {
      if (transaction.type === "income") {
        account.balance -= transaction.amount;
      } else {
        account.balance += transaction.amount;
      }
      await account.save();
    }
    await transaction.deleteOne();
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// BULK DELETE
export const bulkDeleteTransactions = async (req, res) => {
  try {
    const { ids } = req.body;
    const transactions = await Transaction.find({
      _id: { $in: ids },
      user: req.user._id,
    });
    for (const t of transactions) {
      const account = await Account.findById(t.account);
      if (account) {
        if (t.type === "income") {
          account.balance -= t.amount;
        } else {
          account.balance += t.amount;
        }
        await account.save();
      }
    }
    await Transaction.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ message: `${transactions.length} transactions deleted` });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

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