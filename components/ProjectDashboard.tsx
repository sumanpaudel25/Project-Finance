import React, { useState, useMemo } from 'react';
import { Project, Transaction, Category } from '../types';
import { ICON_MAP } from '../constants';
import { addTransaction, getTransactions, deleteTransaction } from '../services/storageService';
import { getFinancialAdvice } from '../services/geminiService';
import Button from './Button';
import Modal from './Modal';
import TransactionForm from './TransactionForm';
import CategoryManager from './CategoryManager';
import { 
  ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign, 
  Brain, Trash2, Calendar, FileText, PieChart as PieIcon,
  Sparkles, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import ReactMarkdown from 'react-markdown';

interface ProjectDashboardProps {
  project: Project;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  onBack: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, categories, onUpdateCategories, onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions(project.id));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const stats = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') {
        acc.income += t.amount;
      } else {
        acc.expense += t.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = stats.income - stats.expense;

  const chartData = useMemo(() => {
    // Group by category for Pie Chart
    const categoryData: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
    });
    
    return Object.entries(categoryData).map(([key, value]) => {
      const cat = categories.find(c => c.id === key);
      return {
        name: cat?.name || key,
        value,
        // Map Tailwind text color class to a rough hex for the chart if possible, or use a default
        // Simple mapping for demo purposes, relying on a palette array below
        id: key
      };
    });
  }, [transactions, categories]);

  // Specific colors for chart slices
  const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'];

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...data,
      id: crypto.randomUUID(),
    };
    const updated = addTransaction(newTx);
    // Filter again to ensure we only show current project's txs if local storage returns all
    setTransactions(updated.filter(t => t.projectId === project.id));
    setIsAddModalOpen(false);
    // Clear old AI insight as data changed
    setAiInsight(null);
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to delete this transaction?')) {
        const updated = deleteTransaction(id);
        setTransactions(updated.filter(t => t.projectId === project.id));
        setAiInsight(null);
    }
  };

  const handleAskAi = async () => {
    setIsAiLoading(true);
    const insight = await getFinancialAdvice(project, transactions);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="!p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 text-sm">{project.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsCatModalOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Categories
            </Button>
            <Button variant="ai" onClick={handleAskAi} isLoading={isAiLoading} className="hidden sm:flex">
                <Brain className="mr-2 h-4 w-4" />
                AI Insights
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
            </Button>
        </div>
        {/* Mobile AI button */}
        <Button variant="ai" onClick={handleAskAi} isLoading={isAiLoading} className="sm:hidden w-full justify-center">
            <Brain className="mr-2 h-4 w-4" />
            Analyze Project
        </Button>
      </div>

      {/* AI Insight Section */}
      {aiInsight && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Brain size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
              AI Financial Analysis
            </h3>
            <div className="prose prose-sm prose-indigo max-w-none text-gray-700">
              <ReactMarkdown>{aiInsight}</ReactMarkdown>
            </div>
            <button 
              onClick={() => setAiInsight(null)}
              className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Balance</p>
            <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">
              +${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold mt-1 text-rose-600">
              -${stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <PieIcon className="mr-2 h-5 w-5 text-gray-400" />
            Expense Breakdown
          </h3>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No expenses recorded
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-gray-400" />
                    Recent Transactions
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{transactions.length} records</span>
            </div>
          
            <div className="overflow-y-auto max-h-[500px] flex-1">
                {transactions.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                    <p>No transactions yet.</p>
                    <p className="text-sm mt-1">Click "Add Transaction" to get started.</p>
                </div>
                ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.slice().reverse().map((t) => {
                        const category = categories.find(c => c.id === t.category);
                        const IconComponent = category ? (ICON_MAP[category.iconName] || ICON_MAP['more']) : ICON_MAP['more'];
                        const categoryName = category ? category.name : t.category;
                        
                        return (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {t.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{t.title}</div>
                            </div>
                            {t.description && <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{t.description}</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4 text-gray-400" />
                                    <span className="capitalize">{categoryName}</span>
                                </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
                )}
            </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Transaction"
      >
        <TransactionForm
          projectId={project.id}
          categories={categories}
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Manage Categories"
      >
          <CategoryManager 
            categories={categories} 
            onUpdate={onUpdateCategories} 
            onClose={() => setIsCatModalOpen(false)}
        />
      </Modal>

      {/* Helper icon for specific component usage in import block to avoid unused var issues if any */}
      <span className="hidden"><Sparkles className="h-4 w-4"/></span>
    </div>
  );
};

export default ProjectDashboard;