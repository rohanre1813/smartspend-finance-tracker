const budgetAlertEmail = (userName, accountName, budget, spent, percent) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

    <!-- Header -->
    <div style="background:#18181b;padding:32px 32px 24px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">⚠️ Budget Alert</h1>
      <p style="margin:6px 0 0;color:#a1a1aa;font-size:14px;">${accountName}</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">
      <p style="margin:0;color:#374151;font-size:15px;">Hi <strong>${userName}</strong>,</p>
      <p style="margin:12px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
        You've used <strong style="color:#ef4444;">${percent.toFixed(1)}%</strong> of your monthly budget
        for <strong>${accountName}</strong>.
      </p>

      <!-- Progress bar -->
      <div style="margin:20px 0;background:#f3f4f6;border-radius:999px;height:10px;overflow:hidden;">
        <div style="width:${Math.min(percent, 100)}%;height:100%;background:${percent >= 100 ? "#ef4444" : "#f97316"};border-radius:999px;"></div>
      </div>

      <!-- Stats -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
        <tr>
          <td style="padding:10px 12px;background:#fef2f2;border-radius:10px;text-align:center;" width="48%">
            <p style="margin:0;font-size:11px;color:#dc2626;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Spent</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#b91c1c;">₹${Number(spent).toLocaleString("en-IN")}</p>
          </td>
          <td width="4%"></td>
          <td style="padding:10px 12px;background:#f9fafb;border-radius:10px;text-align:center;" width="48%">
            <p style="margin:0;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Budget</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#374151;">₹${Number(budget).toLocaleString("en-IN")}</p>
          </td>
        </tr>
      </table>

      <p style="margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
        ${percent >= 100
          ? "You've exceeded your budget for this month. Consider reviewing your expenses."
          : "You're close to your budget limit. Spend carefully for the rest of the month."
        }
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Finance Tracker · Budget Alert
      </p>
    </div>

  </div>
</body>
</html>`;

export default budgetAlertEmail;