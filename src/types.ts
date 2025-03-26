export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringInterval?: 'monthly' | 'weekly';
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  isRecurring: boolean;
}