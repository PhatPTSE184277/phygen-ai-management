import { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useSort } from '../../hooks/useSort';
import { usePagination } from '../../hooks/usePagination';
import { mockExams } from '../../data/mockData';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Clock,
  FileText,
  BookOpen
} from 'lucide-react';

const ExamManagement = () => {
  const [exams, setExams] = useState(mockExams);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewingExam, setViewingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    questions: '',
    difficulty: 'Beginner',
    status: 'draft'
  });

  // Search functionality
  const { searchTerm, setSearchTerm, filteredData } = useSearch(exams, ['title', 'category', 'author']);
  
  // Sort functionality
  const { sortedData, sortKey, sortOrder, handleSort } = useSort(filteredData, 'title', 'asc');
  
  // Pagination functionality
  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    goToPage, 
    nextPage, 
    prevPage, 
    hasNext, 
    hasPrev 
  } = usePagination(sortedData, 5);

  const handleCreate = () => {
    setEditingExam(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      duration: '',
      questions: '',
      difficulty: 'Beginner',
      status: 'draft'
    });
    setShowModal(true);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description,
      category: exam.category,
      duration: exam.duration.toString(),
      questions: exam.questions.toString(),
      difficulty: exam.difficulty,
      status: exam.status
    });
    setShowModal(true);
  };

  const handleView = (exam) => {
    setViewingExam(exam);
    setShowViewModal(true);
  };

  const handleDelete = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(exam => exam.id !== examId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingExam) {
      // Update existing exam
      setExams(exams.map(exam => 
        exam.id === editingExam.id 
          ? { 
              ...exam, 
              ...formData,
              duration: parseInt(formData.duration),
              questions: parseInt(formData.questions)
            }
          : exam
      ));
    } else {
      // Create new exam
      const newExam = {
        id: Math.max(...exams.map(e => e.id)) + 1,
        ...formData,
        duration: parseInt(formData.duration),
        questions: parseInt(formData.questions),
        author: 'Current User',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setExams([...exams, newExam]);
    }
    
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      duration: '',
      questions: '',
      difficulty: 'Beginner',
      status: 'draft'
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'badge-green';
      case 'intermediate':
        return 'badge-blue';
      case 'advanced':
        return 'badge-purple';
      default:
        return 'badge-gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'badge-green';
      case 'draft':
        return 'badge-gray';
      case 'archived':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <Filter className="h-4 w-4 text-gray-400" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam Management</h1>
          <p className="page-subtitle">
            Create, manage, and organize your exams and assessments
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Exam
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams by title, category or author..."
              className="input-field pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{paginatedData.length}</span> of{' '}
            <span className="font-medium">{filteredData.length}</span> exams
          </div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">
                    <span>Exam</span>
                    <SortIcon column="title" />
                  </div>
                </th>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-2">
                    <span>Category</span>
                    <SortIcon column="category" />
                  </div>
                </th>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('difficulty')}
                >
                  <div className="flex items-center gap-2">
                    <span>Difficulty</span>
                    <SortIcon column="difficulty" />
                  </div>
                </th>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center gap-2">
                    <span>Duration</span>
                    <SortIcon column="duration" />
                  </div>
                </th>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('questions')}
                >
                  <div className="flex items-center gap-2">
                    <span>Questions</span>
                    <SortIcon column="questions" />
                  </div>
                </th>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                    <SortIcon column="status" />
                  </div>
                </th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((exam, index) => (
                <tr key={exam.id} className={`hover:bg-gray-50 transition-colors ${index !== paginatedData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {exam.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {exam.author}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{exam.category}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getDifficultyColor(exam.difficulty)}`}>
                      {exam.difficulty}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration} min</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{exam.questions}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(exam)}
                        className="btn-icon-secondary"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(exam)}
                        className="btn-icon-primary"
                        title="Edit exam"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="btn-icon-danger"
                        title="Delete exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={!hasPrev}
                className="btn-secondary flex items-center gap-2 py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextPage}
                disabled={!hasNext}
                className="btn-secondary flex items-center gap-2 py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingExam ? 'Edit Exam' : 'Create New Exam'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-icon-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter exam title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field resize-none h-24"
                    placeholder="Enter exam description"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., 60"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      name="questions"
                      value={formData.questions}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., 20"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingExam ? 'Update Exam' : 'Create Exam'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingExam && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Exam Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-icon-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="h-20 w-20 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Title</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingExam.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Description</label>
                    <p className="text-gray-900">{viewingExam.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Category</label>
                      <p className="text-gray-900">{viewingExam.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Author</label>
                      <p className="text-gray-900">{viewingExam.author}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Duration</label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">{viewingExam.duration} minutes</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Questions</label>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">{viewingExam.questions} questions</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Difficulty</label>
                      <span className={`badge ${getDifficultyColor(viewingExam.difficulty)}`}>
                        {viewingExam.difficulty}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Status</label>
                      <span className={`badge ${getStatusColor(viewingExam.status)}`}>
                        {viewingExam.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Created Date</label>
                    <p className="text-gray-900">{viewingExam.createdAt}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-primary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
