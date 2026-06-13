import React, { useState } from 'react';
import { MessagesSquare, MessageCircle, Pin, Plus, Reply, Search } from 'lucide-react';

type ForumCategory = 'GENERAL' | 'PRAYER' | 'STUDY' | 'MINISTRY' | 'ANNOUNCEMENTS';

interface Forum {
  id: string;
  title: string;
  description: string;
  category: ForumCategory;
  postCount: number;
  lastActivityAt: string;
}

interface ReplyData {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface Thread {
  id: string;
  forumId: string;
  authorName: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  replies: ReplyData[];
}

const mockForums: Forum[] = [
  { id: 'f1', title: 'Prayer Requests', description: 'Share your prayer requests and praise reports with the community', category: 'PRAYER', postCount: 15, lastActivityAt: '2026-06-10' },
  { id: 'f2', title: 'Bible Study Discussion', description: 'Discuss weekly Bible study topics and share insights', category: 'STUDY', postCount: 8, lastActivityAt: '2026-06-08' },
  { id: 'f3', title: 'Ministry Updates', description: 'Updates and coordination for various ministry activities', category: 'MINISTRY', postCount: 12, lastActivityAt: '2026-06-09' },
  { id: 'f4', title: 'General Fellowship', description: 'Open discussions and fellowship among members', category: 'GENERAL', postCount: 22, lastActivityAt: '2026-06-11' },
  { id: 'f5', title: 'Church Announcements', description: 'Official announcements from church leadership', category: 'ANNOUNCEMENTS', postCount: 6, lastActivityAt: '2026-06-07' },
];

const mockThreads: Thread[] = [
  { id: 'p1', forumId: 'f1', authorName: 'Jane Doe', body: 'Please pray for our upcoming women\'s retreat this weekend. We are expecting 45 women from across the conference. Pray for safe travel and spiritual refreshment.', isPinned: true, createdAt: '2026-06-01', replies: [
    { id: 'r1', authorName: 'Mary Smith', body: 'Praying for your retreat! May God pour out His Spirit.', createdAt: '2026-06-02' },
    { id: 'r2', authorName: 'Pastor John', body: 'Amen. Will be lifting this up in our Friday prayer meeting.', createdAt: '2026-06-03' },
  ]},
  { id: 'p2', forumId: 'f1', authorName: 'Mary Smith', body: 'Requesting prayers for my family as we navigate a difficult health situation with my mother. She was diagnosed with cancer last week.', isPinned: false, createdAt: '2026-06-05', replies: [
    { id: 'r3', authorName: 'Sarah Williams', body: 'So sorry to hear this. Your family is in our prayers.', createdAt: '2026-06-05' },
  ]},
  { id: 'p3', forumId: 'f2', authorName: 'David Kim', body: 'This week we are studying Ephesians chapter 3. Paul\'s prayer for spiritual strength is so powerful. What verses stood out to you?', isPinned: true, createdAt: '2026-06-01', replies: [] },
  { id: 'p4', forumId: 'f2', authorName: 'Rebecca Torres', body: 'Looking for commentaries on the book of Daniel for our small group study. Any recommendations?', isPinned: false, createdAt: '2026-06-07', replies: [] },
  { id: 'p5', forumId: 'f3', authorName: 'Michael Brown', body: 'The food distribution team needs volunteers this Saturday from 8am to 12pm. Please sign up if you can help.', isPinned: true, createdAt: '2026-05-28', replies: [] },
  { id: 'p6', forumId: 'f4', authorName: 'Grace Lee', body: 'Welcome to all new members who joined this month! We would love to hear your introductions and how you found our church.', isPinned: true, createdAt: '2026-06-01', replies: [] },
];

const CATEGORY_COLORS: Record<ForumCategory, string> = {
  GENERAL: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  PRAYER: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  STUDY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  MINISTRY: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  ANNOUNCEMENTS: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
};

const ForumsPage: React.FC = () => {
  const [selectedForumId, setSelectedForumId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThreadBody, setNewThreadBody] = useState('');
  const [newThreadAuthor, setNewThreadAuthor] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set(mockThreads.filter((t) => t.isPinned).map((t) => t.id)));
  const [threads, setThreads] = useState<Thread[]>(mockThreads);

  const selectedForum = selectedForumId ? mockForums.find((f) => f.id === selectedForumId) : null;

  const forumThreads = threads
    .filter((t) => t.forumId === selectedForumId)
    .filter((t) => search === '' || t.body.toLowerCase().includes(search.toLowerCase()) || t.authorName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (pinnedIds.has(a.id) && !pinnedIds.has(b.id)) return -1;
      if (!pinnedIds.has(a.id) && pinnedIds.has(b.id)) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadBody.trim() || !newThreadAuthor.trim() || !selectedForumId) return;
    const newThread: Thread = {
      id: `p${Date.now()}`,
      forumId: selectedForumId,
      authorName: newThreadAuthor,
      body: newThreadBody,
      isPinned: false,
      createdAt: new Date().toISOString().split('T')[0],
      replies: [],
    };
    setThreads([newThread, ...threads]);
    setNewThreadBody('');
    setNewThreadAuthor('');
    setShowCreateThread(false);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !replyTargetId) return;
    const newReply: ReplyData = {
      id: `r${Date.now()}`,
      authorName: 'Current User',
      body: replyBody,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setThreads(threads.map((t) =>
      t.id === replyTargetId ? { ...t, replies: [...t.replies, newReply] } : t
    ));
    setReplyBody('');
    setReplyTargetId(null);
  };

  const togglePin = (threadId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
  };

  const getReplyCount = (threadId: string) => threads.find((t) => t.id === threadId)?.replies.length ?? 0;

  if (selectedForum) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedForumId(null); setSearch(''); setShowCreateThread(false); setReplyTargetId(null); }}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <MessagesSquare size={18} />
            </button>
            <div className="p-2.5 bg-sda-blue/10 rounded-xl">
              <MessageCircle size={22} className="text-sda-blue dark:text-sda-gold" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">{selectedForum.title}</h1>
              <p className="text-[10px] text-slate-400 font-medium">{selectedForum.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateThread(!showCreateThread)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all shadow-sm"
          >
            <Plus size={15} />
            {showCreateThread ? 'Cancel' : 'New Thread'}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threads..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
          />
        </div>

        {/* Create Thread Form */}
        {showCreateThread && (
          <form onSubmit={handleCreateThread} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                value={newThreadAuthor}
                onChange={(e) => setNewThreadAuthor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
                placeholder="Your name..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
              <textarea
                value={newThreadBody}
                onChange={(e) => setNewThreadBody(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40 resize-none"
                placeholder="Share your thoughts or request..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all"
              >
                <MessageCircle size={14} />
                Post Thread
              </button>
            </div>
          </form>
        )}

        {/* Thread List */}
        {forumThreads.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-xs font-bold text-slate-400">No threads found</p>
            <p className="text-[10px] text-slate-400 mt-1">Start a new discussion or adjust your search</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forumThreads.map((thread) => {
              const isReplying = replyTargetId === thread.id;
              return (
                <div
                  key={thread.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {pinnedIds.has(thread.id) && (
                            <Pin size={12} className="text-sda-blue dark:text-sda-gold fill-sda-blue dark:fill-sda-gold" />
                          )}
                          <span className="text-[10px] font-bold text-slate-400">
                            {thread.authorName}
                          </span>
                          <span className="text-[9px] text-slate-400">&middot;</span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(thread.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {thread.body}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePin(thread.id)}
                          className={`p-2 rounded-xl transition-all ${pinnedIds.has(thread.id) ? 'text-sda-blue dark:text-sda-gold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                          title={pinnedIds.has(thread.id) ? 'Unpin' : 'Pin thread'}
                        >
                          <Pin size={14} />
                        </button>
                        <button
                          onClick={() => setReplyTargetId(isReplying ? null : thread.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-sda-blue dark:hover:text-sda-gold transition-all"
                          title="Reply"
                        >
                          <Reply size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Reply Count */}
                    {getReplyCount(thread.id) > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <MessageCircle size={11} />
                        {getReplyCount(thread.id)} {getReplyCount(thread.id) === 1 ? 'reply' : 'replies'}
                      </div>
                    )}

                    {/* Replies */}
                    {thread.replies.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        {thread.replies.map((reply) => (
                          <div key={reply.id} className="pl-3 border-l-2 border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{reply.authorName}</span>
                              <span className="text-[9px] text-slate-400">&middot;</span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{reply.body}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {isReplying && (
                      <form onSubmit={handleReply} className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          rows={2}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40 resize-none"
                          placeholder="Write a reply..."
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-4 py-2 bg-sda-blue text-white rounded-xl text-[10px] font-bold hover:bg-sda-blue-dark transition-all"
                          >
                            <Reply size={12} />
                            Reply
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-sda-blue/10 rounded-xl">
          <MessagesSquare size={22} className="text-sda-blue dark:text-sda-gold" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">Discussion Forums</h1>
          <p className="text-[10px] text-slate-400 font-medium">Browse and participate in forum discussions</p>
        </div>
      </div>

      {/* Forum List */}
      <div className="grid grid-cols-1 gap-4">
        {mockForums.map((forum) => (
          <button
            key={forum.id}
            onClick={() => setSelectedForumId(forum.id)}
            className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold ${CATEGORY_COLORS[forum.category]}`}>
                    {forum.category}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{forum.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{forum.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-extrabold text-sda-blue dark:text-sda-gold">{forum.postCount}</span>
                <span className="text-[9px] text-slate-400 font-medium">posts</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 font-medium">
                Last activity: {new Date(forum.lastActivityAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ForumsPage;
