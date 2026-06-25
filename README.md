# SmartSpend – Personal Finance Tracker

SmartSpend is a full-stack MERN application that helps users manage their personal finances by tracking income, expenses, budgets, accounts, recurring transactions, and financial analytics in one place.

---

## Features

### Authentication & Security
- User Registration and Login
- JWT Authentication
- Protected Routes
- Password Hashing using bcrypt
- User-specific Data Access

### Account Management
- Create Multiple Accounts
- Current and Savings Account Types
- Default Account Support
- Budget Allocation per Account
- Update and Delete Accounts

### Transaction Management
- Add Income and Expense Transactions
- Categorize Transactions
- Assign Transactions to Accounts
- Update and Delete Transactions
- Bulk Delete Transactions
- Automatic Account Balance Updates

### Recurring Transactions
- Daily Transactions
- Weekly Transactions
- Monthly Transactions
- Yearly Transactions
- Automated Processing using Cron Jobs

### Budget Tracking
- Monthly Budget Monitoring
- Budget Usage Percentage
- Remaining Budget Calculation
- Budget Alert Notifications via Email

### Analytics Dashboard
- Total Income
- Total Expenses
- Current Balance
- Category-wise Expense Breakdown
- Monthly Income vs Expense Trends
- Budget Progress Statistics

### Email Notifications
- Budget Warning Alerts (80%)
- Budget Exceeded Alerts (100%)
- Monthly Financial Reports

---

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JWT (JSON Web Token)
- bcryptjs

### Scheduling
- node-cron

### Email Service
- Nodemailer

---

## Project Structure

```bash
server
│
├── config
│   └── db.js
│
├── controllers
│   ├── authController.js
│   ├── accountController.js
│   ├── transactionController.js
│   ├── analyticsController.js
│   └── aiController.js
│
├── middleware
│   └── authMiddleware.js
│
├── models
│   ├── User.js
│   ├── Account.js
│   └── Transaction.js
│
├── routes
│   ├── authRoutes.js
│   ├── accountRoutes.js
│   ├── transactionRoutes.js
│   └── analyticsRoutes.js
│
├── cron
│   ├── recurringTransactions.js
│   └── monthlyReport.js
│
├── utils
│   ├── sendEmail.js
│   └── budgetAlertEmail.js
│
└── server.js
```

---

## Database Schema

### User

```js
{
  name,
  email,
  password
}
```

### Account

```js
{
  user,
  name,
  type,
  balance,
  budget,
  isDefault
}
```

### Transaction

```js
{
  user,
  account,
  type,
  amount,
  category,
  description,
  date,
  isRecurring,
  recurringInterval,
  nextRecurringDate
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|----------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |

### Accounts

| Method | Endpoint | Description |
|----------|----------|-------------|
| GET | /api/accounts | Get All Accounts |
| POST | /api/accounts | Create Account |
| GET | /api/accounts/:id | Get Single Account |
| PUT | /api/accounts/:id | Update Account |
| PATCH | /api/accounts/:id/default | Set Default Account |
| DELETE | /api/accounts/:id | Delete Account |

### Transactions

| Method | Endpoint | Description |
|----------|----------|-------------|
| GET | /api/transactions | Get Transactions |
| POST | /api/transactions | Create Transaction |
| GET | /api/transactions/:id | Get Single Transaction |
| PUT | /api/transactions/:id | Update Transaction |
| DELETE | /api/transactions/:id | Delete Transaction |
| DELETE | /api/transactions/bulk | Bulk Delete Transactions |

### Analytics

| Method | Endpoint | Description |
|----------|----------|-------------|
| GET | /api/analytics/dashboard | Dashboard Summary |
| GET | /api/analytics/categories | Category Statistics |
| GET | /api/analytics/monthly | Monthly Statistics |
| GET | /api/analytics/budget | Budget Progress |

---

## Environment Variables

Create a `.env` file inside the server folder:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email_address

EMAIL_PASS=your_email_password

OPENAI_API_KEY=your_openai_api_key
```

---

## Installation

### Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

### Move Into Project

```bash
cd SmartSpend
```

### Install Backend Dependencies

```bash
npm install
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Run Backend

```bash
npm run dev
```

### Run Frontend

```bash
npm run dev
```

---

## Authentication Flow

```text
User Login
    ↓
JWT Token Generated
    ↓
Frontend Stores Token
    ↓
Authorization Header Sent
    ↓
authMiddleware Verifies Token
    ↓
Protected Routes Accessible
```

---

## Transaction Flow

```text
Create Transaction
    ↓
Save Transaction
    ↓
Update Account Balance
    ↓
Check Budget Usage
    ↓
Send Alert Email (if required)
    ↓
Return Response
```

---

## Analytics Flow

```text
Transactions
    ↓
MongoDB Aggregation
    ↓
Dashboard Statistics
    ↓
Charts and Reports
```

---

## Security Features

- JWT Authentication
- Password Hashing with bcrypt
- Protected API Routes
- User-specific Data Access
- Environment Variable Protection
- Rate Limiting

---

## Future Enhancements

- Multi-Currency Support
- Export Reports to PDF
- Financial Goals Tracking
- Investment Portfolio Tracking
- Real-Time Notifications
- AI Financial Insights
- Expense Forecasting

---

## Learning Outcomes

This project demonstrates:

- REST API Development
- JWT Authentication
- Express Middleware
- MongoDB Relationships
- Aggregation Pipelines
- Email Automation
- Cron Jobs
- Financial Business Logic
- Secure Password Management
- Full-Stack MERN Development

---

## Author

**Sourav**

MERN Stack Developer

Built using MongoDB, Express.js, React.js, and Node.js.