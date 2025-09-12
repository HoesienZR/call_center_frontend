import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

const UserList = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [callers, setCallers] = useState([]);
    const [myCallers, setMyCallers] = useState([]);
    const [projectCallers, setProjectCallers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        console.log(userData)
        if (!token || !userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchUserData(token);
    }, [navigate]);

    const fetchUserData = async (token) => {
        try {
            const userResponse = await fetch(`${API_BASE_URL}/api/auth/profile`,{
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (userResponse.ok) {

                const userData = await userResponse.json();
                console.log(userData);
                setUser(userData)
            }else {
                console.log("failed to fetch user data ",userResponse.status)
            }
            // Fetch callers (for non-regular users)
            const callersResponse = await fetch(`${API_BASE_URL}/api/users/callers/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (callersResponse.ok) {

                const callersData = await callersResponse.json();
                setCallers(callersData.results || callersData); // Handle paginated or non-paginated response
            } else {
                console.error('Failed to fetch callers:', callersResponse.status);
            }

            // Fetch my callers (accessible to all users)
            const myCallersResponse = await fetch(`${API_BASE_URL}/api/my-callers/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (myCallersResponse.ok) {
                const myCallersData = await myCallersResponse.json();
                setMyCallers(myCallersData.results || myCallersData); // Handle paginated or non-paginated response
            } else {
                console.error('Failed to fetch my callers:', myCallersResponse.status);
            }

            // Fetch project callers (for non-regular users)
            const projectCallersResponse = await fetch(`${API_BASE_URL}/api/project-callers/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (projectCallersResponse.ok) {
                const projectCallersData = await projectCallersResponse.json();
                setProjectCallers(projectCallersData.results || projectCallersData); // Handle paginated or non-paginated response
            } else {
                console.error('Failed to fetch project callers:', projectCallersResponse.status);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
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

    const isRegularUser = user.role === 'regular';
    const showCallers = !isRegularUser;
    const showProjectCallers = !isRegularUser;

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
                                <h1 className="mr-4 text-xl font-semibold text-gray-900">لیست کاربران</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <span className="text-sm text-gray-700">خوش آمدید، {user.username}</span>
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
                    {/* Current User Info */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">اطلاعات کاربر فعلی</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">نام کاربری:</span>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">شناسه کاربر:</span>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{user.id}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">نقش:</span>
                                    <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">{user.profile.role || 'نامشخص'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Access Section */}
                    {isRegularUser && (
                        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                            <div className="px-4 py-5 sm:p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">دسترسی</h2>
                                <p className="text-sm text-gray-600">شما به عنوان کاربر عادی تنها به بخش تماس گیرندگان من دسترسی دارید.</p>
                            </div>
                        </div>
                    )}

                    {/* Callers List */}
                    {showCallers && (
                        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                            <div className="px-4 py-5 sm:p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">تماس گیرندگان</h2>
                                <div className="space-y-3">
                                    {callers.length > 0 ? (
                                        callers.map((caller) => (
                                            <div key={caller.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{caller.first_name} {caller.last_name}</p>
                                                    <p className="text-sm text-gray-500">شناسه: {caller.id}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600">هیچ تماس گیرنده‌ای یافت نشد.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Callers */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">تماس گیرندگان من</h2>
                            <div className="space-y-3">
                                {myCallers.length > 0 ? (
                                    myCallers.map((caller) => (
                                        <div key={caller.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{caller.name}</p>
                                                <p className="text-sm text-gray-500">تلفن: {caller.phone_number}</p>
                                                <p className="text-sm text-gray-500">پروژه: {caller.project?.name || 'نامشخص'}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">هیچ تماس گیرنده‌ای یافت نشد.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Project Callers */}
                    {showProjectCallers && (
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">تماس گیرندگان پروژه‌های من</h2>
                                <div className="space-y-3">
                                    {projectCallers.length > 0 ? (
                                        projectCallers.map((caller) => (
                                            <div key={caller.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{caller.name}</p>
                                                    <p className="text-sm text-gray-500">تلفن: {caller.phone_number}</p>
                                                    <p className="text-sm text-gray-500">پروژه: {caller.project?.name || 'نامشخص'}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600">هیچ تماس گیرنده‌ای یافت نشد.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserList;