import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useSearch } from "../../hooks/useSearch";
import { useSort } from "../../hooks/useSort";
import { usePagination } from "../../hooks/usePagination";
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
} from "lucide-react";
import api from "../../config/axios";

const roleOptions = [
  { label: "User", value: 1 },
  { label: "Manager", value: 3 },
  { label: "Admin", value: 2 },
];

const accountTypeOptions = [
  { label: "Free", value: 1 },
  { label: "Premium", value: 2 },
];

const statusOptions = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 2 },
];

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: roleOptions[0].value,
    status: statusOptions[0].value,
    accountType: accountTypeOptions[0].value,
    emailVerified: true,
    password: "",
  });
  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("account_admins", {
        params: {
          Page: 1,
          PageSize: 1000,
        },
      });
      console.log(response?.data?.data);
      setUsers(response?.data?.data?.items || []);
    } catch (e) {
      console.log("Error", e);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };
  // Search functionality

  const { searchTerm, setSearchTerm, filteredData } = useSearch(users, [
    "id",
    "username",
    "email",
  ]);

  // Sort functionality
  const { sortedData, sortKey, sortOrder, handleSort } = useSort(
    filteredData,
    "username",
    "asc"
  );

  // Pagination functionality
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = usePagination(sortedData, 10);

  // Helper functions
  const getRoleLabel = (roleValue) => {
    const role = roleOptions.find((r) => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getAccountTypeLabel = (accountTypeValue) => {
    const accountType = accountTypeOptions.find(
      (a) => a.value === accountTypeValue
    );
    return accountType ? accountType.label : accountTypeValue;
  };

  const getStatusLabel = (statusValue) => {
    const status = statusOptions.find((s) => s.value === statusValue);
    return status ? status.label : statusValue;
  };

  const getRoleColor = (role) => {
    const roleLabel = typeof role === "number" ? getRoleLabel(role) : role;
    switch (roleLabel?.toLowerCase()) {
      case "admin":
        return "badge-purple";
      case "manager":
        return "badge-blue";
      default:
        return "badge-gray";
    }
  };

  const getStatusColor = (status) => {
    const statusLabel =
      typeof status === "number" ? getStatusLabel(status) : status;
    return statusLabel?.toLowerCase() === "active"
      ? "badge-green"
      : "badge-red";
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      role: roleOptions[0].value,
      emailVerified: true,
      accountType: accountTypeOptions[0].value,
      status: statusOptions[0].value,
      password: "",
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    console.log(user);
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      role: user.roleEnum,
      emailVerified:
        user.emailVerified !== undefined ? user.emailVerified : true,
      accountType: user.accountTypeEnum,
      status: user.statusEnum,
      password: "",
    });
    setShowModal(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleViewUserExams = (userId) => {
    navigate(`/admin/users/exams?userId=${userId}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`account_admins/${userId}`);
        toast.success("User deleted successfully!");
        fetchUsers();
      } catch (error) {
        toast.error(
          "Delete failed: " + (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingUser) {
      // Update existing user - API cần accountStatus
      const updatePayload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        emailVerified: formData.emailVerified,
        accountType: formData.accountType,
        accountStatus: formData.status, // API update cần accountStatus
      };

      try {
        const response = await api.put(
          `account_admins/${editingUser?.id}/info`,
          updatePayload
        );
        console.log(response);
        toast.success("User updated successfully!");
        setShowModal(false);
        fetchUsers();
      } catch (error) {
        toast.error(
          "Update failed: " + (error.response?.data?.message || error.message)
        );
      }
    } else {
      // Create new user - API tạo mới không cần status
      const createPayload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        emailVerified: formData.emailVerified,
        accountType: formData.accountType,
        password: formData.password,
      };

      try {
        const response = await api.post("account_admins", createPayload);
        console.log(response);
        toast.success("User created successfully!");
        setShowModal(false);
        fetchUsers();
      } catch (error) {
        toast.error(
          "Create failed: " + (error.response?.data?.message || error.message)
        );
      }
    }

    setFormData({
      username: "",
      password: "",
      email: "",
      emailVerified: true,
      role: roleOptions[0].value,
      accountType: accountTypeOptions[0].value,
      status: statusOptions[0].value,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["role", "accountType", "status"];

    setFormData({
      ...formData,
      [name]: numericFields.includes(name) ? Number(value) : value,
    });
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <Filter className="h-4 w-4 text-gray-400" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    );
  };

  SortIcon.propTypes = {
    column: PropTypes.string.isRequired,
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
              placeholder="Search users by id, name or email..."
              className="input-field pl-11"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{paginatedData.length}</span> of{" "}
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
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-2">
                    <span>User ID</span>
                    <SortIcon column="id" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center gap-2">
                    <span>User Name</span>

                    <SortIcon column="username" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-2">
                    <span>Email</span>
                    <SortIcon column="email" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-2">
                    <span>Role</span>
                    <SortIcon column="role" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("status")}
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
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="table-cell text-center text-gray-500 py-8"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index !== paginatedData.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <td className="table-cell">
                      <span className="text-gray-600">{user.id}</span>
                    </td>
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
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="table-cell text-center text-gray-500 py-8"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-12 w-12 text-gray-300" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Create your first user to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-600">
                Page{" "}
                <span className="font-semibold text-gray-900">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {totalPages}
                </span>
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
                {Array.from({ length: 5 }, (_, i) => {
                  let start = Math.max(1, currentPage - 2);
                  let end = Math.min(totalPages, start + 4);

                  if (end - start < 4) {
                    start = Math.max(1, end - 4);
                  }

                  const page = start + i;
                  if (page > totalPages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
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
                  {editingUser ? "Edit User" : "Add New User"}
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
                    value={formData.username || ""}
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
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role || roleOptions[0].value}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType || accountTypeOptions[0].value}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {accountTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {editingUser && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || statusOptions[0].value}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingUser ? "Update User" : "Create User"}
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
                <h3 className="text-xl font-bold text-gray-900">
                  User Details
                </h3>
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
                    <label className="block text-sm font-semibold text-gray-500 mb-1">
                      Username
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {viewingUser.username}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{viewingUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">
                      Account Type
                    </label>
                    <p className="text-gray-900">
                      {getAccountTypeLabel(viewingUser.accountType)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">
                      Role
                    </label>
                    <span className={`badge ${getRoleColor(viewingUser.role)}`}>
                      {getRoleLabel(viewingUser.role)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">
                      Status
                    </label>
                    <span
                      className={`badge ${getStatusColor(viewingUser.status)}`}
                    >
                      {getStatusLabel(viewingUser.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">
                      School
                    </label>
                    <p className="text-gray-900">
                      {viewingUser.school || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => handleViewUserExams(viewingUser.id)}
                  className="btn-primary w-full"
                >
                  View exams created
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
