import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSearch } from "../../hooks/useSearch";
import { useSort } from "../../hooks/useSort";
import { usePagination } from "../../hooks/usePagination";
import { mockUsers } from "../../data/mockData";
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
  Upload,
  FileText,
  Download,
  CheckSquare,
  XCircle,
} from "lucide-react";
import api from "../../config/axios";
import exApi from "../../config/exApi";

const Question = () => {
  const [activeTab, setActiveTab] = useState("questions"); // 'questions' or 'files'
  const [allQuestions, setAllQuestions] = useState([]); // Store all questions from server
  const [allTopics, setAllTopics] = useState([]); // Store all topics for dropdown
  const [questionFiles, setQuestionFiles] = useState([]); // Store question files
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("content");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("active");
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjects, setSubjects] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [answersData, setAnswersData] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    type: "multiple_choice",
    difficultyLevel: "easy",
    topicId: "",
    answers: [
      { content: "", correct: false },
      { content: "", correct: false },
      { content: "", correct: false },
      { content: "", correct: false },
    ],
  });
  const [fileFormData, setFileFormData] = useState({
    name: "",
    description: "",
    file: null,
    subjectId: "",
  });

  // Search functionality
  const {
    searchTerm: hookSearchTerm,
    setSearchTerm: setHookSearchTerm,
    filteredData,
  } = useSearch(allQuestions, ["content"]);

  // Sort functionality
  const {
    sortedData,
    sortKey: hookSortKey,
    sortOrder: hookSortOrder,
    handleSort,
  } = useSort(filteredData, "content", "asc");

  // Client-side filtering and sorting
  const getFilteredAndSortedQuestions = () => {
    let filtered = allQuestions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((question) =>
        question.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((question) => question.status === "active");
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((question) => question.status === "inactive");
    } else if (statusFilter === "null") {
      filtered = filtered.filter(
        (question) => question.status === null || question.status === undefined
      );
    }

    // Apply difficulty level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter(
        (question) => question.difficultyLevel === levelFilter
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((question) => question.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortKey) {
        case "content":
          aValue = a.content?.toLowerCase() || "";
          bValue = b.content?.toLowerCase() || "";
          break;
        case "difficultyLevel":
          aValue = a.difficultyLevel || "";
          bValue = b.difficultyLevel || "";
          break;
        case "type":
          aValue = a.type || "";
          bValue = b.type || "";
          break;
        case "status":
          aValue = a.status === "active" ? 0 : 1;
          bValue = b.status === "active" ? 0 : 1;
          break;
        default:
          aValue = a[sortKey];
          bValue = b[sortKey];
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  };

  const filteredQuestions = getFilteredAndSortedQuestions();

  // Pagination for filtered results
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = usePagination(filteredQuestions, 10);

  const fetchQuestionData = async () => {
    try {
      setLoading(true);
      const response = await exApi.get("questions?page=0&size=1000");
      console.log(response.data.data.content);
      if (response.data.success) {
        setAllQuestions(response.data.data.content);
        setTotal(response.data.data.totalElements);
      } else {
        toast.error("Failed to fetch questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionFiles = async () => {
    try {
      setLoading(true);
      const response = await exApi.get("Supabase/file-names");
      if (response.data.success) {
        // Transform the API data to match our component's expected format
        const transformedFiles = response.data.data.map((file, index) => ({
          id: index + 1,
          name: file.fileName,
          description: `Question file: ${file.fileName}`,
          uploadDate: file.fileName.substring(0, 10),
          url: file.url,
          fileSize: "Unknown",
          status: "active",
        }));
        setQuestionFiles(transformedFiles);
      } else {
        toast.error("Failed to fetch question files");
      }
    } catch (error) {
      console.error("Error fetching question files:", error);
      toast.error("Failed to fetch question files");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    // Fetch topics for dropdown
    try {
      const response = await api.get("topics?pageSize=1000");
      if (response.data.success) {
        setAllTopics(response.data.data.items);
      } else {
        toast.error("Failed to fetch topics");
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("Failed to fetch topics");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("subjects");

      if (response.data.success) {
        setSubjects(response.data.data.items);
      } else {
        toast.error("Failed to fetch subjects");
      }
    } catch (error) {
      toast.error("Failed to fetch subjects");
    }
  };

  useEffect(() => {
    fetchQuestionData();
    fetchSubjects();
    fetchTopics();
    if (activeTab === "files") {
      fetchQuestionFiles();
    }
  }, [activeTab]);

  // Reset selections when filters change
  useEffect(() => {
    setSelectedQuestions([]);
    setSelectAll(false);
  }, [statusFilter, levelFilter, typeFilter, searchTerm, currentPage]);

  // Handle sort
  const handleSortColumn = (column) => {
    const newOrder = sortKey === column && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(column);
    setSortOrder(newOrder);
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData({
      content: "",
      type: "multiple_choice",
      difficultyLevel: "medium",
      topicId: "",
      answers: [
        { content: "", correct: false },
        { content: "", correct: false },
        { content: "", correct: false },
        { content: "", correct: false },
      ],
    });
    setShowModal(true);
  };

  const handleEdit = async (question) => {
    setEditingQuestion(question);
    const initialFormData = {
      content: question.content,
      type: question.type,
      difficultyLevel: question.difficultyLevel,
      topicId: question.topicId || "",
      answers: [
        { content: "", correct: false },
        { content: "", correct: false },
        { content: "", correct: false },
        { content: "", correct: false },
      ],
    };

    if (question.type === "multiple_choice") {
      try {
        const response = await exApi.get(`answers/by-question/${question.id}`);
        if (response.data.success && response.data.data.content.length > 0) {
          const existingAnswers = response.data.data.con
          const formAnswers = [...initialFormData.answers];
          existingAnswers.forEach((answer, index) => {
            if (index < 4) {
              formAnswers[index] = {
                id: answer.id, 
                content: answer.content,
                correct: answer.correct,
              };
            }
          });

          initialFormData.answers = formAnswers;
        }
      } catch (error) {
        console.error("Error fetching answers for edit:", error);
      }
    }

    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleView = (question) => {
    setViewingQuestion(question);
    setShowViewModal(true);
  };

  const fetchAnswers = async (questionId) => {
    try {
      setLoadingAnswers(true);
      const response = await exApi.get(`answers/by-question/${questionId}`);
      if (response.data.success) {
        setAnswersData(response.data.data.content);
      } else {
        setAnswersData([]); 
        toast.error("Failed to fetch answers");
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
      setAnswersData([]); 
      toast.error("Failed to fetch answers");
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleViewQuestions = async (question) => {
    setViewingQuestion(question);
    setAnswersData([]); 
    setShowAnswersModal(true);
    await fetchAnswers(question.id);
  };

  const handleCloseAnswersModal = () => {
    setShowAnswersModal(false);
    setAnswersData([]); 
    setViewingQuestion(null);
  };
  // Separate function to create new answers
  const createAnswers = async (questionId, answers) => {
    const filledAnswers = answers.filter(
      (answer) => answer.content.trim() !== ""
    );

    for (const answer of filledAnswers) {
      try {
        await exApi.post(`answers/by-question/${questionId}`, {
          content: answer.content,
          correct: answer.correct,
        });
      } catch (answerError) {
        console.error("Failed to add answer:", answerError);
        throw new Error("Failed to add some answers");
      }
    }
  };

  // Separate function to update existing answers
  const updateAnswers = async (questionId, answers) => {
    const filledAnswers = answers.filter(
      (answer) => answer.content.trim() !== ""
    );

    // Get current answers to compare
    const currentAnswersResponse = await exApi.get(
      `answers/by-question/${questionId}`
    );
    const currentAnswers = currentAnswersResponse.data.success
      ? currentAnswersResponse.data.data.content
      : [];

    // Track which answers to keep
    const answersToKeep = new Set();

    // Update or create answers
    for (let i = 0; i < filledAnswers.length; i++) {
      const answer = filledAnswers[i];

      if (answer.id) {
        // Update existing answer
        try {
          await exApi.put(`answers/${answer.id}`, {
            content: answer.content,
            correct: answer.correct,
          });
          answersToKeep.add(answer.id);
        } catch (updateError) {
          console.error("Failed to update answer:", updateError);
          throw new Error("Failed to update some answers");
        }
      } else {
        // Create new answer
        try {
          const createResponse = await exApi.post(
            `answers/by-question/${questionId}`,
            {
              content: answer.content,
              correct: answer.correct,
            }
          );
          if (createResponse.data.success) {
            answersToKeep.add(createResponse.data.data.id);
          }
        } catch (createError) {
          console.error("Failed to create answer:", createError);
          throw new Error("Failed to create some answers");
        }
      }
    }
  };

  const handleDelete = (questionId) => {
    toast.info(({ closeToast }) => (
      <div>
        <p>Are you sure you want to delete this question?</p>
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button
            onClick={async () => {
              try {
                const response = await exApi.delete(`questions/${questionId}`);
                if (response.data.success) {
                  fetchQuestionData();
                  toast.success("Question deleted successfully!");
                  setStatusFilter("inactive");
                } else {
                  toast.error("Failed to delete question.");
                }
              } catch (error) {
                toast.error("An error occurred while deleting the question.");
              } finally {
                closeToast();
              }
            }}
            style={{
              backgroundColor: "#d9534f",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
          <button
            onClick={closeToast}
            style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "1px solid #ccc",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for multiple choice questions
    if (formData.type === "multiple_choice") {
      const filledAnswers = formData.answers.filter(
        (answer) => answer.content.trim() !== ""
      );
      if (filledAnswers.length < 2) {
        toast.error(
          "Please provide at least 2 answer options for multiple choice questions"
        );
        return;
      }

      const correctAnswers = formData.answers.filter(
        (answer) => answer.correct
      );
      if (correctAnswers.length !== 1) {
        toast.error("Please select exactly one correct answer");
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        content: formData.content,
        type: formData.type,
        difficultyLevel: formData.difficultyLevel,
        status: "active",
        topicId: parseInt(formData.topicId, 10),
      };

      if (editingQuestion) {
        const response = await exApi.put(`questions/${editingQuestion.id}`, {
          content: formData.content,
          type: formData.type,
          difficultyLevel: formData.difficultyLevel,
          status: "active",
        });

        if (response.data.success) {
          // If it's a multiple choice question, update the answers
          if (formData.type === "multiple_choice") {
            try {
              await updateAnswers(editingQuestion.id, formData.answers);
            } catch (answerError) {
              console.error("Failed to update answers:", answerError);
              toast.error("Question updated but failed to update some answers");
            }
          }

          fetchQuestionData();
          toast.success("Question updated successfully");
          setShowModal(false);
        } else {
          toast.error("Failed to update question");
        }
      } else {
        const response = await exApi.post(`questions/${payload.topicId}`, {
          content: formData.content,
          type: formData.type,
          difficultyLevel: formData.difficultyLevel,
          status: "active",
        });

        if (response.data.success) {
          const questionId = response.data.data.id;

          // If it's a multiple choice question, add the answers
          if (formData.type === "multiple_choice") {
            try {
              await createAnswers(questionId, formData.answers);
            } catch (answerError) {
              console.error("Failed to add answers:", answerError);
              toast.error("Question created but failed to add some answers");
            }
          }

          toast.success("Question created successfully");
          fetchQuestionData();
          setShowModal(false);
        } else {
          toast.error("Failed to create question");
        }
      }
    } catch (error) {
      toast.error("Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle answer changes
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = {
      ...newAnswers[index], // Preserve existing properties like id
      content: value,
    };
    setFormData({
      ...formData,
      answers: newAnswers,
    });
  };

  const handleCorrectAnswerChange = (index) => {
    const newAnswers = formData.answers.map((answer, i) => ({
      ...answer, // Preserve existing properties like id
      correct: i === index,
    }));
    setFormData({
      ...formData,
      answers: newAnswers,
    });
  };

  // Checkbox selection functions
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedQuestions(paginatedData.map((q) => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectQuestion = (questionId) => {
    let newSelected;
    if (selectedQuestions.includes(questionId)) {
      newSelected = selectedQuestions.filter((id) => id !== questionId);
    } else {
      newSelected = [...selectedQuestions, questionId];
    }
    setSelectedQuestions(newSelected);
    setSelectAll(
      newSelected.length === paginatedData.length && paginatedData.length > 0
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedQuestions.length === 0) {
      toast.warning("Please select questions first");
      return;
    }

    try {
      setLoading(true);

      if (action === "verify") {
        const response = await exApi.put(`questions/status`, {
          id: selectedQuestions,
          status: "active",
        });
        if (response.data.success) {
          toast.success(
            `${selectedQuestions.length} questions verified successfully`
          );
        }
      } else if (action === "reject") {
        const response = await exApi.put(`questions/status`, {
          id: selectedQuestions,
          status: "inactive",
        });
        if (!response.data.success) {
          toast.success(
            `${selectedQuestions.length} questions rejected successfully`
          );
        }
      }

      setSelectedQuestions([]);
      setSelectAll(false);
      fetchQuestionData();
    } catch (error) {
      if (action === "verify") {
        toast.error("Failed to verify questions");
      } else if (action === "reject") {
        toast.error("Failed to reject questions");
      }
    } finally {
      setLoading(false);
    }
  };

  // File handling functions
  const handleFileUpload = () => {
    setShowFileModal(true);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const now = new Date();

      const pad = (n) => n.toString().padStart(2, "0");

      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
        now.getSeconds()
      )}`;

      const originalName = fileFormData.file.name;
      const nameWithoutExtension =
        originalName.substring(0, originalName.lastIndexOf(".")) ||
        originalName;

      const key = `${timestamp}_${nameWithoutExtension}`;
      const formData = new FormData();
      formData.append("file", fileFormData.file);

      const response = await exApi.post(
        `Supabase/files?key=${encodeURIComponent(key)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const fileName = response.data.data;
        const getUrlFile = await exApi.get(
          `Supabase/files/${encodeURIComponent(fileName)}/signed-url`,
          {
            params: { fileName },
          }
        );

        if (getUrlFile.data.success) {
          const fileUrl = encodeURIComponent(getUrlFile.data.data);
          const subjectId = fileFormData.subjectId;

          const resPushUrl = await exApi.post(
            `questions/ai-generations/from-url?fileUrl=${fileUrl}&subjectId=${subjectId}`,
            {}
          );

          if (resPushUrl.data.success) {
            toast.success(
              "File uploaded and questions generated successfully!"
            );

            fetchQuestionFiles();

            setFileFormData({
              name: "",
              description: "",
              file: null,
              subjectId: "",
            });
          } else {
            toast.error("Failed to generate questions from file");
          }
        }
      }

      setShowFileModal(false);
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.name === "file") {
      setFileFormData({
        ...fileFormData,
        [e.target.name]: e.target.files[0],
      });
    } else {
      setFileFormData({
        ...fileFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "easy":
        return "badge-green";
      case "medium":
        return "badge-blue";
      case "hard":
        return "badge-red";
      default:
        return "badge-gray";
    }
  };

  const getStatusColor = (status) => {
    if (status === "active") return "badge-green";
    if (status === "inactive") return "badge-red";
    return "badge-yellow";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "multiple_choice":
        return "badge-blue";
      case "essay":
        return "badge-purple";
      case "short_answer":
        return "badge-orange";
      default:
        return "badge-gray";
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

  // Hàm định dạng ngày thành DD/MM/YYYY
  function formatDateFromKey(key) {
    const datePart = key.split("_")[0]; // "2025-07-25"
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  }

  // Hàm lấy phần name sau cùng (sau dấu _ cuối cùng)
  function extractNameFromKey(key) {
    const lastUnderscoreIndex = key.lastIndexOf("_");
    return key.substring(lastUnderscoreIndex + 1);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Question Management</h1>
          <p className="page-subtitle">
            Manage questions and question files in your platform
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleFileUpload}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Upload File Questions
          </button>
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Question
          </button>
        </div>
      </div>
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions by content..."
                className="input-field pl-11 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {activeTab === "questions" && (
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field min-w-[120px]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="null">Not verified</option>
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

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="input-field min-w-[120px]"
                >
                  <option value="all">All Types</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="essay">Essay</option>
                </select>

                {(searchTerm ||
                  levelFilter !== "all" ||
                  typeFilter !== "all" ||
                  statusFilter !== "active") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("active");
                      setLevelFilter("all");
                      setTypeFilter("all");
                    }}
                    className="btn-secondary whitespace-nowrap"
                    title="Clear all filters"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{paginatedData.length}</span> of{" "}
            <span className="font-medium">{filteredQuestions.length}</span>{" "}
            questions
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 justify-between">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab("questions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "questions"
                    ? "border-blue-500  text-blue-600"
                    : " text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } `}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Questions
                </div>
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "files"
                    ? "border-blue-500 border-b-2 text-blue-600"
                    : " text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } `}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Question Files
                </div>
              </button>
            </div>
            <div className="flex items-center gap-4">
              {selectedQuestions.length > 0 && (
                <>
                  {statusFilter !== "active" && (
                    <button
                      onClick={() => handleBulkAction("verify")}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Verify Selected ({selectedQuestions.length})
                    </button>
                  )}

                  {statusFilter !== "inactive" && (
                    <button
                      onClick={() => handleBulkAction("reject")}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Selected ({selectedQuestions.length})
                    </button>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Questions Tab Content */}
      {activeTab === "questions" && (
        <>
          <div className="card p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="table-header w-12">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th
                      className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSortColumn("content")}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Question Content</span>
                        <SortIcon column="content" />
                      </div>
                    </th>
                    <th
                      className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSortColumn("type")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Type</span>
                        <SortIcon column="type" />
                      </div>
                    </th>
                    <th
                      className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSortColumn("status")}
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
                      <td colSpan="5" className="table-cell text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600">
                            Loading questions...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-cell text-center py-8">
                        <div className="text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No questions found</p>
                          {(searchTerm ||
                            levelFilter !== "all" ||
                            typeFilter !== "all") && (
                            <p className="text-sm mt-2">
                              Try adjusting your search or filters
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((question, index) => (
                      <tr
                        key={question.id}
                        className={`hover: bg - gray - 50 transition - colors ${
                          index !== paginatedData.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        } `}
                      >
                        <td className="table-cell w-12">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => handleSelectQuestion(question.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div className="max-w-md">
                              <div className="font-semibold text-gray-900 truncate">
                                {question.content.length > 100
                                  ? question.content.substring(0, 100) + "..."
                                  : question.content}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span
                            className={`badge ${getTypeColor(question.type)} `}
                          >
                            {question.type.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span
                            className={`badge ${getStatusColor(
                              question.status
                            )} `}
                          >
                            {question.status === "active"
                              ? "Active"
                              : question.status === "inactive"
                              ? "Inactive"
                              : "Pending Verification"}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewQuestions(question)}
                              className="btn-icon-secondary"
                              title="View questions"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleView(question)}
                              className="btn-icon-secondary"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(question)}
                              className="btn-icon-primary"
                              title="Edit question"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {question.status === "active" && (
                              <button
                                onClick={() => handleDelete(question.id)}
                                className="btn-icon-danger"
                                title="Delete question"
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
        </>
      )}

      {activeTab === "files" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => window.open(file.url, "_blank")}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {extractNameFromKey(file.name)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {file.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{formatDateFromKey(file.name)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {questionFiles.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No question files found
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your first question file to get started.
              </p>
              <button onClick={handleFileUpload} className="btn-primary">
                Upload File
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingQuestion ? "Edit Question" : "Add New Question"}
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
                    Question Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Enter question content"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field"
                    disabled={editingQuestion}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {!editingQuestion && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Topic
                    </label>
                    <select
                      name="topicId"
                      value={formData.topicId}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select a topic</option>
                      {allTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.type === "multiple_choice" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-3">
                      {formData.answers.map((answer, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <input
                            type="text"
                            value={answer.content}
                            onChange={(e) =>
                              handleAnswerChange(index, e.target.value)
                            }
                            className="input-field flex-1"
                            placeholder={`Enter answer option ${String.fromCharCode(
                              65 + index
                            )}`}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={answer.correct}
                              onChange={() => handleCorrectAnswerChange(index)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              Correct
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Fill in at least 2 answer options and select one as the
                      correct answer.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingQuestion ? "Updating..." : "Creating..."}
                      </div>
                    ) : editingQuestion ? (
                      "Update Question"
                    ) : (
                      "Create Question"
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

      {showViewModal && viewingQuestion && (
        <div className="modal-overlay bg-black bg-opacity-50 flex items-center justify-center">
          <div className="modal-content bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Question Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Question Content
                  </label>
                  <p className="text-lg font-medium text-gray-900 leading-relaxed">
                    {viewingQuestion.content}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Type
                  </label>
                  <p
                    className={`text-gray-800 px-3 py-1 rounded-md inline-block ${getTypeColor(
                      viewingQuestion.type
                    )} text-white`}
                  >
                    {viewingQuestion.type.replace("_", " ").toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Difficulty Level
                  </label>
                  <p
                    className={`text-gray-800 px-3 py-1 rounded-md inline-block ${
                      viewingQuestion.difficultyLevel === "easy"
                        ? "bg-green-100"
                        : viewingQuestion.difficultyLevel === "medium"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}
                  >
                    {viewingQuestion.difficultyLevel}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Topic
                  </label>
                  <p className="text-gray-800 px-3 py-1 rounded-md inline-block bg-gray-100">
                    {viewingQuestion.topicName
                      ? viewingQuestion.topicName
                      : "No topic assigned"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Status
                  </label>
                  <p
                    className={`text-gray-800 px-3 py-1 rounded-md inline-block ${
                      viewingQuestion.status === "active"
                        ? "bg-green-100"
                        : viewingQuestion.status === "inactive"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    {viewingQuestion.status === "active"
                      ? "Active"
                      : viewingQuestion.status === "inactive"
                      ? "Inactive"
                      : "Pending Verification"}
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

      {showFileModal && (
        <div className="modal-overlay">
          <div className="modal-content max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Upload Question File
                </h3>
                <button
                  onClick={() => setShowFileModal(false)}
                  className="btn-icon-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleFileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    name="subjectId"
                    value={fileFormData.subjectId}
                    onChange={handleFileInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects?.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* File Upload Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>

                  <div className="relative w-full">
                    <input
                      type="file"
                      name="file"
                      onChange={handleFileInputChange}
                      accept=".pdf,.doc,.docx,.txt"
                      required
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-600 file:text-white hover:file:bg-blue-700
                   cursor-pointer bg-gray-50 border border-gray-300 rounded-md"
                    />
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Supported formats: PDF, DOC, DOCX, TXT
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
                        Uploading...
                      </>
                    ) : (
                      "Upload File"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFileModal(false)}
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAnswersModal && viewingQuestion && (
        <div className="modal-overlay bg-black bg-opacity-50 flex items-center justify-center">
          <div className="modal-content bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Question Answers
                </h3>
                <button
                  onClick={handleCloseAnswersModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Question Content
                </label>
                <p className="text-lg font-medium text-gray-900 leading-relaxed bg-gray-50 p-3 rounded-md">
                  {viewingQuestion.content}
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Answer Options
                </label>

                {loadingAnswers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading answers...
                    </span>
                  </div>
                ) : answersData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No answers found for this question
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {answersData.map((answer, index) => (
                      <div
                        key={answer.id}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          answer.correct
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              answer.correct
                                ? "bg-green-500 text-white"
                                : "bg-gray-400 text-white"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium leading-relaxed">
                              {answer.content}
                            </p>
                            {answer.correct && (
                              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                <CheckSquare className="h-3 w-3" />
                                Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={handleCloseAnswersModal}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
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

export default Question;
