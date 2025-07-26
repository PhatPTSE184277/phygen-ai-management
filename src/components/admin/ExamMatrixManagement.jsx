import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Grid3X3,
} from "lucide-react";
import api from "../../config/axios";

const ExamMatrixManagement = () => {
  const [matrices, setMatrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingMatrix, setViewingMatrix] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch exam matrices with pagination
  const fetchMatrices = async (
    page = 1,
    search = "",
    sort = "id",
    order = "asc"
  ) => {
    try {
      setLoading(true);
      
      // Build query parameters theo format API
      const params = new URLSearchParams();
      params.append("PageSize", pageSize.toString());
      params.append("Page", page.toString());
      
      if (search.trim()) {
        params.append("Search", search);
      }
      
      // Sorting parameters
      params.append("SortBy", sort);
      params.append("Desc", order === "desc" ? "true" : "false");
      
      console.log('API Call:', `/exam_matrices?${params.toString()}`);

      const response = await api.get(`/exam_matrices?${params.toString()}`);
      
      console.log('API Response:', response.data);

      if (response?.data?.success) {
        const data = response.data.data;
        setMatrices(data.items || data.content || data || []);
        setTotalPages(data.totalPages || Math.ceil((data.total || data.length) / pageSize) || 0);
        setTotalElements(data.totalElements || data.total || data.length || 0);
        setCurrentPage(page);
      } else {
        // Fallback nếu không có success flag
        if (Array.isArray(response.data)) {
          const allData = response.data;
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedData = allData.slice(startIndex, endIndex);
          
          setMatrices(paginatedData);
          setTotalPages(Math.ceil(allData.length / pageSize));
          setTotalElements(allData.length);
          setCurrentPage(page);
        } else {
          setMatrices([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      }
    } catch (e) {
      console.error("Error fetching matrices:", e);
      console.error("Full error details:", {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data,
        url: e.config?.url
      });
      toast.error("Failed to fetch exam matrices");
      setMatrices([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchMatrices(1, value, sortKey, sortOrder);
  };

  // Handle sort
  const handleSort = (column) => {
    const newOrder = sortKey === column && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(column);
    setSortOrder(newOrder);
    fetchMatrices(currentPage, searchTerm, column, newOrder);
  };

  // Handle page navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchMatrices(page, searchTerm, sortKey, sortOrder);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const hasNext = () => currentPage < totalPages;
  const hasPrev = () => currentPage > 1;

  const handleView = (matrix) => {
    console.log(matrix);
    setViewingMatrix(matrix);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "badge-green";
      case "inactive":
        return "badge-red";
      default:
        return "badge-gray";
    }
  };

  const formatCreatedAt = (createAtArray) => {
    if (!createAtArray) {
      return "N/A";
    }

    if (!Array.isArray(createAtArray)) {
      if (typeof createAtArray === "string") {
        try {
          const date = new Date(createAtArray);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Ho_Chi_Minh"
          });
        } catch {
          return createAtArray;
        }
      }
      return "Invalid Format";
    }

    if (createAtArray.length < 6) {
      return "Incomplete Date";
    }

    try {
      const [year, month, day, hour, minute, second] = createAtArray;

      if (!year || !month || !day) {
        return "Invalid Date";
      }

      const date = new Date(
        year,
        month - 1,
        day,
        hour || 0,
        minute || 0,
        second || 0
      );

      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Ho_Chi_Minh"
      });
    } catch {
      return "Error";
    }
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
    fetchMatrices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam Matrix Management</h1>
          <p className="page-subtitle">
            Manage and configure exam matrices for different subjects and types
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search matrices by ID or type..."
              className="input-field pl-11"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{matrices.length}</span> of{" "}
            <span className="font-medium">{totalElements}</span> matrices
          </div>
        </div>
      </div>

      {/* Matrices Table */}
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
                    <span>Matrix ID</span>
                    <SortIcon column="id" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("subjectId")}
                >
                  <div className="flex items-center gap-2">
                    <span>Subject ID</span>
                    <SortIcon column="subjectId" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("examtype")}
                >
                  <div className="flex items-center gap-2">
                    <span>Exam Type</span>
                    <SortIcon column="examtype" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("createdBy")}
                >
                  <div className="flex items-center gap-2">
                    <span>Created By</span>
                    <SortIcon column="createdBy" />
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
                      Loading matrices...
                    </div>
                  </td>
                </tr>
              ) : matrices && matrices.length > 0 ? (
                matrices.map((matrix, index) => (
                  <tr
                    key={matrix?.id || index}
                    className={`hover:bg-gray-50 transition-colors ${
                      index !== matrices.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <td className="table-cell">
                      <span className="text-gray-600">{matrix?.id}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600">
                        {matrix?.subjectId || "N/A"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600">
                        {matrix?.examtype || matrix?.examType || "N/A"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600">
                        {formatCreatedAt(matrix?.createdBy)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(matrix?.status)}`}>
                        {matrix?.status || "N/A"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(matrix)}
                          className="btn-icon-secondary"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
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
                      <Grid3X3 className="h-12 w-12 text-gray-300" />
                      <p className="text-lg font-medium">No matrices found</p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Create your first exam matrix to get started"}
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
                disabled={!hasPrev()}
                className="btn-secondary flex items-center gap-2 py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else {
                    if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                  }

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
                disabled={!hasNext()}
                className="btn-secondary flex items-center gap-2 py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && viewingMatrix && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Matrix Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-icon-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">
                      Matrix ID
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewingMatrix.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Subject ID
                      </label>
                      <p className="text-gray-900">{viewingMatrix.subjectId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Exam Type
                      </label>
                      <p className="text-gray-900">
                        {viewingMatrix.examtype || viewingMatrix.examType}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Created By
                      </label>
                      <p className="text-gray-900">
                        {formatCreatedAt(viewingMatrix.createdBy)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Status
                      </label>
                      <span
                        className={`badge ${getStatusColor(
                          viewingMatrix?.status
                        )}`}
                      >
                        {viewingMatrix?.status || "N/A"}
                      </span>
                    </div>
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

export default ExamMatrixManagement;