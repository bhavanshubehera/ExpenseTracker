import React, { useState } from 'react';
import { Budget, Expense } from '../types';
import { Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BudgetOverviewProps {
  expenses: Expense[];
}

export function BudgetOverview({ expenses }: BudgetOverviewProps) {
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: '1', category: 'Food', amount: 0, spent: 0 },
    { id: '2', category: 'Rent', amount: 0, spent: 0 },
    { id: '3', category: 'Utilities', amount: 0, spent: 0 },
    { id: '4', category: 'Transport', amount: 0, spent: 0 },
  ]);

  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState('');
  const [tempSpent, setTempSpent] = useState('');

  const handleEdit = (id: string) => {
    setEditingBudget(id);
    const budget = budgets.find(b => b.id === id);
    setTempAmount(budget?.amount.toString() || '');
    setTempSpent(budget?.spent.toString() || '');
  };

  const handleSave = (id: string) => {
    const amount = parseFloat(tempAmount);
    const spent = parseFloat(tempSpent);

    if (isNaN(amount) || isNaN(spent) || amount < 0 || spent < 0) {
      toast.error('Please enter valid amounts');
      return;
    }

    setBudgets(budgets.map(budget => 
      budget.id === id ? { ...budget, amount, spent } : budget
    ));
    setEditingBudget(null);
    toast.success('Budget updated successfully!');
  };

  // Calculate spent amount for each budget category based on expenses
  const calculateSpentAmount = (category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const spentAmount = calculateSpentAmount(budget.category);
          const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
          const isOverBudget = percentage > 100;
          const barColor = percentage > 90 
            ? 'bg-red-500' 
            : percentage > 75 
              ? 'bg-yellow-500' 
              : 'bg-green-500';

          return (
            <div key={budget.id} className="relative">
              {editingBudget === budget.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tempAmount}
                      onChange={(e) => setTempAmount(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Budget amount"
                      autoFocus
                    />
                    <input
                      type="number"
                      value={tempSpent}
                      onChange={(e) => setTempSpent(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Spent amount"
                    />
                    <button
                      onClick={() => handleSave(budget.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {budget.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        ${spentAmount.toFixed(2)} / ${budget.amount.toFixed(2)}
                      </span>
                      <button onClick={() => handleEdit(budget.id)}>
                        <Edit2 size={16} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${barColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  {isOverBudget && (
                    <p className="text-xs text-red-600 mt-1">
                      Over budget by ${(spentAmount - budget.amount).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}