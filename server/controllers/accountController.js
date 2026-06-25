import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

// Create account
export const createAccount = async (req, res) => {
  try {
    const { name, type, balance, isDefault, budget } = req.body;

    // If this is first account or isDefault is true,
    // remove default from all other accounts first
    const existingAccounts = await Account.countDocuments({
      user: req.user._id,
    });

    const shouldBeDefault = existingAccounts === 0 || isDefault;

    if (shouldBeDefault) {
      await Account.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    const account = await Account.create({
      user: req.user._id,
      name,
      type: type || "current",
      balance: balance || 0,
      isDefault: shouldBeDefault,
      budget: budget || null,
    });

    res.status(201).json(account);
  } catch (error) {
    console.error("Create Account Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all accounts for user
export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single account with its transactions
export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const transactions = await Transaction.find({
      account: req.params.id,
      user: req.user._id,
    }).sort({ date: -1 });

    res.json({ account, transactions });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update account (name, budget, type)
export const updateAccount = async (req, res) => {
  try {
    const { name, budget, type } = req.body;

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, budget, type },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Set default account
export const setDefaultAccount = async (req, res) => {
  try {
    // Remove default from all accounts
    await Account.updateMany(
      { user: req.user._id },
      { isDefault: false }
    );

    // Set new default
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Delete all transactions for this account too
    await Transaction.deleteMany({ account: req.params.id });
    await account.deleteOne();

    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};