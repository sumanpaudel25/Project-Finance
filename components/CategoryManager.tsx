import React, { useState } from 'react';
import { Category } from '../types';
import { ICON_MAP, AVAILABLE_COLORS } from '../constants';
import Button from './Button';
import { Trash2, Plus, X } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onUpdate, onClose }) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(AVAILABLE_COLORS[8].class); // Default Indigo
  const [newCatIcon, setNewCatIcon] = useState('more');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
    const newCategory: Category = {
      id,
      name: newCatName,
      color: newCatColor,
      iconName: newCatIcon,
      isDefault: false,
    };

    onUpdate([...categories, newCategory]);
    setNewCatName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this category? Transactions using it will be preserved but category info might be lost.')) {
        onUpdate(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* List Existing */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || ICON_MAP['more'];
          return (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md bg-white shadow-sm ${cat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    {cat.isDefault && <span className="text-[10px] uppercase tracking-wider text-gray-400">Default</span>}
                </div>
              </div>
              {!cat.isDefault && (
                <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New */}
      <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Custom Category</h4>
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input 
                    type="text" 
                    value={newCatName} 
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="e.g. Gym Membership"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    required
                />
            </div>
            
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map((col) => (
                        <button
                            type="button"
                            key={col.name}
                            onClick={() => setNewCatColor(col.class)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${col.class.replace('text-', 'bg-')} ${newCatColor === col.class ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                            title={col.name}
                        />
                    ))}
                </div>
            </div>

            <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                 <div className="flex flex-wrap gap-2">
                    {Object.keys(ICON_MAP).map(iconKey => {
                        const IconComponent = ICON_MAP[iconKey];
                        return (
                            <button
                                type="button"
                                key={iconKey}
                                onClick={() => setNewCatIcon(iconKey)}
                                className={`p-1.5 rounded-md border ${newCatIcon === iconKey ? 'bg-indigo-100 border-indigo-500 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'}`}
                            >
                                <IconComponent className="h-4 w-4" />
                            </button>
                        )
                    })}
                 </div>
            </div>
        </div>
        <div className="mt-4 flex justify-end">
            <Button type="submit" size="sm" disabled={!newCatName.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Category
            </Button>
        </div>
      </form>

      <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Done</Button>
      </div>
    </div>
  );
};

export default CategoryManager;