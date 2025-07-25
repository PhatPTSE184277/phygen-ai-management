import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { mockUsers, mockExams, mockCategories } from '../../../data/mockData';
import {
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartSkeleton from './ChartSkeleton';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
import api from '../../../config/axios';
import exApi from '../../../config/exApi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCategories: 0,
    activeUsers: 0
  });
  const [accountTypeStats, setAccountTypeStats] = useState({
    totalUsers: 0,
    usersByAccountType: { free: 0, premium: 0 }
  });
  const [loadingAccountType, setLoadingAccountType] = useState(false);
  const [revenueData, setRevenueData] = useState({});
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  const [monthlyExamCounts, setMonthlyExamCounts] = useState({});
  const [loadingMonthlyExamCounts, setLoadingMonthlyExamCounts] = useState(false);

  useEffect(() => {
    setStats({
      totalUsers: mockUsers.length,
      totalExams: mockExams.length,
      totalCategories: mockCategories.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length
    });


    const fetchAccountTypeStats = async () => {
      setLoadingAccountType(true);
      try {
        const res = await api.get('/admin/dashboard/user/overview');
        if (res && res.data) {
          setAccountTypeStats({
            totalUsers: res.data.totalUsers || 0,
            usersByAccountType: res.data.usersByAccountType || { free: 0, premium: 0 }
          });
        } else {
          setAccountTypeStats({ totalUsers: 0, usersByAccountType: { free: 0, premium: 0 } });
        }
      } catch (err) {
        console.error("Error fetching account type stats:", err);
        setAccountTypeStats({ totalUsers: 0, usersByAccountType: { free: 0, premium: 0 } });
      } finally {
        setLoadingAccountType(false);
      }
    };

    const fetchRevenue = async () => {
      setLoadingRevenue(true);
      try {
        const res = await api.get('/admin/dashboard/monthly/revenue');
        if (res && res.data) {
          setRevenueData(res.data);
        } else {
          setRevenueData({});
        }
      } catch (err) {
        console.error("Error fetching revenue:", err);
        setRevenueData({});
      } finally {
        setLoadingRevenue(false);
      }
    };

     const fetchMonthlyExamCounts = async () => {
      setLoadingMonthlyExamCounts(true);
      try {
        const res = await exApi.get('/api/dashboard/exams/monthly-counts?targetYear=2025');
        console.log(res.data)
        if (res && res.data && res.data.data) {
          setMonthlyExamCounts(res.data.data);
        } else {
          setMonthlyExamCounts({});
        }
      } catch (err) {
        console.error("Error fetching ExamCounts:", err);
        setMonthlyExamCounts({});
      } finally {
        setLoadingMonthlyExamCounts(false);
      }
    };

    fetchMonthlyExamCounts();
    fetchAccountTypeStats();
    fetchRevenue();
  }, []);
  // Xử lý dữ liệu cho biểu đồ cột doanh thu (Bar chart)
  const revenueArray = Object.entries(revenueData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value }));

  const barData = {
    labels: revenueArray.map(item => item.month),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: revenueArray.map(item => item.value),
        backgroundColor: '#f59e42',
        borderRadius: 8,
      },
    ],
  };

  const examMonthLabels = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  const examMonthData = examMonthLabels.map((_, idx) => monthlyExamCounts[String(idx + 1)] || 0);

  const examMonthBarData = {
    labels: examMonthLabels,
    datasets: [
      {
        label: 'Số lượng đề thi',
        data: examMonthData,
        backgroundColor: '#6366f1',
        borderRadius: 8,
      },
    ],
  };

  const examMonthBarOptions = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: 'easeOutBounce',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ctx.parsed.y + ' đề thi'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: 'easeOutBounce',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ctx.parsed.y.toLocaleString() + ' VNĐ'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => value.toLocaleString()
        }
      }
    }
  };

  // Pie chart cho account type
  const pieData = {
    labels: ['Free', 'Premium'],
    datasets: [
      {
        data: [
          accountTypeStats.usersByAccountType.free,
          accountTypeStats.usersByAccountType.premium
        ],
        backgroundColor: ['#6366f1', '#f59e42'],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.label}: ${ctx.parsed} người`
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.username}! 👋</h1>
          <p className="page-subtitle">
            Here&apos;s what&apos;s happening with your exam platform today
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


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Bar Chart (Chart.js) */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {loadingRevenue ? (
              <ChartSkeleton type="bar" />
            ) : (
              <Bar data={barData} options={barOptions} />
            )}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">Doanh thu từng tháng (VNĐ)</p>
          </div>
        </div>


        {/* Account Type Pie Chart (Chart.js) */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-100 rounded-lg">
              <PieChart className="h-5 w-5 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Account Type Distribution</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {loadingAccountType ? (
              <ChartSkeleton type="pie" />
            ) : (
              <Pie data={pieData} options={pieOptions} />
            )}
          </div>
        </div>

         <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Exam Counts</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          {loadingMonthlyExamCounts ? (
            <ChartSkeleton type="bar" />
          ) : (
            <Bar data={examMonthBarData} options={examMonthBarOptions} />
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Số lượng đề thi từng tháng trong năm</p>
        </div>
      </div>
      </div>

    </div>
  );
};

export default Dashboard;