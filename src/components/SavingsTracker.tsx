import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function SavingsTracker() {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '2024-12-31'
    },
    {
      id: '2',
      name: 'New Laptop',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '2024-06-30'
    }
  ]);

  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [tempTarget, setTempTarget] = useState('');
  const [tempCurrent, setTempCurrent] = useState('');

  const handleEdit = (id: string) => {
    setEditingGoal(id);
    const goal = savingsGoals.find(g => g.id === id);
    setTempTarget(goal?.targetAmount.toString() || '');
    setTempCurrent(goal?.currentAmount.toString() || '');
  };

  const handleSave = (id: string) => {
    const targetAmount = parseFloat(tempTarget);
    const currentAmount = parseFloat(tempCurrent);

    if (isNaN(targetAmount) || isNaN(currentAmount) || targetAmount < 0 || currentAmount < 0) {
      toast.error('Please enter valid amounts');
      return;
    }

    setSavingsGoals(savingsGoals.map(goal => 
      goal.id === id ? { ...goal, targetAmount, currentAmount } : goal
    ));
    setEditingGoal(null);
    toast.success('Savings goal updated successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Savings Goals</h2>
      <div className="space-y-6">
        {savingsGoals.map((goal) => {
          const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          
          return (
            <div key={goal.id} className="space-y-2">
              {editingGoal === goal.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tempTarget}
                      onChange={(e) => setTempTarget(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Target amount"
                      autoFocus
                    />
                    <input
                      type="number"
                      value={tempCurrent}
                      onChange={(e) => setTempCurrent(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Current amount"
                    />
                    <button
                      onClick={() => handleSave(goal.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{goal.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Due {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                      <button onClick={() => handleEdit(goal.id)}>
                        <Edit2 size={16} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                    </span>
                    <span className="font-medium text-blue-600">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}