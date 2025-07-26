import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import {
    Search,
    Trash2,
    Filter,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    FileText,
} from "lucide-react";
import exApi from "../../config/exApi";
import api from "../../config/axios";

const MatrixSection = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingExam, setViewingExam] = useState(null);
    const [examVersions, setExamVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortKey, setSortKey] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    // Fetch exams with pagination
    const fetchExams = async (
        page = 1,
        search = "",
        sort = "id",
        order = "asc"
    ) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                Page: page.toString(),
                PageSize: pageSize.toString(),
                sortBy: sort,
                sortDir: order,
            });

            if (search.trim()) {
                params.append("search", search);
            }

            const response = await api.get(`matrix_sections?${params.toString()}`);

            if (response?.data?.success) {
                const data = response.data.data;
                setExams(data.items || []);
                setTotalPages(Math.ceil(data.total / pageSize) || 0);
                setTotalElements(data.total || 0);
                setCurrentPage(page);
            } else {
                setExams([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (e) {
            setExams([]);
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
        fetchExams(1, value, sortKey, sortOrder);
    };

    // Handle sort
    const handleSort = (column) => {
        const newOrder = sortKey === column && sortOrder === "asc" ? "desc" : "asc";
        setSortKey(column);
        setSortOrder(newOrder);
        fetchExams(currentPage, searchTerm, column, newOrder);
    };

    // Handle page navigation
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchExams(page, searchTerm, sortKey, sortOrder);
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

    const handleView = async (section) => {
        console.log(section);
        setViewingExam(section);
        setShowViewModal(true);
    };

    const fetchExamVersions = async (examId) => {
        try {
            setLoadingVersions(true);
            const response = await exApi.get(`exam-versions/by-exam/${examId}`);
            setExamVersions(response?.data?.data?.content || []);
        } catch (error) {
            toast.error("Failed to fetch exam versions");
            setExamVersions([]);
        } finally {
            setLoadingVersions(false);
        }
    };

    // const handleDelete = (examId) => {
    //   toast.info(
    //     ({ closeToast }) => (
    //       <div>
    //         <p>Are you sure you want to delete this exam?</p>
    //         <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
    //           <button
    //             onClick={async () => {
    //               try {
    //                 const response = await exApi.delete(`exams/${examId}`);
    //                 if (response.data.success) {
    //                   toast.success('Exam deleted successfully');
    //                   fetchExams(currentPage, searchTerm, sortKey, sortOrder);
    //                 } else {
    //                   toast.error('Failed to delete exam');
    //                 }
    //               } catch (error) {
    //                 toast.error('Failed to delete exam');
    //               } finally {
    //                 closeToast();
    //               }
    //             }}
    //             style={{
    //               backgroundColor: '#d9534f',
    //               color: '#fff',
    //               border: 'none',
    //               padding: '6px 12px',
    //               borderRadius: '4px',
    //               cursor: 'pointer',
    //             }}
    //           >
    //             Confirm
    //           </button>
    //           <button
    //             onClick={closeToast}
    //             style={{
    //               backgroundColor: '#f0f0f0',
    //               color: '#333',
    //               border: '1px solid #ccc',
    //               padding: '6px 12px',
    //               borderRadius: '4px',
    //               cursor: 'pointer',
    //             }}
    //           >
    //             Cancel
    //           </button>
    //         </div>
    //       </div>
    //     ),

    //   );
    // };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "active":
                return "badge-green";
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
        fetchExams();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Matrix Section Management</h1>
                    <p className="page-subtitle">
                        Manage matrix sections and their configurations
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
                            placeholder="Search matrix sections..."
                            className="input-field pl-11"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">{exams.length}</span> of{" "}
                        <span className="font-medium">{totalElements}</span> sections
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
                                        <span>ID</span>
                                        <SortIcon column="id" />
                                    </div>
                                </th>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort("matrixId")}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>Matrix ID</span>
                                        <SortIcon column="matrixId" />
                                    </div>
                                </th>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort("sectionName")}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>Section Name</span>
                                        <SortIcon column="sectionName" />
                                    </div>
                                </th>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort("displayOrder")}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>Display Order</span>
                                        <SortIcon column="displayOrder" />
                                    </div>
                                </th>
                                <th
                                    className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort("isDeleted")}
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
                                    <td
                                        colSpan="6"
                                        className="table-cell text-center text-gray-500 py-8"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            Loading sections...
                                        </div>
                                    </td>
                                </tr>
                            ) : exams && exams.length > 0 ? (
                                exams.map((section, index) => (
                                    <tr
                                        key={section?.id || index}
                                        className={`hover:bg-gray-50 transition-colors ${index !== exams.length - 1
                                            ? "border-b border-gray-100"
                                            : ""
                                            }`}
                                    >
                                        <td className="table-cell">
                                            <span className="text-gray-600">{section?.id}</span>
                                        </td>
                                        <td className="table-cell">
                                            <span className="text-gray-600">{section?.matrixId}</span>
                                        </td>
                                        <td className="table-cell">
                                            <span className="text-gray-600">{section?.sectionName}</span>
                                        </td>
                                        <td className="table-cell">
                                            <span className="text-gray-600">{section?.displayOrder}</span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${section?.isDeleted ? 'badge-red' : 'badge-green'}`}>
                                                {section?.isDeleted ? 'Deleted' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleView(section)}
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
                                            <p className="text-lg font-medium">No sections found</p>
                                            <p className="text-sm">
                                                {searchTerm
                                                    ? "Try adjusting your search criteria"
                                                    : "No matrix sections available"}
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
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
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
            {showViewModal && viewingExam && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Matrix Section Details
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
                                            Section ID
                                        </label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {viewingExam.id}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-500 mb-1">
                                                Matrix ID
                                            </label>
                                            <p className="text-gray-900">{viewingExam.matrixId}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-500 mb-1">
                                                Display Order
                                            </label>
                                            <p className="text-gray-900">{viewingExam.displayOrder}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-500 mb-1">
                                                Section Name
                                            </label>
                                            <p className="text-gray-900">
                                                {viewingExam.sectionName}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-500 mb-1">
                                                Status
                                            </label>
                                            <span
                                                className={`badge ${viewingExam?.isDeleted ? "badge-red" : "badge-green"
                                                    }`}
                                            >
                                                {viewingExam?.isDeleted ? "Deleted" : "Active"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setViewingExam(null);
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

export default MatrixSection;
