import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSearch } from '../../hooks/useSearch';
import { useSort } from '../../hooks/useSort';
import { usePagination } from '../../hooks/usePagination';
import { mockUsers } from '../../data/mockData';
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
    BookOpen,
    Users,
    FileText
} from 'lucide-react';
import api from '../../config/axios';
import exApi from '../../config/exApi';

const Topic = () => {
    const [allTopics, setAllTopics] = useState([]); // Store all topics from server
    const [subjects, setSubjects] = useState([]); // Store subjects for dropdown
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [viewingTopic, setViewingTopic] = useState(null);
    const [selectedTopicQuestions, setSelectedTopicQuestions] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('active');
    const [levelFilter, setLevelFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        level: 'easy',
        subjectId: '',
        parentId: null
    });

    // Search functionality
    const { searchTerm: hookSearchTerm, setSearchTerm: setHookSearchTerm, filteredData } = useSearch(allTopics, ['name', 'description']);

    // Sort functionality  
    const { sortedData, sortKey: hookSortKey, sortOrder: hookSortOrder, handleSort } = useSort(filteredData, 'name', 'asc');

    // Client-side filtering and sorting
    const getFilteredAndSortedTopics = () => {
        let filtered = allTopics;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(topic =>
                topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (topic.subjectName && topic.subjectName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply status filter (isDeleted)
        if (statusFilter === 'active') {
            filtered = filtered.filter(topic => !topic.isDeleted);
        } else if (statusFilter === 'deleted') {
            filtered = filtered.filter(topic => topic.isDeleted);
        }

        // Apply level filter
        if (levelFilter !== 'all') {
            filtered = filtered.filter(topic => topic.level === levelFilter);
        }

        // Apply subject filter
        if (subjectFilter !== 'all') {
            filtered = filtered.filter(topic => topic.subjectId.toString() === subjectFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortKey) {
                case 'name':
                    aValue = a.name?.toLowerCase() || '';
                    bValue = b.name?.toLowerCase() || '';
                    break;
                case 'level':
                    aValue = a.level || '';
                    bValue = b.level || '';
                    break;
                case 'subjectName':
                    aValue = a.subjectName || '';
                    bValue = b.subjectName || '';
                    break;
                case 'isDeleted':
                    aValue = a.isDeleted ? 1 : 0;
                    bValue = b.isDeleted ? 1 : 0;
                    break;
                case 'parentId':
                    aValue = a.parentId ?? -1;
                    bValue = b.parentId ?? -1;
                    break;
                default:
                    aValue = a[sortKey];
                    bValue = b[sortKey];
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        return filtered;
    };

    const filteredTopics = getFilteredAndSortedTopics();

    // Pagination for filtered results
    const { currentPage, totalPages, paginatedData, goToPage, nextPage, prevPage, hasNext, hasPrev } = usePagination(filteredTopics, 10);

    const fetchTopicData = async () => {
        try {
            setLoading(true);
            // Fetch all data without pagination for client-side filtering
            const response = await api.get('topics?pageSize=1000'); // Get all topics
            if (response.data.success) {
                setAllTopics(response.data.data.items);
                setTotal(response.data.data.total);
            } else {
                toast.error('Failed to fetch topics');
            }
        } catch (error) {
            console.error('Error fetching topics:', error);
            toast.error('Failed to fetch topics');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get('subjects');

            if (response.data.success) {
                setSubjects(response.data.data.items);

            } else {
                toast.error('Failed to fetch subjects');
            }
        } catch (error) {

            toast.error('Failed to fetch subjects');
        }
    };

    const fetchTopicQuestions = async (topicId) => {
        try {
            setQuestionsLoading(true);
            const response = await exApi.get(`questions/by-topic/${topicId}?page=0&size=100`);
            if (response.data.success) {
                setSelectedTopicQuestions(response.data.data.content || []);
            } else {
                toast.info('No questions for this topic');
                setSelectedTopicQuestions([]);
            }
        } catch (error) {
            toast.info('No questions for this topic');
            setSelectedTopicQuestions([]);
        } finally {
            setQuestionsLoading(false);
        }
    };

    useEffect(() => {
        fetchTopicData();
        fetchSubjects();
    }, []);

    // Handle sort
    const handleSortColumn = (column) => {
        const newOrder = sortKey === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortKey(column);
        setSortOrder(newOrder);
    };

    const handleCreate = () => {
        setEditingTopic(null);
        setFormData({
            name: '',
            description: '',
            level: 'easy',
            subjectId: '',
            parentId: null
        });
        setShowModal(true);
    };

    const handleEdit = (topic) => {
        setEditingTopic(topic);
        setFormData({
            name: topic.name,
            description: topic.description || '',
            level: topic.level,
            subjectId: topic.subjectId.toString(),
            parentId: topic.parentId
        });
        setShowModal(true);
    };

    const handleView = (topic) => {
        setViewingTopic(topic);
        setShowViewModal(true);
    };

    const handleViewQuestions = (topic) => {
        setViewingTopic(topic);
        setShowQuestionsModal(true);
        fetchTopicQuestions(topic.id);
    };


    const handleDelete = (topicId) => {
        toast.info(
            ({ closeToast }) => (
                <div>
                    <p>Are you sure you want to delete this topic?</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                            onClick={async () => {
                                try {
                                    const response = await api.patch(`topics/${topicId}`);
                                    if (response.data.success) {
                                        toast.success('Topic deleted successfully!');
                                        fetchTopicData();
                                        setStatusFilter('deleted');
                                    } else {
                                        toast.error('Failed to delete topic.');
                                    }
                                } catch (error) {
                                    toast.error('An error occurred while deleting the topic.');
                                } finally {
                                    closeToast();
                                }
                            }}
                            style={{
                                backgroundColor: '#d9534f',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Confirm
                        </button>
                        <button
                            onClick={closeToast}
                            style={{
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                                border: '1px solid #ccc',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),

        );
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                levelEnum: formData.level === 'easy' ? 1 : formData.level === 'medium' ? 2 : 3,
                subjectId: parseInt(formData.subjectId, 10),
                parentId: formData.parentId ? parseInt(formData.parentId, 10) : 0
            };

            if (editingTopic) {

                const response = await api.put(`topics/${editingTopic.id}`, payload);
                if (response.data.success) {
                    toast.success('Topic updated successfully');
                    fetchTopicData();
                    setShowModal(false);
                } else {
                    toast.error('Failed to update topic');
                }
            } else {

                const response = await api.post('topics', payload);
                if (response.data.success) {
                    toast.success('Topic created successfully');
                    fetchTopicData();
                    setShowModal(false);
                } else {
                    toast.error('Failed to create topic');

                }
            }
        } catch (error) {
            console.error('Error creating topic:', error);
            toast.error('Failed to create topic');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'easy':
                return 'badge-green';
            case 'medium':
                return 'badge-blue';
            case 'hard':
                return 'badge-red';
            default:
                return 'badge-gray';
        }
    };

    const getStatusColor = (isDeleted) => {
        return !isDeleted ? 'badge-green' : 'badge-red';
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
                    <h1 className="page-title">Topic Management</h1>
                    <p className="page-subtitle">
                        Manage all topics subjects in your platform
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Topic
                </button>
            </div>

            {/* Search and Filters */}
            <div className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search topics by name or description..."
                                className="input-field pl-11 pr-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input-field min-w-[120px]"
                            >
                                <option value="active">Active</option>
                                <option value="deleted">Inactive</option>
                            </select>

                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                className="input-field min-w-[120px]"
                            >
                                <option value="all">All Levels</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>

                            {(searchTerm || levelFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('active');
                                        setLevelFilter('all');
                                    }}
                                    className="btn-secondary whitespace-nowrap"
                                    title="Clear all filters"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">{paginatedData.length}</span> of{' '}
                        <span className="font-medium">{filteredTopics.length}</span> topics
                        {(searchTerm || levelFilter !== 'all') && (
                            <span className="text-blue-600">
                                (filtered from {total} total)
                            </span>
                        )}

                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSortColumn('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Topic Name</span>
                                        <SortIcon column="name" />
                                    </div>
                                </th>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSortColumn('subjectName')}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>Subject</span>
                                        <SortIcon column="subjectName" />
                                    </div>
                                </th>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSortColumn('level')}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>Level</span>
                                        <SortIcon column="level" />
                                    </div>
                                </th>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSortColumn('parentId')}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>Type</span>
                                        <SortIcon column="parentId" />
                                    </div>
                                </th>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSortColumn('isDeleted')}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>Status</span>
                                        <SortIcon column="isDeleted" />
                                    </div>
                                </th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="table-cell text-center py-8">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-gray-600">Loading topics...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="table-cell text-center py-8">
                                        <div className="text-gray-500">
                                            <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                            <p>No topics found</p>
                                            {(searchTerm || levelFilter !== 'all') && (
                                                <p className="text-sm mt-2">Try adjusting your search or filters</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((topic, index) => (
                                    <tr key={topic.id} className={`hover:bg-gray-50 transition-colors ${index !== paginatedData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full ${topic.parentId ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'} flex items-center justify-center shadow-md`}>
                                                    <BookOpen className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {topic.name}
                                                    </div>
                                                    {topic.parentId && (
                                                        <div className="text-xs text-gray-500">
                                                            Sub-topic
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className="text-gray-600">
                                                {topic.subjectName}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${getLevelColor(topic.level)}`}>
                                                {topic.level}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${topic.parentId ? 'badge-blue' : 'badge-purple'}`}>
                                                {topic.parentId ? 'Sub-topic' : 'Main Topic'}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${getStatusColor(topic.isDeleted)}`}>
                                                {topic.isDeleted ? 'Inactive' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleViewQuestions(topic)}
                                                    className="btn-icon-secondary"
                                                    title="View questions"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleView(topic)}
                                                    className="btn-icon-secondary"
                                                    title="View details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(topic)}
                                                    className="btn-icon-primary"
                                                    title="Edit topic"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                {!topic.isDeleted && (
                                                    <button
                                                        onClick={() => handleDelete(topic.id)}
                                                        className="btn-icon-danger"
                                                        title="Delete topic"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
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
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
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
                    <div className="modal-content">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingTopic ? 'Edit Topic' : 'Add New Topic'}
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
                                        Topic Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="Enter topic name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Level
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        name="subjectId"
                                        value={formData.subjectId}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects?.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Parent Topic
                                    </label>
                                    <select
                                        name="parentId"
                                        value={formData.parentId || ''}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="">Main Topic</option>
                                        {allTopics.map(topic => (
                                            <option key={topic.id} value={topic.id}>
                                                {topic.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary flex-1 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                {editingTopic ? 'Updating...' : 'Creating...'}
                                            </div>
                                        ) : (
                                            editingTopic ? 'Update Topic' : 'Create Topic'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn-secondary flex-1"
                                        disabled={loading}
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
            {showViewModal && viewingTopic && (
                <div className="modal-overlay bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="modal-content bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Topic Details</h3>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Topic Name</label>
                                    <p className="text-lg font-medium text-gray-900">{viewingTopic.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Subject</label>
                                    <p className="text-gray-800 bg-blue-100 px-3 py-1 rounded-md inline-block">{viewingTopic.subjectName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Level</label>
                                    <p className={`text-gray-800 px-3 py-1 rounded-md inline-block ${viewingTopic.level === 'easy' ? 'bg-green-100' : viewingTopic.level === 'medium' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                                        {viewingTopic.level}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Parent Topic</label>
                                    <p className="text-gray-800 bg-purple-100 px-3 py-1 rounded-md inline-block">
                                        {viewingTopic.parentId ? allTopics.find(t => t.id === viewingTopic.parentId)?.name || 'Unknown' : 'Main Topic'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Questions Modal */}
            {showQuestionsModal && viewingTopic && (
                <div className="modal-overlay bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="modal-content bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">Questions for Topic: {viewingTopic.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {selectedTopicQuestions.length} question(s) found
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowQuestionsModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            {questionsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Loading questions...</span>
                                </div>
                            ) : selectedTopicQuestions.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                                    <p className="text-gray-600">This topic doesn't have any questions yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedTopicQuestions.map((question, index) => (
                                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${question.type === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                                                            question.type === 'essay' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {question.type?.replace('_', ' ').toUpperCase() || 'Unknown'}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${question.difficultyLevel === 'easy' ? 'bg-green-100 text-green-800' :
                                                            question.difficultyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                question.difficultyLevel === 'hard' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {question.difficultyLevel || 'Unknown'}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${question.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            question.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {question.status === 'active' ? 'Active' :
                                                                question.status === 'inactive' ? 'Inactive' :
                                                                    'Pending'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-900 font-medium leading-relaxed">
                                                        {question.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowQuestionsModal(false)}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Topic;
