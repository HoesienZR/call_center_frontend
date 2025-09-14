import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Download, Calendar, Users, Phone, CheckCircle, XCircle, Clock, Edit2 } from 'lucide-react';
import { API_BASE_URL } from '@/config.js';
import moment from 'jalali-moment';

const Reports = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [reports, setReports] = useState(null);
    const [calls, setCalls] = useState([]);
    const [contacts, setContacts] = useState([]); // لیست کاربران مخاطب
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: '',
    });
    const [isProjectCreator, setIsProjectCreator] = useState(false); // فرض بر چک کردن نقش کاربر سازنده

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        // Fetch statistics, contacts, and check creator status concurrently
        Promise.all([
            fetchReportsData(),
            fetchContacts(),
            fetchProjectCreatorStatus()
        ])
            .catch((error) => {
                console.error('Error in data fetching:', error);
                setError('خطا در بارگذاری داده‌ها');
            })
            .finally(() => setLoading(false));
    }, [navigate, projectId]);

    const fetchReportsData = async () => {
        try {
            const token = localStorage.getItem('token');
            const startDate = dateRange.start_date ? new Date(dateRange.start_date).toISOString().split('T')[0] : '';
            const endDate = dateRange.end_date ? new Date(dateRange.end_date).toISOString().split('T')[0] : '';

            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('start_date', startDate);
            if (endDate) queryParams.append('end_date', endDate);

            const response = await fetch(
                `${API_BASE_URL}/api/projects/${projectId}/statistics/?${queryParams.toString()}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('شما به این صفحه دسترسی ندارید');
                }
                throw new Error('خطا در دریافت داده‌ها');
            }

            const data = await response.json();
            console.log('Statistics API Response:', data);

            // Transform API response to match component's expected structure
            setProject({
                name: 'پروژه بدون نام', // Default since API doesn't provide project name
                id: projectId,
            });
            setReports({
                total_calls: data.total_calls || 0,
                answered_calls_rate: data.success_rate || 0, // Map success_rate to answered_calls_rate
                not_interested_calls: data.call_results_distribution?.not_interested || 0,
                call_results_distribution: {
                    answer: data.call_results_distribution?.answered || 0, // Map answered to answer
                    no_answer: data.call_results_distribution?.no_answer || 0,
                    busy: data.call_results_distribution?.busy || 0,
                    unreachable: data.call_results_distribution?.unreachable || 0,
                    wrong_number: data.call_results_distribution?.wrong_number || 0,
                    not_interested: data.call_results_distribution?.not_interested || 0,
                    callback_requested: data.call_results_distribution?.callback_requested || 0,
                },
                total_contacts: data.total_contacts || 0, // New field from API
                total_callers: data.total_callers || 0, // New field from API
                total_duration_seconds: data.total_duration_seconds || 0, // New field
                average_call_duration_seconds: data.average_call_duration_seconds || 0, // New field
            });
            setCalls(Array.isArray(data.calls) ? data.calls : []); // Fixed bug: check data.calls, not data.call_results_distribution
            setError(null);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setError(error.message);
            setCalls([]);
            throw error; // Re-throw for Promise.all
        }
    };

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/contacts/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('شما به لیست مخاطبان دسترسی ندارید');
                }
                throw new Error('خطا در دریافت لیست مخاطبان');
            }

            const data = await response.json();
            console.log('Contacts API Response:', data);

            // Transform contacts data
            const transformedContacts = Array.isArray(data)
                ? data.map((contact) => ({
                    id: contact.id || Math.random().toString(36).substr(2, 9),
                    first_name: contact.first_name || contact.name || 'نامشخص',
                    last_name: contact.last_name || '',
                    phone: contact.phone || 'نامشخص',
                    role: contact.role || 'مخاطب',
                }))
                : [];
            setContacts(transformedContacts);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
            throw error; // Re-throw for Promise.all
        }
    };

    const fetchProjectCreatorStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            // فرض بر وجود API برای چک نقش کاربر در پروژه
            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/user-role/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('خطا در دریافت نقش کاربر');
            }

            const data = await response.json();
            setIsProjectCreator(data.is_creator || false); // فرض بر فیلد is_creator در پاسخ API
        } catch (error) {
            console.error('Error fetching creator status:', error);
            setIsProjectCreator(false);
            throw error;
        }
    };

    const handleEditUserRole = (userId, userType) => {
        // هدایت به صفحه ویرایش نقش کاربر
        navigate(`/project/${projectId}/${userType}s/${userId}/edit-role`);
    };

    const handleExportReport = async () => {
        alert('دانلود گزارش شبیه‌سازی شد.');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'answered':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'no_answer':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'busy':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'invalid_number':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'unreachable':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'wrong_number':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'not_interested':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'callback_requested':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <Phone className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            answered: 'پاسخ داده شد',
            no_answer: 'پاسخ نداد',
            busy: 'مشغول',
            invalid_number: 'شماره نامعتبر',
            unreachable: 'در دسترس نیست',
            wrong_number: 'شماره اشتباه',
            not_interested: 'علاقه‌مند نیست',
            callback_requested: 'درخواست تماس مجدد',
        };
        return labels[status] || status || 'نامشخص';
    };

    const getResultLabel = (result) => {
        const labels = {
            pending: 'در انتظار',
            in_progress: 'در حال انجام',
            completed: 'تکمیل شده',
            follow_up: 'نیاز به پیگیری',
            cancelled: 'لغو شده',
        };
        return labels[result] || result || '-';
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

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">{error}</p>
                        <Button
                            onClick={() => navigate(`/project/${projectId}`)}
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4 ml-2" />
                            بازگشت به پروژه
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(`/project/${projectId}`)}
                                className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="mr-4 text-xl font-semibold text-gray-900">
                                    گزارش‌ {project?.name || 'پروژه'}
                                </h1>
                            </div>
                        </div>
                        <Button
                            onClick={handleExportReport}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Download className="w-4 h-4 ml-2" />
                            دانلود گزارش
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="w-5 h-5 text-blue-500 ml-2" />
                                فیلتر بازه زمانی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        از تاریخ
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start_date}
                                        onChange={(e) => setDateRange((prev) => ({ ...prev, start_date: e.target.value }))}
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
                                        onChange={(e) => setDateRange((prev) => ({ ...prev, end_date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={fetchReportsData}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        اعمال فیلتر
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {reports && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="mr-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    کل تماس‌ها
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {reports.total_calls || 0}
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
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="mr-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    پاسخ داده شده
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {reports.call_results_distribution?.answer || 0}
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
                                                <Clock className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="mr-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    نرخ موفقیت
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {reports.answered_calls_rate || 0}%
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
                                                    تعداد مخاطبین
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {reports.total_contacts || 0}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* لیست کاربران مخاطب */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="w-5 h-5 text-green-500 ml-2" />
                                کاربران مخاطب
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {contacts.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">هیچ مخاطبی برای این پروژه ثبت نشده است</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                نام و نام خانوادگی
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                شماره تماس
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                سطح دسترسی
                                            </th>
                                            {isProjectCreator && (
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    عملیات
                                                </th>
                                            )}
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {contacts.map((contact) => (
                                            <tr key={contact.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {contact.first_name} {contact.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">
                                                    {contact.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {contact.role}
                                                </td>
                                                {isProjectCreator && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditUserRole(contact.id, 'contact')}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>آخرین تماس‌ها</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {calls.length === 0 ? (
                                <div className="text-center py-8">
                                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">هیچ تماسی ثبت نشده است</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                مخاطب
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                تماس‌گیرنده
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                وضعیت
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                نتیجه
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                تاریخ
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {calls.map((call) => (
                                            <tr key={call.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {call.contact?.full_name || 'نامشخص'}
                                                        </div>
                                                        <div className="text-sm text-gray-500" dir="ltr">
                                                            {call.contact?.phone || 'نامشخص'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {call.caller?.first_name || 'نامشخص'} {call.caller?.last_name || ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getStatusIcon(call.call_result)}
                                                        <span className="mr-2 text-sm text-gray-900">
                                {getStatusLabel(call.call_result)}
                              </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {call.status ? getResultLabel(call.status) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {moment(call.call_date).locale('fa').format('YYYY/MM/DD')}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Reports;