import React, { useState } from 'react';
import { Medal, Award, Star, Heart, Plus } from 'lucide-react';

type RecognitionType = 'CERTIFICATE' | 'AWARD' | 'THANK_YOU' | 'SPOTLIGHT' | 'MILESTONE';

interface Recognition {
  id: string;
  volunteerName: string;
  type: RecognitionType;
  title: string;
  description: string;
  dateAwarded: string;
}

const mockRecognitions: Recognition[] = [
  { id: 'r1', volunteerName: 'Jane Doe', type: 'CERTIFICATE', title: 'Outstanding Service Award', description: 'For exceptional dedication', dateAwarded: '2026-06-01' },
  { id: 'r2', volunteerName: 'Mary Smith', type: 'THANK_YOU', title: 'Thank You for Your Service', description: 'For consistent volunteering', dateAwarded: '2026-05-15' },
  { id: 'r3', volunteerName: 'John Miller', type: 'AWARD', title: 'Volunteer of the Month', description: 'Recognized for leadership in community outreach', dateAwarded: '2026-06-10' },
];

const RECOGNITION_TYPES: RecognitionType[] = ['CERTIFICATE', 'AWARD', 'THANK_YOU', 'SPOTLIGHT', 'MILESTONE'];

const TYPE_STYLES: Record<RecognitionType, string> = {
  CERTIFICATE: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  AWARD: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  THANK_YOU: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  SPOTLIGHT: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  MILESTONE: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
};

const TYPE_ICONS: Record<RecognitionType, React.ReactNode> = {
  CERTIFICATE: <Medal size={12} />,
  AWARD: <Award size={12} />,
  THANK_YOU: <Heart size={12} />,
  SPOTLIGHT: <Star size={12} />,
  MILESTONE: <Medal size={12} />,
};

const RecognitionPage: React.FC = () => {
  const [recognitions, setRecognitions] = useState<Recognition[]>(mockRecognitions);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<RecognitionType | ''>('');

  const [formVolunteer, setFormVolunteer] = useState('');
  const [formType, setFormType] = useState<RecognitionType>('THANK_YOU');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const filtered = typeFilter ? recognitions.filter((r) => r.type === typeFilter) : recognitions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVolunteer.trim() || !formTitle.trim()) return;
    const entry: Recognition = {
      id: `r${Date.now()}`,
      volunteerName: formVolunteer,
      type: formType,
      title: formTitle,
      description: formDescription,
      dateAwarded: new Date().toISOString().slice(0, 10),
    };
    setRecognitions((prev) => [entry, ...prev]);
    setFormVolunteer('');
    setFormType('THANK_YOU');
    setFormTitle('');
    setFormDescription('');
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sda-blue/10 rounded-xl">
            <Award size={22} className="text-sda-blue dark:text-sda-gold" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">Recognition</h1>
            <p className="text-[10px] text-slate-400 font-medium">Recognize and award volunteers</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all shadow-sm"
        >
          <Plus size={15} />
          {showForm ? 'Cancel' : 'Award Recognition'}
        </button>
      </div>

      {/* Award Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volunteer Name</label>
              <input
                type="text"
                value={formVolunteer}
                onChange={(e) => setFormVolunteer(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
                placeholder="Volunteer name..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as RecognitionType)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
              >
                {RECOGNITION_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
              placeholder="Recognition title..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40 resize-none"
              placeholder="Optional description..."
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all"
            >
              <Plus size={14} />
              Award Recognition
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTypeFilter('')}
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-all ${!typeFilter ? 'bg-sda-blue text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
        >
          All
        </button>
        {RECOGNITION_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all ${typeFilter === t ? 'bg-sda-blue text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
          >
            {TYPE_ICONS[t]}
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Recognition List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Award size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-xs font-bold text-slate-400">No recognitions found</p>
          <p className="text-[10px] text-slate-400 mt-1">Award your first recognition to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${TYPE_STYLES[rec.type]}`}>
                      {TYPE_ICONS[rec.type]}
                      {rec.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{rec.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{rec.volunteerName}</p>
                  {rec.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{rec.description}</p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium mt-2">
                    Awarded {new Date(rec.dateAwarded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecognitionPage;
