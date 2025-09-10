import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Phone, FileText, Upload, Download, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '../config';
const ProjectDetail = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [callers, setCallers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProjectData();
  }, [navigate, projectId]);

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
      console.log(projectResponse)
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
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
        console.log(callersData);
        setCallers(callersData.results);
      }

      // Fetch project contacts
      const contactsResponse = await fetch(`${API_BASE_URL}/api/contacts/by_projects/${projectId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

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

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              پروژه یافت نشد
            </h3>
            <Button onClick={() => navigate('/projects')} variant="outline">
              بازگشت به لیست پروژه‌ها
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const completedCalls = project.completed_calls_count
  const pendingCalls = project.calls_count - completedCalls ;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
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
                <h1 className="mr-4 text-xl font-semibold text-gray-900">{project.name}</h1>
              </div>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <Button
                onClick={handleUploadFiles}
                variant="outline"
                className="flex items-center"
              >
                <Upload className="w-4 h-4 ml-2" />
                آپلود فایل‌ها
              </Button>
              <Button
                onClick={handleNewCallRequest}
                className="bg-blue-600 hover:bg-blue-700"
              >
                درخواست تماس جدید
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Project Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>اطلاعات پروژه</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">نام پروژه</h3>
                  <p className="text-lg text-gray-900">{project.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">تاریخ ایجاد</h3>
                  <p className="text-lg text-gray-900">
                    {new Date(project.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">توضیحات</h3>
                  <p className="text-gray-900">{project.description || 'بدون توضیحات'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        تماس‌گیرندگان
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {project.callers_count}
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
                        مخاطبین
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {project.contacts_count}
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
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        تماس‌های انجام شده
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {completedCalls}
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
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        تماس‌های در انتظار
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pendingCalls}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNewCallRequest}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">درخواست تماس جدید</h3>
                <p className="text-gray-600 text-sm">
                  برای شروع تماس جدید در این پروژه کلیک کنید
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleUploadFiles}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">آپلود فایل‌ها</h3>
                <p className="text-gray-600 text-sm">
                  فایل‌های اکسل مخاطبین و تماس‌گیرندگان را آپلود کنید
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewReports}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">گزارش‌ها</h3>
                <p className="text-gray-600 text-sm">
                  مشاهده گزارش‌های تفصیلی این پروژه
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;

