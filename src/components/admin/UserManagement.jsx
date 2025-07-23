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
  X
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  // Search functionality
  const { searchTerm, setSearchTerm, filteredData } = useSearch(users, ['username', 'email', 'role']);

  // Sort functionality
  const { sortedData, sortKey, sortOrder, handleSort } = useSort(filteredData, 'username', 'asc');

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
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      role: 'user',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingUser) {
      // Update existing user
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      ));
      toast.success('User updated successfully!');
    } else {
      // Create new user
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      toast.success('User created successfully!');
    }

    setShowModal(false);
    setFormData({
      username: '',
      email: '',
      role: 'user',
      status: 'active'
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-purple';
      case 'manager':
        return 'badge-blue';
      default:
        return 'badge-gray';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'badge-green'
      : 'badge-red';
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
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Manage users, roles, and permissions across your platform
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email or role..."
              className="input-field pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{paginatedData.length}</span> of{' '}
            <span className="font-medium">{filteredData.length}</span> users
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
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-2">
                    <span>User</span>
                    <SortIcon column="username" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    <span>Email</span>
                    <SortIcon column="email" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    <span>Role</span>
                    <SortIcon column="role" />
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
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    <span>Joined</span>
                    <SortIcon column="createdAt" />
                  </div>
                </th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((user, index) => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${index !== paginatedData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <span className="text-sm font-semibold text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{user.email}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-600">{user.createdAt}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(user)}
                        className="btn-icon-secondary"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn-icon-primary"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn-icon-danger"
                        title="Delete user"
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
                  {editingUser ? 'Edit User' : 'Add New User'}
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
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
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
      {showViewModal && viewingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-icon-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {viewingUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Username</label>
                    <p className="text-lg font-medium text-gray-900">{viewingUser.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900">{viewingUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Role</label>
                    <span className={`badge ${getRoleColor(viewingUser.role)}`}>
                      {viewingUser.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Status</label>
                    <span className={`badge ${getStatusColor(viewingUser.status)}`}>
                      {viewingUser.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Member Since</label>
                    <p className="text-gray-900">{viewingUser.createdAt}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Last Login</label>
                    <p className="text-gray-900">{viewingUser.lastLogin}</p>
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

export default UserManagement;
