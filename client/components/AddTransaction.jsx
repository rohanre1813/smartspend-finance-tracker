import { useState } from "react";
import API from "../services/api";

const AddTransaction = ({ refresh }) => {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    type: "expense",
  });

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await API.post("/transactions", form);
    refresh();
  } catch (error) {
    console.error(error.response?.data || error.message);
    alert("Transaction failed");
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-4">
      <input
        placeholder="Amount"
        className="border p-2 w-full"
        onChange={(e) =>
          setForm({ ...form, amount: Number(e.target.value) })
        }
      />

      <input
        placeholder="Category"
        className="border p-2 w-full"
        onChange={(e) =>
          setForm({ ...form, category: e.target.value })
        }
      />

      <select
        className="border p-2 w-full"
        onChange={(e) =>
          setForm({ ...form, type: e.target.value })
        }
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <button className="bg-blue-500 text-white px-4 py-2">
        Add Transaction
      </button>
    </form>
  );
};

export default AddTransaction;