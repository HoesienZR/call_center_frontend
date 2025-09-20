import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Download, Calendar, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '@/config.js';
import * as XLSX from 'xlsx';

const Reports = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchReportsData()
            .catch((error) => {
                console.error('Error in data fetching:', error);
                setError('خطا در بارگذاری داده‌ها');
            })
            .finally(() => setLoading(false));
    }, [navigate, projectId]);

    // تابع اصلی دریافت داده‌ها از API
    const fetchReportsData = async () => {
        try {
            const token = localStorage.getItem('token');
            const startDate = dateRange.start_date ? new Date(dateRange.start_date).toISOString().split('T')[0] : '';
            const endDate = dateRange.end_date ? new Date(dateRange.end_date).toISOString().split('T')[0] : '';

            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('start_date', startDate);
            if (endDate) queryParams.append('end_date', endDate);

            const API_URL = `${API_BASE_URL}/api/project/${projectId}/statistics/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('شما به این صفحه دسترسی ندارید');
                }
                throw new Error('خطا در دریافت داده‌ها');
            }

            const data = await response.json();


            // پردازش پاسخ API بر اساس ساختار جدید
            setProject({
                id: data.project_id,
                name: data.project_name
            });

            setReports({
                // آمار کلی تماس‌ها
                total_calls: data.general_statistics.total_calls || 0,
                answered_calls: data.general_statistics.answered_calls || 0,
                successful_calls: data.general_statistics.successful_calls || 0,
                total_contacts: data.general_statistics.total_contacts || 0,
                success_rate: data.general_statistics.success_rate || 0,
                answer_rate: data.general_statistics.answer_rate || 0,

                // آمار تماس‌گیرندگان
                callers_stats: processCallersStats(data.caller_performance || []),
            });

            setError(null);
        } catch (error) {

            setError(error.message);
            throw error;
        }
    };

    // تابع پردازش آمار تماس‌گیرندگان
    const processCallersStats = (rawCallersData) => {
        if (!Array.isArray(rawCallersData)) {
            return [];
        }


        return rawCallersData.map((caller) => ({
            id: caller.caller_id || Math.random().toString(36).substr(2, 9),
            first_name: caller.first_name || 'نامشخص',
            last_name: caller.last_name || '',
            full_name: caller.full_name || `${caller.first_name || ''} ${caller.last_name || ''}`.trim(),
            username: caller.username || '',
            phone: caller.phone_number || 'نامشخص',
            total_calls: caller.total_calls || 0,
            answered_calls: caller.answered_calls || 0,
            interested_calls: caller.interested_calls || 0,
            no_time_calls: caller.no_time_calls || 0,
            not_interested_calls: caller.not_interested_calls || 0,
            no_answer_calls: caller.no_answer_calls || 0,
            wrong_number_calls: caller.wrong_number_calls || 0,
            pending_calls: caller.pending_calls || 0,
            success_rate: caller.success_rate || 0,
            answer_rate: caller.answer_rate || 0,
            total_duration_seconds: caller.total_duration_seconds || 0,
            avg_duration_seconds: caller.avg_duration_seconds || 0,
            total_duration_formatted: caller.total_duration_formatted || '00:00',
            avg_duration_formatted: caller.avg_duration_formatted || '00:00',
            calls_with_duration: caller.calls_with_duration || 0
        }));
    };

    // تابع نمایش جدول تماس‌گیرندگان
    const renderCallersStatsTable = () => {
        if (!reports || !reports.callers_stats || reports.callers_stats.length === 0) {
            return (
                <div className="text-center py-8">
                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">هیچ آمار تماس‌گیرنده‌ای ثبت نشده است</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            نام تماس‌گیرنده
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            نام کاربری
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            شماره تلفن
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            کل تماس‌ها
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تماس‌های پاسخ داده شده
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تماس‌های موفق
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            عدم علاقه
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            نرخ موفقیت
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            نرخ پاسخ‌دهی
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            کل مدت تماس
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            میانگین مدت تماس
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {reports.callers_stats.map((caller, index) => (
                        <tr key={caller.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {caller.full_name || `${caller.first_name} ${caller.last_name}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {caller.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">
                                {caller.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {caller.total_calls}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {caller.answered_calls}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                {caller.interested_calls}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                {caller.not_interested_calls}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {typeof caller.success_rate === 'number' ? caller.success_rate.toFixed(1) : caller.success_rate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {typeof caller.answer_rate === 'number' ? caller.answer_rate.toFixed(1) : caller.answer_rate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {caller.total_duration_formatted}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {caller.avg_duration_formatted}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // تابع تبدیل تاریخ میلادی به شمسی
    const convertToShamsi = (gregorianDate) => {
        if (!gregorianDate) return '';

        try {
            const date = new Date(gregorianDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            // تبدیل ساده میلادی به شمسی (تقریبی)
            let shamsiYear = year - 621;
            if (month < 3 || (month === 3 && day < 21)) {
                shamsiYear--;
            }

            return `${shamsiYear}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
        } catch (error) {

            return gregorianDate;
        }
    };

    const handleExportReport = async () => {
        try {
            setLoading(true);

            // دریافت داده‌های تفصیلی تماس‌ها برای گزارش اکسل
            const token = localStorage.getItem('token');
            const startDate = dateRange.start_date ? new Date(dateRange.start_date).toISOString().split('T')[0] : '';
            const endDate = dateRange.end_date ? new Date(dateRange.end_date).toISOString().split('T')[0] : '';

            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('start_date', startDate);
            if (endDate) queryParams.append('end_date', endDate);
             // برای دریافت جزئیات تماس‌ها

            const API_URL = `${API_BASE_URL}/api/excel/`;

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('خطا در دریافت اطلاعات تفصیلی');
            }

            const detailedData = await response.json();

            // ایجاد محتوای اکسل
            const excelData = generateExcelData(detailedData);

            // دانلود فایل اکسل
            downloadExcel(excelData, `گزارش_${project?.name || 'پروژه'}_${new Date().toLocaleDateString('fa-IR')}.xlsx`);

        } catch (error) {

            alert('خطا در تولید گزارش: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // تابع تولید داده‌های اکسل
    const generateExcelData = (data) => {


        // بر اساس ساختار JSON که دادید، داده‌ها در results هست
        const calls = data.results || data.calls || data.detailed_calls || [];



        const headers = [
            'ردیف',
            'نام کامل تماس‌گیرنده',
            'نام مخاطب',
            'شماره مخاطب',
            'نام پروژه',
            'شماره تماس‌گیرنده',
            'نتیجه تماس',
            'وضعیت تماس',
            'یادداشت‌ها',
            'مدت زمان تماس (ثانیه)',
            'تاریخ تماس (شمسی)',
            'آدرس',
            'فیلدهای سفارشی'
        ];

        const rows = calls.map((call, index) => {


            return [
                index+1,
                call.caller_name || `${call.caller_first_name || ''} ${call.caller_last_name || ''}`.trim(),
                call.contact_name || call.contact_full_name || 'نامشخص',
                call.contact_phone || call.contact_number || 'نامشخص',
                call.project_name || project?.name || 'نامشخص',
                call.caller_phone || call.caller_number || 'نامشخص',
                call.call_result_display || getCallResultText(call.call_result) || 'نامشخص',
                call.call_status_display || getCallStatusText(call.call_status) || 'نامشخص',
                call.notes || call.description || call.comments || '',
                call.duration || 0,
                convertToShamsi(call.call_date || call.created_at || call.date),
                call.address || call.contact_address || '',
                call.custom_fields || call.additional_info || ''
            ];
        });

        return [headers, ...rows];
    };

    // تابع تبدیل کد نتیجه تماس به متن فارسی
    const getCallResultText = (result) => {
        const resultMap = {
            'interested': 'علاقه‌مند',
            'not_interested': 'عدم علاقه',
            'no_time': 'عدم وقت',
            'callback_requested': 'درخواست تماس مجدد',
            'wrong_number': 'شماره اشتباه',
            'no_answer': 'عدم پاسخ',
            'busy': 'مشغول',
            'unreachable': 'عدم دسترسی',
            'answered': 'پاسخ داده شده',
            'pending': 'در انتظار'
        };
        return resultMap[result] || result || 'نامشخص';
    };

    // تابع تبدیل وضعیت تماس به متن فارسی
    const getCallStatusText = (status) => {
        const statusMap = {
            'completed': 'تکمیل شده',
            'in_progress': 'در حال انجام',
            'failed': 'ناموفق',
            'cancelled': 'لغو شده',
            'scheduled': 'برنامه‌ریزی شده',
            'active': 'فعال',
            'inactive': 'غیرفعال'
        };
        return statusMap[status] || status || 'نامشخص';
    };

    // تابع دانلود فایل اکسل
    const downloadExcel = (data, filename) => {
        // ایجاد workbook اکسل
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();

        // تنظیمات ستون‌ها (عرض)
        const colWidths = [
            { wch: 20 }, // نام کامل تماس‌گیرنده
            { wch: 20 }, // نام مخاطب
            { wch: 15 }, // شماره مخاطب
            { wch: 20 }, // نام پروژه
            { wch: 15 }, // شماره تماس‌گیرنده
            { wch: 15 }, // نتیجه تماس
            { wch: 15 }, // وضعیت تماس
            { wch: 30 }, // یادداشت‌ها
            { wch: 12 }, // مدت زمان
            { wch: 15 }, // تاریخ تماس
            { wch: 25 }, // آدرس
            { wch: 20 }  // فیلدهای سفارشی
        ];
        ws['!cols'] = colWidths;

        // تنظیمات سطر header
        const headerStyle = {
            fill: { fgColor: { rgb: "366092" } },
            font: { color: { rgb: "FFFFFF" }, bold: true },
            alignment: { horizontal: "center", vertical: "center" }
        };

        // اعمال استایل به header
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = headerStyle;
        }

        // تنظیم راست‌چین برای تمام سلول‌ها
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (!ws[cellAddress]) continue;
                if (!ws[cellAddress].s) ws[cellAddress].s = {};
                if (!ws[cellAddress].s.alignment) ws[cellAddress].s.alignment = {};
                ws[cellAddress].s.alignment.horizontal = "right";
                ws[cellAddress].s.alignment.vertical = "center";
            }
        }

        // اضافه کردن worksheet به workbook
        XLSX.utils.book_append_sheet(wb, ws, "گزارش تماس‌ها");

        // تولید فایل اکسل و دانلود
        XLSX.writeFile(wb, filename, {
            bookType: 'xlsx',
            type: 'buffer'
        });

        alert('گزارش اکسل با موفقیت دانلود شد!');
    };

    const handleFilterApply = () => {
        setLoading(true);
        fetchReportsData()
            .catch((error) => {
                console.error('Error applying filter:', error);
                setError('خطا در اعمال فیلتر');
            })
            .finally(() => setLoading(false));
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
                                    گزارش {project?.name || 'پروژه'}
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
                    {/* فیلتر تاریخ */}
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
                                        onClick={handleFilterApply}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        اعمال فیلتر
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* کارت‌های آمار کلی */}
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
                                                    {reports.answered_calls || 0}
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
                                                    {reports.success_rate ? `${reports.success_rate}%` : '0%'}
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
                                                <Phone className="w-5 h-5 text-white" />
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

                    {/* جدول آمار تماس‌گیرندگان */}
                    <Card>
                        <CardHeader>
                            <CardTitle>آمار تماس‌گیرندگان</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderCallersStatsTable()}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Reports;