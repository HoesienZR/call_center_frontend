import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Phone, FileText, Upload, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [callers, setCallers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [calls, setCalls] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProjectData();
    fetchUserRole();
  }, [navigate, projectId]);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/user-role/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const roleData = await response.json();
        setUserRole(roleData);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch project details
      const projectResponse = await fetch(`${API_BASE_URL}/api/projects/${projectId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
      }

      // Fetch project statistics
      const statsResponse = await fetch(`${API_BASE_URL}/api/projects/${projectId}/statistics/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setProject(prev => ({ ...prev, ...statsData }));
      }

      // Fetch project callers
      const callersResponse = await fetch(`${API_BASE_URL}/api/project-callers/?project=${projectId}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (callersResponse.ok) {
        const callersData = await callersResponse.json();
        setCallers(callersData.results);
      }

      // Fetch project contacts
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
      }

      // Fetch project calls
      const callsResponse = await fetch(`${API_BASE_URL}/api/calls/?project=${projectId}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (callsResponse.ok) {
        const callsData = await callsResponse.json();
        setCalls(callsData);
      }

    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFiles = () => {
    navigate(`/project/${projectId}/upload`);
  };

  const handleNewCallRequest = () => {
    navigate(`/project/${projectId}/call-request`);
  };

  const handleViewReports = () => {
    navigate(`/project/${projectId}/reports`);
  };

  const handleViewUsers = () => {
    navigate(`/users/${projectId}`);
  };

  const isCaller = userRole?.role === 'caller';

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
    );
  }

  if (!project) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8 sm:py-12">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                پروژه یافت نشد
              </h3>
              <Button onClick={() => navigate('/projects')} variant="outline" size="sm">
                بازگشت به لیست پروژه‌ها
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  const completedCalls = project.completed_calls_count || 0;
  const pendingCalls = (project.calls_count || 0) - completedCalls;

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:h-16">
              <div className="flex items-center mb-4 sm:mb-0">
                <button
                    onClick={() => navigate('/projects')}
                    className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="mr-4 text-lg sm:text-xl font-semibold text-gray-900">{project.name}</h1>
                </div>
              </div>

              {/* Header buttons - show different buttons based on role */}
              {!isCaller && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse w-full sm:w-auto">
                    <Button
                        onClick={handleUploadFiles}
                        variant="outline"
                        className="flex items-center w-full sm:w-auto text-sm sm:text-base"
                        size="sm"
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      آپلود فایل‌ها
                    </Button>
                    <Button
                        onClick={handleNewCallRequest}
                        className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
                        size="sm"
                    >
                      درخواست تماس جدید
                    </Button>
                  </div>
              )}

              {isCaller && (
                  <div className="w-full sm:w-auto">
                    <Button
                        onClick={handleNewCallRequest}
                        className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
                        size="sm"
                    >
                      درخواست تماس جدید
                    </Button>
                  </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Project Info - Always visible */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">اطلاعات پروژه</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">نام پروژه</h3>
                    <p className="text-base sm:text-lg text-gray-900">{project.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">تاریخ ایجاد</h3>
                    <p className="text-base sm:text-lg text-gray-900">
                      {new Date(project.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">توضیحات</h3>
                    <p className="text-gray-900 text-sm sm:text-base">{project.description || 'بدون توضیحات'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards - Only for non-callers */}
            {!isCaller && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="mr-4 sm:mr-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              تماس‌گیرندگان
                            </dt>
                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                              {project.members.length || 0}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="mr-4 sm:mr-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              مخاطبین
                            </dt>
                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                              {project.contacts_count || 0}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="mr-4 sm:mr-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              تماس‌های انجام شده
                            </dt>
                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                              {completedCalls || 0}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="mr-4 sm:mr-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              تماس‌های در انتظار
                            </dt>
                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                              {pendingCalls || 0}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
            )}

            {/* Action Cards - Different for callers vs admins */}
            <div className={`grid gap-4 sm:gap-6 ${
                isCaller
                    ? 'grid-cols-1 justify-center max-w-md mx-auto'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>

              {/* Call request card - visible for all users */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNewCallRequest}>
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">درخواست تماس جدید</h3>
                  <p className="text-gray-600 text-sm">
                    برای شروع تماس جدید در این پروژه کلیک کنید
                  </p>
                </CardContent>
              </Card>

              {/* Admin-only cards */}
              {!isCaller && (
                  <>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleUploadFiles}>
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">آپلود فایل‌ها</h3>
                        <p className="text-gray-600 text-sm">
                          فایل‌های اکسل مخاطبین و تماس‌گیرندگان را آپلود کنید
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewReports}>
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">گزارش‌ها</h3>
                        <p className="text-gray-600 text-sm">
                          مشاهده گزارش‌های تفصیلی این پروژه
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewUsers}>
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">لیست کاربران</h3>
                        <p className="text-gray-600 text-sm">
                          مشاهده و مدیریت کاربران سیستم
                        </p>
                      </CardContent>
                    </Card>
                  </>
              )}
            </div>
          </div>
        </main>
      </div>
  );
};

export default ProjectDetail;