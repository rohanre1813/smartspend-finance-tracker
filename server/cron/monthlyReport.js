import cron from "node-cron";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import sendEmail from "../utils/sendEmail.js";

// Runs at 8:00 AM on the 1st of every month
cron.schedule("0 8 1 * *", async () => {
  console.log("📊 Running monthly report cron...");

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const monthName = lastMonth.toLocaleString("en-IN", { month: "long", year: "numeric" });

  const users = await User.find();

  for (const user of users) {
    try {
      const transactions = await Transaction.find({
        user: user._id,
        date: { $gte: lastMonth, $lte: lastMonthEnd },
      });

      if (transactions.length === 0) continue; // skip users with no activity

      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const net = totalIncome - totalExpense;

      // Top 5 expense categories
      const categoryMap = {};
      transactions
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

      const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const categoryRows = topCategories
        .map(
          ([cat, amt]) => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${cat}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;color:#ef4444;font-weight:600;">
              −₹${Number(amt).toLocaleString("en-IN")}
            </td>
          </tr>`
        )
        .join("");

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    
    <!-- Header -->
    <div style="background:#18181b;padding:32px 32px 24px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">📊 Monthly Report</h1>
      <p style="margin:6px 0 0;color:#a1a1aa;font-size:14px;">${monthName}</p>
    </div>

    <!-- Greeting -->
    <div style="padding:24px 32px 0;">
      <p style="margin:0;color:#374151;font-size:15px;">Hi <strong>${user.name}</strong>,</p>
      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">Here's your financial summary for ${monthName}.</p>
    </div>

    <!-- Stats -->
    <div style="padding:24px 32px;display:flex;gap:12px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 6px 0 0;" width="33%">
            <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#16a34a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Income</p>
              <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#15803d;">₹${Number(totalIncome).toLocaleString("en-IN")}</p>
            </div>
          </td>
          <td style="padding:0 6px;" width="33%">
            <div style="background:#fef2f2;border-radius:12px;padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#dc2626;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Expenses</p>
              <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#b91c1c;">₹${Number(totalExpense).toLocaleString("en-IN")}</p>
            </div>
          </td>
          <td style="padding:0 0 0 6px;" width="33%">
            <div style="background:${net >= 0 ? "#f0fdf4" : "#fef2f2"};border-radius:12px;padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:${net >= 0 ? "#16a34a" : "#dc2626"};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Net</p>
              <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:${net >= 0 ? "#15803d" : "#b91c1c"};">${net >= 0 ? "+" : "−"}₹${Number(Math.abs(net)).toLocaleString("en-IN")}</p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Top Categories -->
    ${topCategories.length > 0 ? `
    <div style="padding:0 32px 24px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#374151;">Top Expense Categories</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;">
        ${categoryRows}
      </table>
    </div>` : ""}

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Finance Tracker · Auto-generated monthly report
      </p>
    </div>

  </div>
</body>
</html>`;

      await sendEmail(
        user.email,
        `Your Monthly Finance Report — ${monthName}`,
        html
      );

      console.log(`✅ Report sent to ${user.email}`);
    } catch (err) {
      console.error(`❌ Failed to send report to ${user.email}:`, err.message);
    }
  }
});
