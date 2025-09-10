import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Users, Phone, TrendingUp, Calendar, Download, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { API_BASE_URL } from '../config';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    projectStats: [],
    callTrends: [],
    callerPerformance: []
  });
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Check if user is admin
    if (!userData.is_staff) {
      navigate('/dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);

      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);

      const response = await fetch(`${API_BASE_URL}/api/admin/export-all/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `all_projects_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('خطا در دانلود گزارش');
      }
    } catch (error) {
      console.error('Error exporting reports:', error);
      alert('خطا در دانلود گزارش');
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h1 className="mr-4 text-xl font-semibold text-gray-900">داشبورد مدیریت</h1>
              </div>
            </div>
            <Button
              onClick={handleExportAllReports}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 ml-2" />
              دانلود گزارش کلی
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Date Range Filter */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 ml-2" />
                فیلتر بازه زمانی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    از تاریخ
                  </label>
                  <input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تا تاریخ
                  </label>
                  <input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={fetchDashboardData}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    اعمال فیلتر
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setDateRange({ start_date: '', end_date: '' });
                      fetchDashboardData();
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    پاک کردن فیلتر
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        کل پروژه‌ها
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.overview.total_projects || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        کل تماس‌ها
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.overview.total_calls || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        کل تماس‌گیرندگان
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.overview.total_callers || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        نرخ موفقیت
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.overview.success_rate || 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Project Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>عملکرد پروژه‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.projectStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_calls" fill="#3B82F6" name="کل تماس‌ها" />
                    <Bar dataKey="successful_calls" fill="#10B981" name="تماس‌های موفق" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Call Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزیع وضعیت تماس‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.callStatusDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData.callStatusDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Call Trends Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>روند تماس‌ها در طول زمان</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dashboardData.callTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} name="تماس‌ها" />
                  <Line type="monotone" dataKey="successful" stroke="#10B981" strokeWidth={2} name="موفق" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Caller Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>عملکرد تماس‌گیرندگان</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.callerPerformance && dashboardData.callerPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تماس‌گیرنده
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          کل تماس‌ها
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تماس‌های موفق
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          نرخ موفقیت
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          میانگین مدت تماس
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.callerPerformance.map((caller, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {caller.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {caller.total_calls}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {caller.successful_calls}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              caller.success_rate >= 70 
                                ? 'bg-green-100 text-green-800'
                                : caller.success_rate >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {caller.success_rate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {caller.avg_duration} دقیقه
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">هیچ داده‌ای برای نمایش وجود ندارد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

