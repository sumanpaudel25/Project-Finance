import React, { useState } from 'react';
import { TransactionType, Category } from '../types';
import Button from './Button';
import { categorizeTransaction } from '../services/geminiService';
import { Sparkles } from 'lucide-react';

interface TransactionFormProps {
  projectId: string;
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ projectId, categories, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(categories[0]?.id || 'other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      projectId,
      title,
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    });
  };

  const handleAutoCategorize = async () => {
      if (!title) return;
      setIsAutoCategorizing(true);
      const suggestedCategory = await categorizeTransaction(title, description, categories);
      if (suggestedCategory && categories.some(c => c.id === suggestedCategory)) {
        setCategory(suggestedCategory);
      }
      setIsAutoCategorizing(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
              type === 'income' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 z-10 ring-1 ring-emerald-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
              type === 'expense' 
                ? 'bg-rose-50 text-rose-700 border-rose-200 z-10 ring-1 ring-rose-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <div className="mt-1 flex rounded-md shadow-sm">
            <input
            type="text"
            id="title"
            required
            className="block w-full rounded-none rounded-l-md border-gray-300 pl-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Website Design"
            />
            <button
                type="button"
                onClick={handleAutoCategorize}
                disabled={isAutoCategorizing || !title}
                className="-ml-px relative inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                title="Auto-categorize with AI"
            >
                {isAutoCategorizing ? <span className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></span> : <Sparkles className="h-4 w-4 text-purple-600" />}
            </button>
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="amount"
            required
            min="0.01"
            step="0.01"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 border pl-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Add Transaction</Button>
      </div>
    </form>
  );
};

export default TransactionForm;