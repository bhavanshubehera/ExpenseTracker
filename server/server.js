import express from 'express';
import bodyParser from 'body-parser';
import mongoose, { Schema, model } from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BudgetSchema = new Schema({
  firebaseUid: { type: String, required: true },
  totalBudget: { type: Number, default: 0 },
  savingAmount: [Schema.Types.Mixed],
  expenseAmount: [Schema.Types.Mixed],
  budgetOverview: [Schema.Types.Mixed]
});

const Budget = model('Budget', BudgetSchema, 'usersDetails');

async function main() {
  try {
    await mongoose.connect(
      'mongodb+srv://bhavanshu:noob1234@adlabproject.x4lte.mongodb.net/AdLab?retryWrites=true&w=majority&appName=ADLabProject'
    );
    console.log('MongoDB connected successfully.');

    const collectionExists = await mongoose.connection.db
      .listCollections({ name: 'usersDetails' })
      .hasNext();

    if (collectionExists) {
      console.log('Connected to the usersDetails collection.');
    } else {
      console.log('usersDetails collection not found.');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

main();

app.get('/totalBudget/get/:uid', async (req, res) => {
  const uid = req.params.uid;
  try {
    const budget = await Budget.findOne({ firebaseUid: uid }, 'totalBudget');
    if (budget) {
      res.status(200).json({ totalBudget: budget.totalBudget });
    } else {
      res.status(404).json({ message: 'Budget not found' });
    }
  } catch (error) {
    console.error(`Error fetching totalBudget for UID ${uid}:`, error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

app.post('/totalBudget/push/:uid', async (req, res) => {
  const uid = req.params.uid;
  const { totalBudget } = req.body;

  if (typeof totalBudget !== 'number') {
    return res.status(400).json({ message: 'Invalid totalBudget value. Must be a number.' });
  }

  try {
    const updatedBudget = await Budget.findOneAndUpdate(
      { firebaseUid: uid },
      { $set: { totalBudget } },
      { new: true, upsert: true }
    );

    if (updatedBudget) {
      res.status(200).json({ totalBudget: updatedBudget.totalBudget });
    } else {
      res.status(404).json({ message: 'Budget to update not found' });
    }
  } catch (error) {
    console.error(`Error updating totalBudget for UID ${uid}:`, error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).send({ message: 'Something went wrong', error: error.message });
});

// GET latest expenseAmount entry
app.get('/expense/get/:uid', async (req, res) => {
    const uid = req.params.uid;
    try {
      const budget = await Budget.findOne({ firebaseUid: uid }, 'expenseAmount');
      if (budget && budget.expenseAmount && budget.expenseAmount.length > 0) {
        res.status(200).json({ expenseAmount: budget.expenseAmount[budget.expenseAmount.length - 1] });
      } else {
        res.status(404).json({ message: 'No expense data found for this user.' });
      }
    } catch (error) {
      console.error(`Error fetching expenseAmount for UID ${uid}:`, error);
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  });
  
 // POST: Replace expenseAmount with a new object
 app.post('/expense/push/:uid', async (req, res) => {
    const uid = req.params.uid;
    const newExpenseEntry = req.body; // Example: { food: 300 }
  
    if (!newExpenseEntry || typeof newExpenseEntry !== 'object') {
      return res.status(400).json({
        message: 'Invalid expense data. Must be an object of category-value pairs.'
      });
    }
  
    try {
      const userBudget = await Budget.findOne({ firebaseUid: uid });
  
      if (!userBudget) {
        const newBudget = new Budget({
          firebaseUid: uid,
          expenseAmount: [newExpenseEntry]
        });
        await newBudget.save();
        return res.status(201).json({
          message: 'Expense data created.',
          expenseAmount: newBudget.expenseAmount
        });
      }
  
      // Merge new values into the first expenseAmount object
      const existingExpenses = userBudget.expenseAmount?.[0] || {};
      const merged = { ...existingExpenses, ...newExpenseEntry };
      userBudget.expenseAmount = [merged];
  
      await userBudget.save();
  
      res.status(200).json({
        message: 'Expense data updated successfully.',
        expenseAmount: userBudget.expenseAmount
      });
  
    } catch (error) {
      console.error(`Error updating expenseAmount for UID ${uid}:`, error);
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  });
  
  


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
