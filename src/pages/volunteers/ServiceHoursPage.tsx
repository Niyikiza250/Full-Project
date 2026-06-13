import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Plus, Calendar } from 'lucide-react';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ServiceHour {
  id: string;
  volunteerName: string;
  date: string;
  hours: number;
  description: string;
  status: Status;
}

const mockHours: ServiceHour[] = [
  { id: 'h1', volunteerName: 'Jane Doe', date: '2026-06-01', hours: 4, description: 'Helped with women\'s conference setup', status: 'APPROVED' },
  { id: 'h2', volunteerName: 'Mary Smith', date: '2026-06-05', hours: 2, description: 'Visitation', status: 'PENDING' },
  { id: 'h3', volunteerName: 'John Miller', date: '2026-05-28', hours: 3, description: 'Community outreach event', status: 'REJECTED' },
  { id: 'h4', volunteerName: 'Sarah Wilson', date: '2026-06-10', hours: 5, description: 'Youth ministry leadership', status: 'APPROVED' },
];

const mockSummary = { totalHours: 48, totalEntries: 12 };

const STATUS_STYLES: Record<Status, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

const STATUS_ICONS: Record<Status, React.ReactNode> = {
  PENDING: <Clock size={12} />,
  APPROVED: <CheckCircle size={12} />,
  REJECTED: <XCircle size={12} />,
};

const isLeader = true;

const ServiceHoursPage: React.FC = () => {
  const [hours, setHours] = useState<ServiceHour[]>(mockHours);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [formDate, setFormDate] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const summary = mockSummary;

  const filtered = hours.filter((h) => {
    if (statusFilter && h.status !== statusFilter) return false;
    if (dateFrom && h.date < dateFrom) return false;
    if (dateTo && h.date > dateTo) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formHours || !formDescription.trim()) return;
    const entry: ServiceHour = {
      id: `h${Date.now()}`,
      volunteerName: 'You',
      date: formDate,
      hours: Number(formHours),
      description: formDescription,
      status: 'PENDING',
    };
    setHours((prev) => [entry, ...prev]);
    setFormDate('');
    setFormHours('');
    setFormDescription('');
    setShowForm(false);
  };

  const handleApprove = (id: string) => {
    setHours((prev) => prev.map((h) => (h.id === id ? { ...h, status: 'APPROVED' as Status } : h)));
  };

  const handleReject = (id: string) => {
    setHours((prev) => prev.map((h) => (h.id === id ? { ...h, status: 'REJECTED' as Status } : h)));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sda-blue/10 rounded-xl">
            <Clock size={22} className="text-sda-blue dark:text-sda-gold" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">Service Hours</h1>
            <p className="text-[10px] text-slate-400 font-medium">Track volunteer service hours</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all shadow-sm"
        >
          <Plus size={15} />
          {showForm ? 'Cancel' : 'Log Hours'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 shrink-0">
            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{summary.totalHours}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Total Hours This Month</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/30 shrink-0">
            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{summary.totalEntries}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Total Entries</p>
          </div>
        </div>
      </div>

      {/* Log Hours Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hours</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formHours}
                onChange={(e) => setFormHours(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
                placeholder="0.5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
                placeholder="What did you do?"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all"
            >
              <Plus size={14} />
              Log Hours
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
          />
          <span className="text-[10px] text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | '')}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Hours List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Clock size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-xs font-bold text-slate-400">No service hours found</p>
          <p className="text-[10px] text-slate-400 mt-1">Try adjusting your filters or log new hours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${STATUS_STYLES[entry.status]}`}>
                      {STATUS_ICONS[entry.status]}
                      {entry.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{entry.volunteerName}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{entry.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {entry.hours} {entry.hours === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>
                </div>
                {isLeader && entry.status === 'PENDING' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleApprove(entry.id)}
                      className="p-2 rounded-xl text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
                      title="Approve"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleReject(entry.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Reject"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceHoursPage;
