import React, { useState } from 'react';
import { Project } from '../types';
import Button from './Button';
import Modal from './Modal';
import { FolderPlus, ChevronRight, Wallet } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onCreate: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelect, onCreate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: newProjectName,
      description: newProjectDesc,
      currency: 'USD',
    });
    setNewProjectName('');
    setNewProjectDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <div className="mx-auto h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
            <Wallet className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-2">
          FinTrack Pro
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your project finances with precision. Track income, monitor expenses, and get AI-powered insights.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Projects</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <FolderPlus className="mr-2 h-5 w-5" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <FolderPlus className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          <div className="mt-6">
            <Button onClick={() => setIsModalOpen(true)}>Create Project</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelect(project)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <ChevronRight className="text-indigo-400 h-5 w-5" />
              </div>
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                 <span className="font-bold text-lg">{project.name.charAt(0).toUpperCase()}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                {project.description || "No description provided."}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-400">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Q4 Marketing Campaign"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Brief details about this project..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectList;