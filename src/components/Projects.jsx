import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox'; // Added Checkbox import
import { ArrowLeft, Plus, Upload, Users, Phone, FileText, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    created_by_id: '',
    show: false, // Added show field to state
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // دریافت اطلاعات کاربر و پروژه‌ها
    fetchUser();
    fetchProjects();
  }, [navigate]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (userResponse.ok) {
        const data = await userResponse.json();
        // تنظیم created_by_id با استفاده از id کاربر
        setNewProject((prev) => ({ ...prev, created_by_id: data.id }));
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/projects/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.results);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/projects/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          created_by_id: newProject.created_by_id,
          show: newProject.show, // Added show field to the request body
        }),
      });

      if (response.ok) {
        const project = await response.json();
        setProjects([...projects, project]);
        // ریست فرم با حفظ created_by_id و بازنشانی show
        setNewProject({ name: '', description: '', created_by_id: newProject.created_by_id, show: false });
        setShowCreateForm(false);
      } else {
        console.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleUploadFiles = (projectId) => {
    navigate(`/project/${projectId}/upload`);
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
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="mr-4 text-xl font-semibold text-gray-900">مدیریت پروژه‌ها</h1>
                </div>
              </div>
              <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 ml-2" />
                پروژه جدید
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Create Project Form */}
            {showCreateForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>ایجاد پروژه جدید</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نام پروژه
                        </label>
                        <Input
                            type="text"
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            placeholder="نام پروژه را وارد کنید"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          توضیحات
                        </label>
                        <textarea
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            placeholder="توضیحات پروژه را وارد کنید"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows="3"
                        />
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                            id="show"
                            checked={newProject.show}
                            onCheckedChange={(checked) => setNewProject({ ...newProject, show: checked })}
                        />
                        <label
                            htmlFor="show"
                            className="mr-2 text-sm font-medium text-gray-700"
                        >
                          تاریخ تماس مخاطبین
                        </label>
                      </div>
                      <div className="flex space-x-4 space-x-reverse">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          ایجاد پروژه
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateForm(false)}
                        >
                          انصراف
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
            )}

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      هیچ پروژه‌ای یافت نشد
                    </h3>
                    <p className="text-gray-600 mb-6">
                      برای شروع، اولین پروژه خود را ایجاد کنید
                    </p>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      ایجاد پروژه جدید
                    </Button>
                  </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="truncate">{project.name}</span>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-500">
                          {new Date(project.created_at).toLocaleDateString('fa-IR')}
                        </span>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {project.description || 'بدون توضیحات'}
                          </p>

                          {/* Project Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 text-blue-500 ml-2" />
                              <span className="text-sm text-gray-600">
                          {project.members.length || 0} تماس‌گیرنده
                        </span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-green-500 ml-2" />
                              <span className="text-sm text-gray-600">
                          {project.contacts_count || 0} مخاطب
                        </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 space-x-reverse">
                            <Button
                                onClick={() => handleProjectClick(project.id)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                size="sm"
                            >
                              مشاهده جزئیات
                            </Button>
                            <Button
                                onClick={() => handleUploadFiles(project.id)}
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
            )}
          </div>
        </main>
      </div>
  );
};

export default Projects;