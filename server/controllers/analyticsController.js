import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";

// Dashboard summary — all accounts combined
export const getDashboardStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Category breakdown (expenses only)
export const getCategoryStats = async (req, res) => {
  try {
    const filter = { user: req.user._id, type: "expense" };
    if (req.query.accountId) {
      filter.account = new mongoose.Types.ObjectId(req.query.accountId);
    }

    const data = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Monthly stats — income vs expense per month
export const getMonthlyStats = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.accountId) {
      filter.account = new mongoose.Types.ObjectId(req.query.accountId);
    }

    const data = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Shape into { month, income, expense } for the chart
    const monthMap = {};
    data.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, "0")}`;
      if (!monthMap[key]) {
        monthMap[key] = { month: key, income: 0, expense: 0 };
      }
      monthMap[key][_id.type] += total;
    });

    res.json(Object.values(monthMap));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Budget progress for an account — expenses this month only
export const getBudgetStats = async (req, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ message: "accountId required" });
    }

    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          account: new mongoose.Types.ObjectId(accountId),
          type: "expense",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const spentThisMonth = result[0]?.total || 0;

    res.json({
      budget: account.budget,
      spentThisMonth,
      remaining: account.budget ? account.budget - spentThisMonth : null,
      percentUsed: account.budget
        ? Math.min((spentThisMonth / account.budget) * 100, 100)
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};