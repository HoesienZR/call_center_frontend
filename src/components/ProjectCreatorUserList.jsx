import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ProjectCreatorUserList = () => {
    const navigate = useNavigate();
    const { projectId } = useParams(); // Get project ID from URL parameters
    const [user, setUser] = useState(null);
    const [projectUsers, setProjectUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toggleLoading, setToggleLoading] = useState(null); // Track which user role is being toggled

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        let parsedUser;
        try {
            parsedUser = JSON.parse(userData);
            if (!parsedUser || typeof parsedUser !== 'object') {
                throw new Error('Invalid user data');
            }
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            localStorage.removeItem('user');
            navigate('/login');
            return;
        }

        setUser(parsedUser);

        // Check if projectId exists
        if (!projectId) {
            console.error('Project ID is required');
            navigate('/dashboard');
            return;
        }

        fetchProjectUsers(token);
    }, [navigate, projectId]);

    // Filter users based on search term
    useEffect(() => {
        const filtered = projectUsers.filter((u) =>
            u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.phone_number && u.phone_number.includes(searchTerm))
        );

        // Sort filtered results: callers first, then contacts
        const sortedFiltered = filtered.sort((a, b) => {
            if (a.role === 'caller' && b.role !== 'caller') return -1;
            if (a.role !== 'caller' && b.role === 'caller') return 1;
            return 0;
        });

        setFilteredUsers(sortedFiltered);
    }, [searchTerm, projectUsers]);

    // Fetch project users from API
    const fetchProjectUsers = async (token) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                throw new Error(`Failed to fetch project users: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            let users = data.results || data;

            // Ensure users is an array
            if (!Array.isArray(users.members)) {
                console.error('Expected users array, got:', users);
                users = [];
            }

            // Sort users: callers first, then contacts
            users = users.members.sort((a, b) => {
                if (a.role === 'caller' && b.role !== 'caller') return -1;
                if (a.role !== 'caller' && b.role === 'caller') return 1;
                return 0;
            });

            setProjectUsers(users);
            setFilteredUsers(users);
        } catch (error) {
            console.error('Error fetching project users:', error);

            // Show user-friendly error message
            alert('خطا در دریافت لیست کاربران. لطفاً دوباره تلاش کنید.');

            if (error.message.includes('401') || error.message.includes('403')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle user role using API
    const handleToggleRole = async (userId, currentRole) => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setToggleLoading(userId); // Show loading for this specific user

            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/toggle-user-role/`, {
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: userId,           // اضافه کردن id
                    user_id: userId,      // حفظ user_id موجود
                    current_role: currentRole
                }),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                throw new Error(`Failed to toggle role: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const newRole = currentRole === 'caller' ? 'contact' : 'caller';

            // Update local state with the new role
            setProjectUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, role: newRole } : u
                ).sort((a, b) => {
                    if (a.role === 'caller' && b.role !== 'caller') return -1;
                    if (a.role !== 'caller' && b.role === 'caller') return 1;
                    return 0;
                })
            );

            // Show success message
            alert(`نقش کاربر با موفقیت به ${newRole === 'caller' ? 'تماس گیرنده' : 'مخاطب'} تغییر یافت.`);

        } catch (error) {
            console.error('Error toggling role:', error);
            alert('خطا در تغییر نقش کاربر. لطفاً دوباره تلاش کنید.');
        } finally {
            setToggleLoading(null);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    if (loading || !user) {
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
                                onClick={handleBack}
                                className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                </div>
                                <h1 className="mr-4 text-xl font-semibold text-gray-900">کاربران پروژه</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <span className="text-sm text-gray-700">
                                خوش آمدید، {user.first_name} {user.last_name}
                            </span>
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
                    {/* Search Input */}
                    <div className="mb-6">
                        <div className="relative bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="جستجو بر اساس نام یا شماره تلفن..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-0 focus:ring-0 focus:outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Project Users List */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900">لیست کاربران پروژه</h2>
                                <span className="text-sm text-gray-500">
                                    تعداد کاربران: {filteredUsers.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((projectUser) => (
                                        <div
                                            key={projectUser.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {projectUser.first_name || 'نامشخص'} {projectUser.last_name || ''}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    تلفن: {projectUser.phone_number || 'نامشخص'}
                                                </p>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-sm text-gray-500 ml-2">نقش:</span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        projectUser.role === 'caller'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {projectUser.role === 'caller' ? 'تماس گیرنده' : 'مخاطب'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleToggleRole(projectUser.id, projectUser.role)}
                                                disabled={toggleLoading === projectUser.id}
                                                className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[150px] ${
                                                    toggleLoading === projectUser.id
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : projectUser.role === 'caller'
                                                            ? 'bg-blue-600 hover:bg-blue-700'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                }`}
                                            >
                                                {toggleLoading === projectUser.id ? (
                                                    <span className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                                        در حال تغییر...
                                                    </span>
                                                ) : (
                                                    projectUser.role === 'caller' ? 'تبدیل به مخاطب' : 'تبدیل به تماس گیرنده'
                                                )}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {searchTerm ? 'هیچ کاربری با این جستجو یافت نشد.' : 'هیچ کاربری در این پروژه وجود ندارد.'}
                                        </p>
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                                            >
                                                پاک کردن جستجو
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectCreatorUserList;