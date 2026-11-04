import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Award, Clock, BarChart3,
  Plus, Search, ChevronDown, ChevronRight,
  CheckCircle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type CourseCategory = 'BIBLE_STUDY' | 'LEADERSHIP' | 'WOMENS_MINISTRY' | 'CHILDRENS_MINISTRY' | 'HEALTH' | 'MUSIC' | 'OTHER';
type CourseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type CourseStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

interface Lesson {
  id: string;
  title: string;
  sortOrder: number;
  status: 'PUBLISHED' | 'DRAFT';
  completed?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  duration: number;
  status: CourseStatus;
  lessons: Lesson[];
}

interface Certificate {
  id: string;
  courseTitle: string;
  issuedAt: string;
  certificateNumber: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Women\'s Leadership',
    description: 'Empowering women in leadership roles within the church community',
    category: 'WOMENS_MINISTRY',
    difficulty: 'INTERMEDIATE',
    duration: 240,
    status: 'PUBLISHED',
    lessons: [
      { id: 'l1', title: 'Introduction to Leadership', sortOrder: 0, status: 'PUBLISHED', completed: true },
      { id: 'l2', title: 'Leading with Purpose', sortOrder: 1, status: 'PUBLISHED', completed: true },
      { id: 'l3', title: 'Building Teams', sortOrder: 2, status: 'PUBLISHED', completed: false },
      { id: 'l4', title: 'Communication Skills', sortOrder: 3, status: 'PUBLISHED', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Bible Study Basics',
    description: 'Foundational Bible study methods for personal and group growth',
    category: 'BIBLE_STUDY',
    difficulty: 'BEGINNER',
    duration: 120,
    status: 'PUBLISHED',
    lessons: [
      { id: 'l5', title: 'Getting Started with Scripture', sortOrder: 0, status: 'PUBLISHED', completed: true },
      { id: 'l6', title: 'Historical Context', sortOrder: 1, status: 'PUBLISHED', completed: false },
      { id: 'l7', title: 'Applying the Word', sortOrder: 2, status: 'DRAFT' },
    ],
  },
  {
    id: '3',
    title: 'Advanced Music Ministry',
    description: 'Deepening musical skills for worship and ministry leadership',
    category: 'MUSIC',
    difficulty: 'ADVANCED',
    duration: 360,
    status: 'PUBLISHED',
    lessons: [
      { id: 'l8', title: 'Worship Theology', sortOrder: 0, status: 'PUBLISHED', completed: false },
    ],
  },
  {
    id: '4',
    title: 'Children\'s Ministry Foundations',
    description: 'Building a strong foundation for children\'s ministry programs',
    category: 'CHILDRENS_MINISTRY',
    difficulty: 'BEGINNER',
    duration: 180,
    status: 'DRAFT',
    lessons: [],
  },
  {
    id: '5',
    title: 'Health & Wellness Coaching',
    description: 'Holistic health principles from a Christian perspective',
    category: 'HEALTH',
    difficulty: 'INTERMEDIATE',
    duration: 300,
    status: 'PUBLISHED',
    lessons: [
      { id: 'l9', title: 'Temple of the Holy Spirit', sortOrder: 0, status: 'PUBLISHED', completed: true },
      { id: 'l10', title: 'Nutrition Basics', sortOrder: 1, status: 'PUBLISHED', completed: true },
      { id: 'l11', title: 'Physical Activity', sortOrder: 2, status: 'PUBLISHED', completed: true },
    ],
  },
  {
    id: '6',
    title: 'Discipleship Leadership',
    description: 'Training leaders to make and multiply disciples',
    category: 'LEADERSHIP',
    difficulty: 'ADVANCED',
    duration: 480,
    status: 'PUBLISHED',
    lessons: [
      { id: 'l12', title: 'The Great Commission', sortOrder: 0, status: 'PUBLISHED', completed: false },
      { id: 'l13', title: 'Mentoring Others', sortOrder: 1, status: 'PUBLISHED', completed: false },
    ],
  },
];

const mockCertificates: Certificate[] = [
  { id: 'c1', courseTitle: 'Women\'s Leadership', issuedAt: '2026-01-15', certificateNumber: 'CERT-001' },
  { id: 'c2', courseTitle: 'Bible Study Basics', issuedAt: '2026-03-22', certificateNumber: 'CERT-002' },
];

const categoryLabels: Record<CourseCategory, string> = {
  BIBLE_STUDY: 'Bible Study',
  LEADERSHIP: 'Leadership',
  WOMENS_MINISTRY: 'Women\'s Ministry',
  CHILDRENS_MINISTRY: 'Children\'s Ministry',
  HEALTH: 'Health',
  MUSIC: 'Music',
  OTHER: 'Other',
};

const difficultyColors: Record<CourseDifficulty, string> = {
  BEGINNER: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  INTERMEDIATE: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  ADVANCED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const categoryTabs: { value: CourseCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  ...Object.entries(categoryLabels).map(([value, label]) => ({ value: value as CourseCategory, label })),
];

const TrainingPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'ALL'>('ALL');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [certificates] = useState<Certificate[]>(mockCertificates);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'BIBLE_STUDY' as CourseCategory,
    difficulty: 'BEGINNER' as CourseDifficulty,
  });

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, categoryFilter]);

  const totalLessons = useMemo(
    () => courses.reduce((sum, c) => sum + c.lessons.length, 0),
    [courses]
  );
  const completedLessons = useMemo(
    () => courses.reduce((sum, c) => sum + c.lessons.filter((l) => l.completed).length, 0),
    [courses]
  );

  const handleCreateCourse = () => {
    if (!newCourse.title.trim()) return;
    const course: Course = {
      id: String(Date.now()),
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      difficulty: newCourse.difficulty,
      duration: 0,
      status: 'DRAFT',
      lessons: [],
    };
    setCourses((prev) => [course, ...prev]);
    setNewCourse({ title: '', description: '', category: 'BIBLE_STUDY', difficulty: 'BEGINNER' });
    setShowCreateForm(false);
  };

  const toggleCourse = (id: string) => {
    setExpandedCourse((prev) => (prev === id ? null : id));
  };

  const toggleLessonComplete = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              lessons: course.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson
              ),
            }
          : course
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={24} className="text-sda-blue dark:text-sda-gold" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Training & Development
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Courses, lessons, and certificates
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-sda-blue hover:bg-sda-blue-dark text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 font-bold text-sm"
        >
          <Plus size={18} />
          New Course
        </button>
      </header>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Course</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Course title"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium outline-none focus:ring-2 focus:ring-sda-blue transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Description
                  </label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Course description"
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium outline-none focus:ring-2 focus:ring-sda-blue transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Category
                  </label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, category: e.target.value as CourseCategory }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-sda-blue transition-all"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Difficulty
                  </label>
                  <select
                    value={newCourse.difficulty}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, difficulty: e.target.value as CourseDifficulty }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-sda-blue transition-all"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCourse}
                  disabled={!newCourse.title.trim()}
                  className="px-4 py-2 rounded-lg bg-sda-blue hover:bg-sda-blue-dark text-white text-sm font-bold transition-all disabled:opacity-50"
                >
                  Create Course
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium outline-none focus:ring-2 focus:ring-sda-blue transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={cn(
                'whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border',
                categoryFilter === tab.value
                  ? 'bg-sda-blue text-white border-sda-blue shadow-md shadow-sda-blue/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sda-blue/10 dark:bg-sda-blue/20 flex items-center justify-center shrink-0">
            <BookOpen size={22} className="text-sda-blue dark:text-sda-gold" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalLessons}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Lessons</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <CheckCircle size={22} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{completedLessons}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <BarChart3 size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Progress</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={20} className="text-sda-blue dark:text-sda-gold" />
          Courses ({filteredCourses.length})
        </h2>

        {filteredCourses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sda-blue/10 dark:bg-sda-blue/20 flex items-center justify-center">
                <GraduationCap size={32} className="text-sda-blue dark:text-sda-gold" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                No courses found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const completedCount = course.lessons.filter((l) => l.completed).length;
              const progress = course.lessons.length > 0
                ? Math.round((completedCount / course.lessons.length) * 100)
                : 0;

              return (
                <motion.div
                  key={course.id}
                  layout
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="w-full text-left p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sda-blue"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      {expandedCourse === course.id ? (
                        <ChevronDown size={18} className="text-slate-400 mt-1 shrink-0" />
                      ) : (
                        <ChevronRight size={18} className="text-slate-400 mt-1 shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider',
                        difficultyColors[course.difficulty]
                      )}>
                        {course.difficulty}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                        {categoryLabels[course.category]}
                      </span>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider',
                        course.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                          : course.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      )}>
                        {course.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <BookOpen size={13} />
                        {course.lessons.length} {course.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {course.duration} min
                      </span>
                    </div>

                    {course.lessons.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{completedCount}/{course.lessons.length}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sda-blue dark:bg-sda-gold rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedCourse === course.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="p-5 space-y-2">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Lessons
                          </h4>
                          {course.lessons.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No lessons yet</p>
                          ) : (
                            course.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLessonComplete(course.id, lesson.id);
                                }}
                              >
                                <div className={cn(
                                  'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                                  lesson.completed
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 group-hover:border-sda-blue'
                                )}>
                                  {lesson.completed && <CheckCircle size={12} />}
                                </div>
                                <span className={cn(
                                  'text-sm font-medium transition-colors',
                                  lesson.completed
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-700 dark:text-slate-300'
                                )}>
                                  {lesson.title}
                                </span>
                                {lesson.status === 'DRAFT' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider ml-auto">
                                    Draft
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {certificates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award size={20} className="text-sda-blue dark:text-sda-gold" />
            Certificates Earned
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-start gap-4 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Award size={22} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white">{cert.courseTitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Issued {new Date(cert.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] font-bold text-sda-blue dark:text-sda-gold mt-1 font-mono">
                    {cert.certificateNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TrainingPage;
