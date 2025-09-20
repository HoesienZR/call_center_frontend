import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Users, Phone, TrendingUp, Calendar, Download, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import * as XLSX from 'xlsx';

import { API_BASE_URL } from '../config';

// Persian Date Conversion Utility
const gregorianToPersian = (gregorianDate) => {
    const date = new Date(gregorianDate);
    let gYear = date.getFullYear();
    let gMonth = date.getMonth() + 1;
    let gDay = date.getDate();

    // Simple approximation for Gregorian to Persian conversion
    let pYear = gYear - 621;
    let pMonth = gMonth;
    let pDay = gDay;

    // Adjust for Persian calendar's month offset
    if (gMonth <= 3) {
        pMonth = gMonth + 9;
        if (pMonth > 12) {
            pMonth -= 12;
            pYear += 1;
        }
    } else {
        pMonth = gMonth - 3;
    }

    // Adjust for day differences
    if (gMonth <= 3 && gDay > 20) {
        pDay = gDay - 20;
    } else if (gMonth > 3 && gDay > 21) {
        pDay = gDay - 21;
    }

    return `${pYear}/${pMonth.toString().padStart(2, '0')}/${pDay.toString().padStart(2, '0')}`;
};

// Persian Date Picker Component
const PersianDatePicker = ({ value, onChange, placeholder, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPersianYear, setCurrentPersianYear] = useState(1403);
    const [currentPersianMonth, setCurrentPersianMonth] = useState(6);

    const persianMonths = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];

    const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

    const getDaysInPersianMonth = (year, month) => {
        if (month >= 1 && month <= 6) {
            return 31;
        } else if (month >= 7 && month <= 11) {
            return 30;
        } else if (month === 12) {
            return isPersianLeapYear(year) ? 30 : 29;
        }
        return 30;
    };

    const isPersianLeapYear = (year) => {
        const cycle = year % 128;
        const leapYears = [1, 5, 9, 13, 17, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 67, 71, 75, 79, 83, 87, 91, 95, 100, 104, 108, 112, 116, 120, 124];
        return leapYears.includes(cycle);
    };

    const persianToGregorian = (pYear, pMonth, pDay) => {
        let gYear = pYear + 621;
        let gMonth = pMonth - 1;
        let gDay = pDay;

        if (pMonth <= 3) {
            gMonth += 3;
        } else if (pMonth <= 6) {
            gMonth += 3;
        } else if (pMonth <= 9) {
            gMonth += 3;
            if (gMonth > 11) {
                gMonth -= 12;
                gYear++;
            }
        } else {
            gMonth += 3;
            if (gMonth > 11) {
                gMonth -= 12;
                gYear++;
            }
        }

        return new Date(gYear, gMonth, gDay);
    };

    const generatePersianCalendarDays = () => {
        const daysInMonth = getDaysInPersianMonth(currentPersianYear, currentPersianMonth);
        const firstDayOfMonth = persianToGregorian(currentPersianYear, currentPersianMonth, 1);
        const startDayOfWeek = firstDayOfMonth.getDay();

        const days = [];

        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                day,
                persianDate: `${currentPersianYear}/${currentPersianMonth.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`,
                gregorianDate: persianToGregorian(currentPersianYear, currentPersianMonth, day)
            });
        }

        return days;
    };

    const handleDateClick = (dateObj) => {
        if (dateObj) {
            onChange(dateObj.persianDate);
            setIsOpen(false);
        }
    };

    const nextMonth = () => {
        if (currentPersianMonth === 12) {
            setCurrentPersianMonth(1);
            setCurrentPersianYear(currentPersianYear + 1);
        } else {
            setCurrentPersianMonth(currentPersianMonth + 1);
        }
    };

    const prevMonth = () => {
        if (currentPersianMonth === 1) {
            setCurrentPersianMonth(12);
            setCurrentPersianYear(currentPersianYear - 1);
        } else {
            setCurrentPersianMonth(currentPersianMonth - 1);
        }
    };

    return (
        <div className="relative w-full max-w-[300px] sm:max-w-[400px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer bg-white"
            >
                {value || placeholder}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-full max-w-[300px] sm:max-w-[400px]">
                    <div className="flex justify-between items-center p-2 border-b">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
                            <span className="text-lg">‹</span>
                        </button>
                        <div className="text-sm font-medium">
                            {persianMonths[currentPersianMonth - 1]} {currentPersianYear}
                        </div>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                            <span className="text-lg">›</span>
                        </button>
                    </div>

                    <div className="text-center py-1 bg-gray-50 text-xs text-gray-600">
                        {getDaysInPersianMonth(currentPersianYear, currentPersianMonth)} روز
                        {currentPersianMonth === 12 && isPersianLeapYear(currentPersianYear) && " (سال کبیسه)"}
                    </div>

                    <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 py-2">
                        {persianDays.map(day => (
                            <div key={day} className="p-1">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 text-center text-sm">
                        {generatePersianCalendarDays().map((dateObj, index) => (
                            <div
                                key={index}
                                onClick={() => handleDateClick(dateObj)}
                                className={`p-2 cursor-pointer hover:bg-blue-100 ${
                                    dateObj ? 'text-gray-900' : 'text-gray-300'
                                } ${
                                    dateObj && value && dateObj.persianDate === value
                                        ? 'bg-blue-500 text-white'
                                        : ''
                                }`}
                            >
                                {dateObj ? dateObj.day : ''}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: ''
    });

    // Excel Export Function
    const exportToExcel = (data, fileName, sheetName) => {
        try {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);

            const colWidths = data.length > 0 ?
                Object.keys(data[0]).map(() => ({ wch: 20 })) : [];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error creating Excel file:', error);
            return false;
        }
    };

    const exportCallerPerformanceToExcel = () => {
        if (!dashboardData?.callerPerformance?.length) {
            alert('داده‌ای برای دانلود وجود ندارد');
            return;
        }

        const worksheetData = dashboardData.callerPerformance.map((caller, index) => ({
            'ردیف': index + 1,
            'نام تماس‌گیرنده': caller.name || 'نامشخص',
            'شماره تلفن': caller.phone_number || 'نامشخص',
            'نام کاربری': caller.username || 'نامشخص',
            'تعداد کل تماس‌ها': caller.total_calls_all_projects || 0,
            'تماس‌های موفق': caller.total_successful_calls_all_projects || 0,
            'تماس‌های پاسخ داده شده': caller.total_answered_calls_all_projects || 0,
            'نرخ پاسخ‌دهی (درصد)': `${Math.round(caller.overall_response_rate || 0)}%`,
            'نرخ موفقیت (درصد)': `${Math.round(caller.overall_success_rate || 0)}%`,
            'مدت کل تماس‌ها (دقیقه)': Math.round((caller.total_duration_all_projects || 0) / 60),
            'میانگین مدت تماس (ثانیه)': caller.overall_avg_duration || 0,
            'تعداد پروژه‌ها': caller.project_count || 0
        }));

        const currentDate = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
        const fileName = `گزارش_عملکرد_تماس_گیرندگان_${currentDate}.xlsx`;

        if (exportToExcel(worksheetData, fileName, 'گزارش عملکرد')) {
            alert('فایل اکسل با موفقیت دانلود شد!');
        } else {
            alert('خطا در تولید فایل اکسل');
        }
    };

    const handleExportAllReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('لطفاً ابتدا وارد شوید');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/excel/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const results = data.results || [];
            console.log(results);
            if (!results.length) {
                alert('داده‌ای برای دانلود وجود ندارد');
                return;
            }

            const worksheetData = results.map((item, index) => ({
                'ردیف': index + 1,
                'نام تماس‌گیرنده': item.caller_name || 'نامشخص',
                'نام مخاطب': item.contact_name || 'نامشخص',
                'شماره مخاطب': item.contact_phone || 'نامشخص',
                'نام پروژه': item.project_name || 'نامشخص',
                'شماره تماس‌گیرنده': item.caller_phone || 'نامشخص',
                'نتیجه تماس': item.call_result_display || 'نامشخص',
                'وضعیت تماس': item.call_status_display || 'نامشخص',
                'یادداشت‌ها': item.notes || '',
                'مدت زمان (ثانیه)': item.duration !== null ? item.duration : '0',
                'تاریخ تماس': item.call_date ? gregorianToPersian(item.call_date) : 'نامشخص',
                'آدرس':item.address || 'نامشخص',
                'فیلدهای سفارشی': item.custom_fields || '',
            }));

            const currentDate = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
            const fileName = `گزارش_کامل_تماس‌ها_${currentDate}.xlsx`;

            if (exportToExcel(worksheetData, fileName, 'گزارش تماس‌ها')) {
                alert('گزارش کامل با موفقیت دانلود شد!');
            } else {
                alert('خطا در تولید گزارش');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('خطا در دریافت داده‌ها');
        } finally {
            setLoading(false);
        }
    };

    // Convert Persian date to Gregorian for API
    const persianToGregorianForAPI = (persianDate) => {
        const [pYear, pMonth, pDay] = persianDate.split('/').map(Number);
        let gYear = pYear + 621;
        let gMonth = pMonth - 1;
        let gDay = pDay;

        if (pMonth <= 3) {
            gMonth += 3;
        } else if (pMonth <= 6) {
            gMonth += 3;
        } else if (pMonth <= 9) {
            gMonth += 3;
            if (gMonth > 11) {
                gMonth -= 12;
                gYear++;
            }
        } else {
            gMonth += 3;
            if (gMonth > 11) {
                gMonth -= 12;
                gYear++;
            }
        }

        const date = new Date(gYear, gMonth, gDay);
        return date.toISOString().split('T')[0];
    };

    // Fetch dashboard data
    const fetchDashboardData = async (isFiltered = false) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('لطفاً ابتدا وارد شوید');
                return;
            }

            let url = `${API_BASE_URL}/api/admin/dashboard`;
            let method = 'GET';
            let body = null;

            if (isFiltered && dateRange.start_date && dateRange.end_date) {
                method = 'POST';
                body = JSON.stringify({
                    start_date: persianToGregorianForAPI(dateRange.start_date),
                    end_date: persianToGregorianForAPI(dateRange.end_date),
                });
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data)
            let all = data.callStatusDistribution[0].count;
            all += data.callStatusDistribution[1].count;
            all += data.callStatusDistribution[2].count;
            // Process the data to match component expectations
            const processedData = {
                projectLength: data.total_projects || 0,
                total_calls: data.total_calls || 0,
                total_callers: data.total_callers || 0,
                success_rate: data.success_rate || 0,
                projectStats: data.projectStats || [],
                callStatusDistribution: (data.callStatusDistribution || []).map(item => ({
                    name: item.name,
                    value: data.total_calls > 0 ? Math.round((item.count / all) * 100) : 0,
                    count: item.count
                })),
                callTrends: data.callTrends || [],
                callerPerformance: data.callerPerformance || []
            };

            setDashboardData(processedData);

            if (isFiltered) {
                alert('فیلتر با موفقیت اعمال شد!');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            alert('خطا در دریافت داده‌ها');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleFilterApply = () => {
        if (!dateRange.start_date || !dateRange.end_date) {
            alert('لطفاً هر دو تاریخ را انتخاب کنید');
            return;
        }
        fetchDashboardData(true);
    };

    const handleFilterClear = () => {
        setDateRange({ start_date: '', end_date: '' });
        fetchDashboardData(false);
    };

    const handleBackClick = () => {
        // Replace with your actual navigation logic
        window.history.back();
    };

    // Define colors and Persian mappings for call status
    const STATUS_COLORS = {
        interested: '#10B981',
        not_interested: '#EF4444',
        no_time: '#F59E0B',
    };

    const STATUS_NAME_MAP = {
        interested: 'علاقه‌مند',
        not_interested: 'غیر علاقه‌مند',
        no_time: 'عدم وقت'
    };

    const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">داده‌ای برای نمایش وجود ندارد</p>
                    <Button onClick={() => fetchDashboardData()}>
                        تلاش مجدد
                    </Button>
                </div>
            </div>
        );
    }

    // Prepare call trends data with Persian dates
    const callTrendsWithPersianDates = dashboardData.callTrends?.map(trend => ({
        ...trend,
        persianDate: gregorianToPersian(trend.date)
    })) || [];

    // Prepare call status distribution with Persian names
    const callStatusDistributionWithPersianNames = dashboardData.callStatusDistribution?.map(status => ({
        ...status,
        name: STATUS_NAME_MAP[status.name?.toLowerCase()] || status.name
    })) || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <button
                                onClick={handleBackClick}
                                className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="mr-4 text-lg sm:text-xl font-semibold text-gray-900">داشبورد مدیریت</h1>
                            </div>
                        </div>
                        <Button
                            onClick={handleExportAllReports}
                            className="bg-green-600 hover:bg-green-700 text-sm px-3 py-2"
                            disabled={loading}
                        >
                            <Download className="w-4 h-4 ml-2" />
                            دانلود گزارش کلی
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    {/* Date Range Filter */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center text-base sm:text-lg">
                                <Calendar className="w-5 h-5 text-blue-500 ml-2" />
                                فیلتر بازه زمانی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <PersianDatePicker
                                    label="از تاریخ"
                                    placeholder="انتخاب تاریخ شروع"
                                    value={dateRange.start_date}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, start_date: date }))}
                                />
                                <PersianDatePicker
                                    label="تا تاریخ"
                                    placeholder="انتخاب تاریخ پایان"
                                    value={dateRange.end_date}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, end_date: date }))}
                                />
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleFilterApply}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2"
                                        disabled={!dateRange.start_date || !dateRange.end_date || loading}
                                    >
                                        {loading ? 'در حال بارگذاری...' : 'اعمال فیلتر'}
                                    </Button>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleFilterClear}
                                        variant="outline"
                                        className="w-full text-sm py-2"
                                        disabled={loading}
                                    >
                                        پاک کردن فیلتر
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                        <Card>
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="mr-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                                کل پروژه‌ها
                                            </dt>
                                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                                                {dashboardData.projectLength}
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
                                    <div className="mr-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                                کل تماس‌ها
                                            </dt>
                                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                                                {dashboardData.total_calls}
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
                                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="mr-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                                کل تماس‌گیرندگان
                                            </dt>
                                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                                                {dashboardData.total_callers}
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
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="mr-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                                نرخ موفقیت
                                            </dt>
                                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                                                {Math.round(dashboardData.success_rate)}%
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                        {/* Project Performance Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base sm:text-lg">عملکرد پروژه‌ها</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250} className="min-h-[200px] sm:min-h-[250px]">
                                    <BarChart data={dashboardData.projectStats} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
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
                                <CardTitle className="text-base sm:text-lg">توزیع وضعیت تماس‌ها</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-center">
                                    <div className="flex-1 w-full">
                                        <ResponsiveContainer width="100%" height={250} className="min-h-[200px] sm:min-h-[250px]">
                                            <PieChart>
                                                <Pie
                                                    data={callStatusDistributionWithPersianNames}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    dataKey="value"
                                                >
                                                    {callStatusDistributionWithPersianNames.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={STATUS_COLORS[Object.keys(STATUS_NAME_MAP).find(key => STATUS_NAME_MAP[key] === entry.name) || entry.name.toLowerCase()] || COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 sm:mt-0 sm:mr-4">
                                        {callStatusDistributionWithPersianNames.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center mb-2">
                                                <div
                                                    className="w-3 h-3 rounded-full ml-2"
                                                    style={{
                                                        backgroundColor: STATUS_COLORS[Object.keys(STATUS_NAME_MAP).find(key => STATUS_NAME_MAP[key] === entry.name) || entry.name.toLowerCase()] || COLORS[index % COLORS.length]
                                                    }}
                                                ></div>
                                                <span className="text-xs sm:text-sm text-gray-700">
                                                    {entry.name}: {entry.value}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Call Trends Chart */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base sm:text-lg">روند تماس‌ها در طول زمان</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300} className="min-h-[250px] sm:min-h-[300px]">
                                <LineChart data={callTrendsWithPersianDates}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="persianDate" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} name="تماس‌ها" />
                                    <Line type="monotone" dataKey="successful" stroke="#10B981" strokeWidth={2} name="موفق" />
                                    <Legend />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Caller Performance Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex flex-col sm:flex-row items-center justify-between text-base sm:text-lg">
                                عملکرد تماس‌گیرندگان
                                <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                                    <Button
                                        onClick={exportCallerPerformanceToExcel}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm py-2"
                                        disabled={loading}
                                    >
                                        <Download className="w-4 h-4 ml-2" />
                                        دانلود گزارش تماس‌گیرندگان
                                    </Button>
                                    <Button
                                        onClick={handleExportAllReports}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm py-2"
                                        disabled={loading}
                                    >
                                        <Download className="w-4 h-4 ml-2" />
                                        دانلود گزارش کامل
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dashboardData.callerPerformance && dashboardData.callerPerformance.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                تماس‌گیرنده
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                شماره تلفن
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                نام کاربری
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                کل تماس‌ها
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                تماس‌های پاسخ داده شده
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                تماس‌های موفق
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                نرخ پاسخ‌دهی
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                نرخ موفقیت
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                میانگین مدت تماس
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData.callerPerformance.map((caller, index) => (
                                            <tr key={caller.caller_id || index} className="hover:bg-gray-50">
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                                    {caller.name || 'نامشخص'}
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                    {caller.phone_number || 'نامشخص'}
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                    {caller.username || 'نامشخص'}
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                    {caller.total_calls_all_projects || 0}
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                    {caller.total_answered_calls_all_projects || 0}
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                    {caller.total_successful_calls_all_projects || 0}
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        (caller.overall_response_rate || 0) >= 70
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : (caller.overall_response_rate || 0) >= 50
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {Math.round(caller.overall_response_rate || 0)}%
                                                    </span>
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        (caller.overall_success_rate || 0) >= 70
                                                            ? 'bg-green-100 text-green-800'
                                                            : (caller.overall_success_rate || 0) >= 50
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {Math.round(caller.overall_success_rate || 0)}%
                                                    </span>
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                    {Math.round(caller.overall_avg_duration || 0)} ثانیه
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 text-sm sm:text-base">هیچ داده‌ای برای نمایش وجود ندارد</p>
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