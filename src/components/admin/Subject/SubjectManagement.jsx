import { useState, useEffect } from 'react';
import api from '../../../config/axios';
import {
    Plus,
    Edit,
    Trash2,
    FolderOpen
} from 'lucide-react';
import { toast } from 'react-toastify';

const SubjectManagement = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState({ name: '', description: '', gradeEnum: '' });
    // Lấy danh sách grades cho modal tạo mới
    const openCreateModal = async () => {
        if (!grades || grades.length === 0) {
            try {
                const res = await api.get('/enums/subject-grades');
                if (res.data && res.data.data) {
                    setGrades(res.data.data);
                }
            } catch (err) {
                setGrades([]);
                console.log(err)
            }
        }
        setCreateData({ name: '', description: '', gradeEnum: '' });
        setShowCreateModal(true);
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        if (!createData.name || !createData.description || !createData.gradeEnum) return;
        try {
            const res = await api.post('/subjects', {
                name: createData.name,
                description: createData.description,
                gradeEnum: Number(createData.gradeEnum)
            });
            const newGrade = grades.find(g => g.id === Number(createData.gradeEnum));
            setSubjects([...subjects, { ...createData, id: res.data?.data?.id || Date.now(), grade: newGrade ? newGrade.name : createData.gradeEnum }]);
            toast.success(res.data?.message || 'Subject created successfully!');
            setShowCreateModal(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Create failed!');
        }
    };
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ name: '', description: '', gradeEnum: '' });
    const [grades, setGrades] = useState([]);
    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            try {
                const res = await api.get('/subjects?IsDeleted=false&Desc=false');
                console.log(res.data)
                if (res.data && res.data.data) {
                    setSubjects(res.data.data.items || []);
                }
            } catch (err) {
                setSubjects([]);
                console.error('Error fetching subject:', err)
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);


    const handleDelete = async () => {
        if (!deleteId) return;
        setShowModal(false);
        try {
            const res = await api.patch(`/subjects/${deleteId}`);
            setSubjects(subjects.filter(s => s.id !== deleteId));
            toast.success(res.data?.message || 'Subject deleted successfully!');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Delete failed!');
        } finally {
            setDeleteId(null);
        }
    };

    const openEditModal = async (subject) => {
        setEditId(subject.id);
        // Lấy danh sách grades trước để map tên sang id
        let gradesList = grades;
        if (!gradesList || gradesList.length === 0) {
            try {
                const res = await api.get('/enums/subject-grades');
                if (res.data && res.data.data) {
                    gradesList = res.data.data;
                    setGrades(gradesList);
                }
            } catch (err) {
                gradesList = [];
                setGrades([]);
                console.log(err)
            }
        }
        // Chuyển gradeEnum sang id nếu là tên
        let gradeId = subject.gradeEnum;
        if (typeof gradeId === 'string' && isNaN(Number(gradeId))) {
            const found = gradesList.find(g => g.name === gradeId);
            gradeId = found ? found.id : '';
        }
        // Nếu vẫn chưa có thì thử lấy từ subject.grade
        if (!gradeId && subject.grade) {
            const found = gradesList.find(g => g.name === subject.grade);
            gradeId = found ? found.id : '';
        }
        setEditData({
            name: subject.name || '',
            description: subject.description || '',
            gradeEnum: gradeId || ''
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!editId) return;
        try {
            const res = await api.put(`/subjects/${editId}`, {
                name: editData.name,
                description: editData.description,
                gradeEnum: Number(editData.gradeEnum)
            });
            // Hiển thị tên grade thay vì id
            const updatedGrade = grades.find(g => g.id === Number(editData.gradeEnum));
            setSubjects(subjects.map(s => s.id === editId ? { ...s, ...editData, grade: updatedGrade ? updatedGrade.name : editData.gradeEnum } : s));
            toast.success(res.data?.message || 'Subject updated successfully!');
            setShowEditModal(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Update failed!');
        } finally {
            setEditId(null);
        }
    };

    return (
        <>
            <div className="space-y-8">
                {/* Toast */}
                {toast.show && (    
                    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {toast.message}
                    </div>
                )}
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Subject Management</h1>
                        <p className="page-subtitle">
                            Create, manage, and organize your subjects
                        </p>
                    </div>
                    <button className="btn-primary flex items-center gap-2" onClick={openCreateModal}>
                        <Plus className="h-5 w-5" />
                        Create Subject
                    </button>
            {/* Modal tạo mới subject */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-md flex flex-col items-center relative animate-fade-in">
                        <div className="w-full flex flex-col items-center pt-8 pb-4 px-8">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <Plus className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create Subject</h2>
                            <p className="mb-6 text-gray-600 text-center">Fill in the information below to create a new subject.</p>
                        </div>
                        <form className="w-full px-8 pb-8 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1" htmlFor="create-name">Name</label>
                                <input id="create-name" type="text" name="name" value={createData.name} onChange={handleCreateChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition" placeholder="Enter subject name" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1" htmlFor="create-description">Description</label>
                                <input id="create-description" type="text" name="description" value={createData.description} onChange={handleCreateChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition" placeholder="Enter description" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1" htmlFor="create-grade">Grade</label>
                                <select
                                    id="create-grade"
                                    name="gradeEnum"
                                    value={createData.gradeEnum}
                                    onChange={handleCreateChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                    required
                                >
                                    <option value="" disabled>Select grade</option>
                                    {grades.map(grade => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-center gap-4 pt-2">
                                <button
                                    type="button"
                                    className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 border border-gray-300 transition"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow hover:from-green-600 hover:to-green-700 transition"
                                >
                                    Create now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
                </div>

                {/* Subjects Table */}
                <div className="card p-0">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="table-header">No</th>
                                        <th className="table-header">Subject</th>
                                        <th className="table-header">Description</th>
                                        <th className="table-header">Grade</th>
                                        <th className="table-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(5)].map((_, idx) => (
                                        <tr key={idx}>
                                            <td className="table-cell">
                                                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
                                                    <div>
                                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                            </td>
                                            <td className="table-cell">
                                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex gap-2">
                                                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                                                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="table-header">No</th>
                                        <th className="table-header">Subject</th>
                                        <th className="table-header">Description</th>
                                        <th className="table-header">Grade</th>
                                        <th className="table-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((subject) => (
                                        <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="table-cell">{subject.id}</td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                                        <FolderOpen className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{subject.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <span className="text-gray-600">{subject.description}</span>
                                            </td>
                                            <td className="table-cell">
                                                <span className="text-gray-600">{subject.grade}</span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-1">
                                                    <button className="btn-icon-primary" title="Edit subject" onClick={() => openEditModal(subject)}>
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        className="btn-icon-danger"
                                                        title="Delete subject"
                                                        onClick={() => { setDeleteId(subject.id); setShowModal(true); }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            {/* Modal xác nhận xóa đặt ngoài space-y-8 */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center relative">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Delete Subject Confirmation</h2>
                        <p className="mb-6 text-gray-700 text-center">
                            Are you sure you want to delete this subject?<br />This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-4 w-full">
                            <button
                                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                                onClick={() => { setShowModal(false); setDeleteId(null); }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition"
                                onClick={handleDelete}
                            >
                                Delete now
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal chỉnh sửa subject */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-md flex flex-col items-center relative animate-fade-in">
                        <div className="w-full flex flex-col items-center pt-8 pb-4 px-8">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                                <Edit className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Edit Subject</h2>
                            <p className="mb-6 text-gray-600 text-center">Update subject information below.</p>
                        </div>
                        <form className="w-full px-8 pb-8 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1" htmlFor="edit-name">Name</label>
                                <input id="edit-name" type="text" name="name" value={editData.name} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" placeholder="Enter subject name" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1" htmlFor="edit-description">Description</label>
                                <input id="edit-description" type="text" name="description" value={editData.description} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" placeholder="Enter description" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1" htmlFor="edit-grade">Grade</label>
                                <select
                                    id="edit-grade"
                                    name="gradeEnum"
                                    value={editData.gradeEnum}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                    required
                                >
                                    <option value="" disabled>Select grade</option>
                                    {grades.map(grade => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-center gap-4 pt-2">
                                <button
                                    type="button"
                                    className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 border border-gray-300 transition"
                                    onClick={() => { setShowEditModal(false); setEditId(null); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-700 transition"
                                >
                                    Update now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default SubjectManagement;