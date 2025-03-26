import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { PlusCircle, Wallet, PiggyBank, TrendingUp, Edit2 } from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';
import { TransactionHistory } from './TransactionHistory';
import { SavingsTracker } from './SavingsTracker';
import { BudgetOverview } from './BudgetOverview';
import { Expense } from '../types';
import toast from 'react-hot-toast';
import { categories } from '../utils/constants';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function Dashboard() {

  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [savings, setSavings] = useState(0);
  const [editingField, setEditingField] = useState<'balance' | 'spending' | 'savings' | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [pieChartData, setPieChartData] = useState({
    labels: categories,
    datasets: [{
      data: new Array(categories.length).fill(0),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#4BC0C0',
        '#FF6384',
        '#36A2EB',
        '#FFCE56'
      ]
    }]
  });

  const [barChartData, setBarChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Expenses',
      data: new Array(6).fill(0),
      backgroundColor: '#36A2EB'
    }]
  });

  // New state for category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetch('http://localhost:3002/totalBudget/get/uid_3bff46')
      .then(res => res.json())
      .then(data => {
        if (data.totalBudget !== undefined) {
          setTotalBalance(data.totalBudget);
          setTempValue(data.totalBudget.toString());
        } else {
          toast.error('Failed to fetch total budget');
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        toast.error('Error fetching total budget');
      });
  }, []);
  
  useEffect(() => {
    const fetchExpenseData = () => {
      fetch('http://localhost:3002/expense/get/uid_3bff46')
        .then(res => res.json())
        .then(data => {
          if (data.expenseAmount) {
            const categoryData = data.expenseAmount;
            const labels = Object.keys(categoryData);
            const values = Object.values(categoryData).map(Number);
          
            // Set total spending
            const total = values.reduce((sum, val) => sum + val, 0);
            setMonthlySpending(total);
          
            // Update Pie Chart
            setPieChartData({
              labels,
              datasets: [{
                data: values,
                backgroundColor: labels.map((_, i) =>
                  `hsl(${(i * 47) % 360}, 70%, 60%)`
                )
              }]
            });
          
            // Update Bar Chart
            setBarChartData({
              labels,
              datasets: [{
                label: 'Expenses by Category',
                data: values,
                backgroundColor: '#36A2EB'
              }]
            });
          
          } else {
            toast.error('Failed to fetch expense data');
          }
          
        })
        .catch(err => {
          console.error('Error fetching expense data:', err);
          toast.error('Error fetching expense data');
        });
    };
  
    fetchExpenseData(); // Initial call
    const interval = setInterval(fetchExpenseData, 1000); // Poll every 1 sec
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  
  

  useEffect(() => {
    // Update pie chart data based on expenses
    const categoryTotals = new Array(categories.length).fill(0);
    expenses.forEach(expense => {
      const categoryIndex = categories.indexOf(expense.category);
      if (categoryIndex !== -1) {
        categoryTotals[categoryIndex] += expense.amount;
      }
    });

    setPieChartData(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        data: categoryTotals
      }]
    }));

    // Update monthly spending
    const currentMonth = new Date().getMonth();
    const currentMonthExpenses = expenses.reduce((total, expense) => {
      const expenseMonth = new Date(expense.date).getMonth();
      return expenseMonth === currentMonth ? total + expense.amount : total;
    }, 0);

    setMonthlySpending(currentMonthExpenses);

    // Update bar chart data
    const monthlyTotals = new Array(6).fill(0);
    expenses.forEach(expense => {
      const expenseMonth = new Date(expense.date).getMonth();
      if (expenseMonth >= 0 && expenseMonth < 6) {
        monthlyTotals[expenseMonth] += expense.amount;
      }
    });

    setBarChartData(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        data: monthlyTotals
      }]
    }));
  }, [expenses]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9)
    };
    setExpenses(prev => [...prev, newExpense]);
    setTotalBalance(prev => prev - expense.amount);
    toast.success('Expense added successfully!');
  };

  const handleEdit = (field: 'balance' | 'spending' | 'savings') => {
    setEditingField(field);
    setTempValue('');
  };

  const handleSave = () => {
    const value = parseFloat(tempValue);
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    switch (editingField) {
      case 'balance':
        fetch('http://localhost:3002/totalBudget/push/uid_3bff46', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ totalBudget: value })
        })
          .then(res => res.json())
          .then(data => {
            if (data.totalBudget !== undefined) {
              setTotalBalance(data.totalBudget);
              toast.success('Total balance updated');
            } else {
              toast.error('Failed to update total balance');
            }
          })
          .catch(err => {
            console.error('Update error:', err);
            toast.error('Error updating total balance');
          });
        break;

      case 'spending':
        setMonthlySpending(value);
        break;
      case 'savings':
        setSavings(value);
        break;
    }
    setEditingField(null);
    toast.success('Value updated successfully!');
  };

  // Filter expenses based on selected category
  const filteredExpenses = selectedCategory === 'All' 
    ? expenses 
    : expenses.filter(expense => expense.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="mr-2" size={20} />
            Add Expense
          </button>
        </div>

        {/* Category Filter Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="All">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Wallet className="text-blue-500 mr-2" size={24} />
              <h2 className="text-xl font-semibold">Total Balance</h2>
              <button onClick={() => handleEdit('balance')} className="ml-2">
                <Edit2 size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            {editingField === 'balance' ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter amount"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-3xl font-bold">${totalBalance.toFixed(2)}</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <TrendingUp className="text-green-500 mr-2" size={24} />
              <h2 className="text-xl font-semibold">Monthly Spending</h2>
            </div>
            <p className="text-3xl font-bold">${monthlySpending.toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <PiggyBank className="text-purple-500 mr-2" size={24} />
              <h2 className="text-xl font-semibold">Savings</h2>
              <button onClick={() => handleEdit('savings')} className="ml-2">
                <Edit2 size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            {editingField === 'savings' ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter amount"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-3xl font-bold">${savings.toFixed(2)}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
            <div className="h-64">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Trend</h2>
            <div className="h-64">
              <Bar 
                data={barChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetOverview expenses={expenses} />
          <SavingsTracker />
        </div>

        <div className="mt-8">
          <TransactionHistory expenses={filteredExpenses} />
        </div>

        {showExpenseForm && (
          <ExpenseForm
            onSubmit={handleAddExpense}
            onClose={() => setShowExpenseForm(false)}
          />
        )}
      </div>
    </div>
  );
}