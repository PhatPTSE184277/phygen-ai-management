import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useSearch } from "../../hooks/useSearch";
import { useSort } from "../../hooks/useSort";
import { usePagination } from "../../hooks/usePagination";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileText,
  ArrowLeft,
} from "lucide-react";
import exApi from "../../config/exApi";
import api from "../../config/axios";

const UserExams = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");

  const [exams, setExams] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExam, setViewingExam] = useState(null);
  const [examVersions, setExamVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Search functionality - cập nhật để phù hợp với API fields
  const { searchTerm, setSearchTerm, filteredData } = useSearch(exams || [], [
    "id",
    "examType",
    "createdAt",
  ]);

  // Sort functionality
  const { sortedData, sortKey, sortOrder, handleSort } = useSort(
    filteredData,
    "id",
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

  const handleView = async (exam) => {
    console.log(exam);
    setViewingExam(exam);
    setShowViewModal(true);
    fetchExamVersions(exam?.id);
  };

  const fetchExamVersions = async (examId) => {
    try {
      setLoadingVersions(true);
      const response = await exApi.get(`exam-versions/by-exam/${examId}`);
      console.log("Exam versions response:", response);
      setExamVersions(response?.data?.data?.content || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch exam versions");
    } finally {
      setLoadingVersions(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "badge-green";

      default:
        return "badge-gray";
    }
  };

  const formatCreatedAt = (createAtArray) => {
    console.log("formatCreatedAt input:", createAtArray);

    if (!createAtArray) {
      console.log("createAtArray is null/undefined");
      return "N/A";
    }

    if (!Array.isArray(createAtArray)) {
      console.log("createAtArray is not an array:", typeof createAtArray);
      // Nếu là string, có thể là ISO date
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
          });
        } catch {
          return createAtArray;
        }
      }
      return "Invalid Format";
    }

    if (createAtArray.length < 6) {
      console.log("createAtArray length insufficient:", createAtArray.length);
      return "Incomplete Date";
    }

    try {
      const [year, month, day, hour, minute, second] = createAtArray;

      if (!year || !month || !day) {
        console.log("Invalid date components:", { year, month, day });
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
        console.log("Invalid date created");
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      console.error("Error formatting date");
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
  const fetchUserInfor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`account_admins/${userId}`);
      console.log("User exams response:", response?.data?.data);
      setUserInfo(response?.data?.data);
    } catch (error) {
      console.error("Error fetching user exams:", error);
      toast.error("Failed to fetch user exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserExams = async () => {
    console.log(userId);
    try {
      setLoading(true);
      const response = await exApi.get(`exams/by-account/${userId}`);
      console.log("User exams response:", response);
      setExams(response?.data?.data?.content || []);
    } catch (error) {
      console.error("Error fetching user exams:", error);
      toast.error("Failed to fetch user exams");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchUserInfor();
      fetchUserExams();
    }
  }, [userId]);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}  
            className="btn-icon-secondary"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="page-title">
              {userInfo ? `${userInfo.username}'s Exams` : "User Exams"}
            </h1>
            <p className="page-subtitle">
              View and manage exams created by this user
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search user's exams by ID, type or created date..."
              className="input-field pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{paginatedData.length}</span> of{" "}
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
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-2">
                    <span>Exam ID</span>
                    <SortIcon column="id" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("examType")}
                >
                  <div className="flex items-center gap-2">
                    <span>Exam Type</span>
                    <SortIcon column="examType" />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    <span>Create At</span>
                    <SortIcon column="createdAt" />
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
                <th
                  className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("draft")}
                >
                  <div className="flex items-center gap-2">
                    <span>Draft</span>
                    <SortIcon column="draft" />
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
                      Loading exams...
                    </div>
                  </td>
                </tr>
              ) : paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((exam, index) => (
                  <tr
                    key={exam?.id || index}
                    className={`hover:bg-gray-50 transition-colors ${
                      index !== paginatedData.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <td className="table-cell">
                      <span className="text-gray-600">{exam?.id}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600">
                        {exam?.examType || "N/A"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600">
                        {formatCreatedAt(exam?.createdAt)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(exam?.status)}`}>
                        {exam?.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600">
                        {exam?.draft !== undefined
                          ? exam.draft
                            ? "True"
                            : "False"
                          : "N/A"}
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
                      <FileText className="h-12 w-12 text-gray-300" />
                      <p className="text-lg font-medium">No exams found</p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "This user hasn't created any exams yet"}
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
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

      {/* View Modal */}
      {showViewModal && viewingExam && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Exam Details
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
                      Exam ID
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewingExam.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Exam Type
                      </label>
                      <p className="text-gray-900">{viewingExam.examType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Status
                      </label>
                      <span
                        className={`badge ${getStatusColor(
                          viewingExam?.status
                        )}`}
                      >
                        {viewingExam?.status || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Created Date
                      </label>
                      <p className="text-gray-900">
                        {formatCreatedAt(viewingExam.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Draft Status
                      </label>
                      <span
                        className={`badge ${
                          viewingExam?.draft ? "badge-blue" : "badge-green"
                        }`}
                      >
                        {viewingExam?.draft ? "Draft" : "Published"}
                      </span>
                    </div>
                  </div>

                  {/* Exam Versions Section */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Exam Versions
                    </h4>
                    {loadingVersions ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                          Loading versions...
                        </span>
                      </div>
                    ) : examVersions && examVersions.length > 0 ? (
                      <div className="space-y-3">
                        {examVersions.map((version, index) => (
                          <div
                            key={version.id || index}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                  Version ID
                                </label>
                                <p className="text-sm font-medium text-gray-900">
                                  {version.id}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                  Version Code
                                </label>
                                <p className="text-sm text-gray-900">
                                  {version.versionCode || "N/A"}
                                </p>
                              </div>
                            </div>
                            {version.pdfUrl && (
                              <div className="mt-3">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                  PDF Document
                                </label>
                                <a
                                  href={version.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  <FileText className="h-4 w-4" />
                                  View PDF
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p>No versions found for this exam</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setExamVersions([]);
                    setLoadingVersions(false);
                  }}
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

export default UserExams;
