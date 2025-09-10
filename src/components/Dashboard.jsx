import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hasProjectAccess, setHasProjectAccess] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCalls: 0,
    completedCalls: 0,
    pendingCalls: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardStats(token);
  }, [navigate]);

  const fetchDashboardStats = async (token) => {
    try {
      const projectsResponse = await fetch(`${API_BASE_URL}/api/projects/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let projects = { results: [] };
      if (projectsResponse.status === 403) {
        setHasProjectAccess(false);
      } else if (!projectsResponse.ok) {
        throw new Error(`Failed to fetch projects: ${projectsResponse.status}`);
      } else {
        projects = await projectsResponse.json();
      }

      const callsResponse = await fetch(`${API_BASE_URL}/api/calls/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!callsResponse.ok) {
        throw new Error(`Failed to fetch calls: ${callsResponse.status}`);
      }

      const callsData = await callsResponse.json();
      const calls = callsData.results || callsData;
      const completedCalls = calls.filter(call => call.status === 'completed').length;

      setStats({
        totalProjects: projects.results.length,
        totalCalls: calls.length,
        completedCalls: completedCalls,
        pendingCalls: calls.length - completedCalls,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleAdminDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNewCall = () => {
    navigate('/call-request');
  };

  const handleProjects = () => {
    navigate('/projects');
  };

  const handleReports = () => {
    navigate('/reports');
  };

  if (!user) {
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
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <h1 className="text-xl font-semibold text-gray-900">مرکز تماس</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-sm text-gray-700">خوش آمدید، {user.username}</span>
                {user.is_staff && (
                    <button
                        onClick={handleAdminDashboard}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      داشبورد مدیریت
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  خروج
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  خوش آمدید به سیستم مدیریت مرکز تماس
                </h2>
                <p className="text-gray-600">
                  از این داشبورد می‌توانید {hasProjectAccess && 'پروژه‌های تماس خود را مدیریت کنید،'} تماس‌های جدید درخواست دهید و گزارش‌های مفصل دریافت کنید.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mr-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          کل پروژه‌ها
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalProjects}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mr-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          کل تماس‌ها
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalCalls}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="mr-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          تماس‌های انجام شده
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.completedCalls}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="mr-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          تماس‌های در انتظار
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.pendingCalls}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`grid grid-cols-1 md:grid-cols-${hasProjectAccess ? '3' : '2'} gap-6`}>
              <button
                  onClick={handleNewCall}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">درخواست تماس جدید</h3>
                  <p className="text-blue-100 text-sm text-center">
                    برای شروع تماس جدید کلیک کنید
                  </p>
                </div>
              </button>

              {hasProjectAccess && (
                  <button
                      onClick={handleProjects}
                      className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">مدیریت پروژه‌ها</h3>
                      <p className="text-green-100 text-sm text-center">
                        مشاهده و مدیریت پروژه‌های تماس
                      </p>
                    </div>
                  </button>
              )}

              <button
                  onClick={handleReports}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">گزارش‌ها</h3>
                  <p className="text-purple-100 text-sm text-center">
                    مشاهده گزارش‌های تفصیلی
                  </p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
  );
};

export default Dashboard;