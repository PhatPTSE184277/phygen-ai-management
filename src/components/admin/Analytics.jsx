import { useState } from 'react';
import { mockUsers, mockExams } from '../../data/mockData';
import { 
  Users, 
  Activity, 
  BookOpen, 
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  Download
} from 'lucide-react';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // Calculate analytics data
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const totalExams = mockExams.length;
  const publishedExams = mockExams.filter(e => e.status === 'published').length;

  const usersByRole = mockUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const examsByCategory = mockExams.reduce((acc, exam) => {
    acc[exam.category] = (acc[exam.category] || 0) + 1;
    return acc;
  }, {});

  const examsByDifficulty = mockExams.reduce((acc, exam) => {
    acc[exam.difficulty] = (acc[exam.difficulty] || 0) + 1;
    return acc;
  }, {});

  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      change: '+8%',
      changeType: 'positive',
      icon: Activity,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Exams',
      value: totalExams,
      change: '+15%',
      changeType: 'positive',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Published Exams',
      value: publishedExams,
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const periodOptions = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '3months', label: 'Last 3 months' },
    { value: '1year', label: 'Last year' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">
            Track performance and gain insights into your exam platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field min-w-0 w-auto"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card group hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
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
                    <span className="text-sm text-gray-500">vs previous period</span>
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
        {/* User Distribution by Role */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PieChart className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
            </div>
            <button className="btn-icon-secondary">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {Object.entries(usersByRole).map(([role, count], index) => {
              const percentage = ((count / totalUsers) * 100).toFixed(1);
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
              const bgColors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100'];
              const textColors = ['text-blue-800', 'text-green-800', 'text-purple-800'];
              
              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <span className="font-medium text-gray-900 capitalize">{role}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${bgColors[index % bgColors.length]} ${textColors[index % textColors.length]}`}>
                      {count} users
                    </span>
                    <span className="text-sm text-gray-500 w-12 text-right">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exams by Category */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Exams by Category</h3>
            </div>
            <button className="btn-icon-secondary">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {Object.entries(examsByCategory).map(([category, count], index) => {
              const percentage = ((count / totalExams) * 100).toFixed(1);
              const maxCount = Math.max(...Object.values(examsByCategory));
              const width = (count / maxCount) * 100;
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{count} exams</span>
                      <span className="text-sm text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exam Difficulty Distribution */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Exam Difficulty Distribution</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Total: {totalExams} exams</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(examsByDifficulty).map(([difficulty, count], index) => {
            const percentage = ((count / totalExams) * 100).toFixed(1);
            const colors = [
              { bg: 'from-green-500 to-green-600', text: 'text-green-600', light: 'bg-green-100' },
              { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-100' },
              { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', light: 'bg-purple-100' }
            ];
            const color = colors[index % colors.length];
            
            return (
              <div key={difficulty} className="text-center">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${color.bg} shadow-lg mb-4`}>
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{difficulty}</h4>
                <p className="text-3xl font-bold text-gray-900 mb-2">{count}</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color.light} ${color.text}`}>
                  {percentage}% of total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Activity className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h3>
        </div>
        <div className="space-y-4">
          {[
            { action: 'New user registration', user: 'john.doe@email.com', time: '2 hours ago', type: 'user' },
            { action: 'Exam published', title: 'Advanced Mathematics Quiz', time: '4 hours ago', type: 'exam' },
            { action: 'Category created', title: 'Science & Technology', time: '6 hours ago', type: 'category' },
            { action: 'User role updated', user: 'jane.smith@email.com', time: '1 day ago', type: 'user' },
            { action: 'Exam completed', title: 'Basic Programming Test', time: '1 day ago', type: 'exam' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'user' ? 'bg-blue-500' :
                activity.type === 'exam' ? 'bg-green-500' : 'bg-purple-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">
                  {activity.user || activity.title}
                </p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
