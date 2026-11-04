import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  X,
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  category: 'REPORT' | 'FORM' | 'GUIDELINE' | 'POLICY' | 'CURRICULUM' | 'DEVOTIONAL' | 'OTHER';
  fileUrl: string;
  fileType: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

const mockDocuments: Document[] = [
  { id: '1', title: 'Annual Report 2025', description: 'Yearly ministry report', category: 'REPORT', fileUrl: '#', fileType: 'pdf', status: 'ACTIVE', createdAt: '2025-12-31' },
  { id: '2', title: 'Women\'s Ministry Guidelines', description: 'Guidelines for running women\'s ministry', category: 'GUIDELINE', fileUrl: '#', fileType: 'pdf', status: 'ACTIVE', createdAt: '2025-06-15' },
  { id: '3', title: 'Devotional Guide', description: 'Daily devotional for women', category: 'DEVOTIONAL', fileUrl: '#', fileType: 'doc', status: 'ACTIVE', createdAt: '2026-01-10' },
];

const CATEGORIES: Document['category'][] = [
  'REPORT', 'FORM', 'GUIDELINE', 'POLICY', 'CURRICULUM', 'DEVOTIONAL', 'OTHER',
];

const CATEGORY_COLORS: Record<string, string> = {
  REPORT: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  FORM: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  GUIDELINE: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  POLICY: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  CURRICULUM: 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
  DEVOTIONAL: 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  ARCHIVED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Document['category'] | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<Document['category']>('OTHER');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formError, setFormError] = useState('');

  const filtered = documents.filter((doc) => {
    if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formTitle.trim() || !formFileUrl.trim()) {
      setFormError('Title and file URL are required');
      return;
    }
    const newDoc: Document = {
      id: String(Date.now()),
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      fileUrl: formFileUrl.trim(),
      fileType: formFileUrl.trim().split('.').pop() || 'unknown',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDocuments([newDoc, ...documents]);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('OTHER');
    setFormFileUrl('');
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sda-blue/10 rounded-xl">
            <FolderOpen size={22} className="text-sda-blue dark:text-sda-gold" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">Documents</h1>
            <p className="text-[10px] text-slate-400 font-medium">Manage and organize documents</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all shadow-sm"
        >
          <Upload size={15} />
          Upload Document
        </button>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl w-full max-w-lg mx-4 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-sda-blue" />
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Upload Document</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
                  placeholder="Document title..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40 resize-none"
                  placeholder="Brief description..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Document['category'])}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">File URL</label>
                <input
                  type="text"
                  value={formFileUrl}
                  onChange={(e) => setFormFileUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
                  placeholder="https://example.com/document.pdf"
                />
              </div>
              {formError && (
                <p className="text-[10px] font-bold text-red-500">{formError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all"
                >
                  <Upload size={14} />
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setCategoryFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
              categoryFilter === tab
                ? 'bg-sda-blue text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
        ))}
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
              categoryFilter === cat
                ? 'bg-sda-blue text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
        />
      </div>

      {/* Document List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-xs font-bold text-slate-400">No documents found</p>
          <p className="text-[10px] text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-sda-blue/5 shrink-0">
                    <FileText size={18} className="text-sda-blue dark:text-sda-gold" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold ${CATEGORY_COLORS[doc.category]}`}>
                        {doc.category}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold ${STATUS_COLORS[doc.status]}`}>
                        {doc.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white truncate">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-[9px] text-slate-400 font-medium mt-1">
                      {doc.fileType.toUpperCase()} &middot; {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {deleteConfirm === doc.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="px-2.5 py-1.5 bg-red-500 text-white rounded-xl text-[9px] font-extrabold hover:bg-red-600 transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[9px] font-extrabold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-sda-blue hover:bg-sda-blue/10 transition-all"
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => setDeleteConfirm(doc.id)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
