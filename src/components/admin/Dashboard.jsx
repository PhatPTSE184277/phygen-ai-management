import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockUsers, mockExams, mockCategories } from '../../data/mockData';
import { 
  Users, 
  BookOpen, 
  FolderOpen, 
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  ArrowUpRight,
  Calendar,
  Award,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCategories: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Calculate stats from mock data
    setStats({
      totalUsers: mockUsers.length,
      totalExams: mockExams.length,
      totalCategories: mockCategories.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length
    });
  }, []);

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Total Exams',
      value: stats.totalExams,
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Categories',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'from-purple-500 to-purple-600',
      change: '+3%',
      changeType: 'positive'
    },
    {
      name: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  const recentExams = mockExams.slice(0, 5);
  const recentUsers = mockUsers.slice(0, 5);

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

  const getUserStatusColor = (status) => {
    return status === 'active' ? 'badge-green' : 'badge-red';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.username}! 👋</h1>
          <p className="page-subtitle">
            Here's what's happening with your exam platform today
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="card group hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.changeType === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500">from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Exams */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Exams</h3>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{exam.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>{exam.category}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{exam.duration} min</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getDifficultyColor(exam.difficulty)}`}>
                    {exam.difficulty}
                  </span>
                  <span className={`badge ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{user.username}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-blue">{user.role}</span>
                  <span className={`badge ${getUserStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl mb-3 transition-colors">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Create New Exam</h4>
              <p className="text-sm text-gray-600">Set up a new examination</p>
            </div>
          </button>
          <button className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 group-hover:bg-green-200 rounded-xl mb-3 transition-colors">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Add New User</h4>
              <p className="text-sm text-gray-600">Invite or create a user account</p>
            </div>
          </button>
          <button className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-100 group-hover:bg-purple-200 rounded-xl mb-3 transition-colors">
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">New Category</h4>
              <p className="text-sm text-gray-600">Organize exams by category</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
