import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Users, Phone, TrendingUp, Calendar, Download, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { API_BASE_URL } from "@/config.js";

// Import Excel export functions
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Persian Date Conversion Utility
const gregorianToPersian = (gregorianDate) => {
    // Helper function to convert Gregorian date to Persian (Jalali) date
    const date = new Date(gregorianDate);
    let gYear = date.getFullYear();
    let gMonth = date.getMonth() + 1; // JavaScript months are 0-based
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

    // Adjust for day differences (simplified, not accounting for all edge cases)
    if (gMonth <= 3 && gDay > 20) {
        pDay = gDay - 20;
    } else if (gMonth > 3 && gDay > 21) {
        pDay = gDay - 21;
    }

    // Format as YYYY/MM/DD
    return `${pYear}/${pMonth.toString().padStart(2, '0')}/${pDay.toString().padStart(2, '0')}`;
};

// Persian Date Picker Component
const PersianDatePicker = ({ value, onChange, placeholder, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPersianYear, setCurrentPersianYear] = useState(1403);
    const [currentPersianMonth, setCurrentPersianMonth] = useState(6); // مهر

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
        <div className="relative">
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
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
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
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: ''
    });

    // Excel Export Functions
    const exportCallerPerformanceToExcel = (callerData, projectName = 'همه پروژه‌ها') => {
        try {
            // آماده‌سازی داده‌ها برای اکسل
            const worksheetData = callerData.map((caller, index) => ({
                'ردیف': index + 1,
                'نام تماس‌گیرنده': caller.name || caller.caller_full_name || 'نامشخص',
                'نام کاربری': caller.username || caller.caller_username || 'نامشخص',
                'نام پروژه': caller.project_name || projectName,
                'تعداد کل تماس‌ها': caller.total_calls || 0,
                'تماس‌های پاسخ داده شده': caller.successful_calls || caller.answered_calls || 0,
                'نرخ موفقیت (درصد)': `${caller.success_rate || 0}%`,
                'مدت کل تماس‌ها (دقیقه)': Math.round((caller.total_duration || caller.total_duration_seconds || 0) / 60),
                'میانگین مدت تماس (دقیقه)': caller.avg_duration || Math.round((caller.average_call_duration_seconds || 0) / 60) || 0,
                'مدت کل تماس‌ها (ثانیه)': caller.total_duration_seconds || caller.total_duration || 0,
                'میانگین مدت تماس (ثانیه)': caller.average_call_duration_seconds || (caller.avg_duration * 60) || 0
            }));

            // ایجاد workbook و worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(worksheetData);

            // تنظیم عرض ستون‌ها
            const colWidths = [
                { wch: 8 },   // ردیف
                { wch: 20 },  // نام تماس‌گیرنده
                { wch: 15 },  // نام کاربری
                { wch: 20 },  // نام پروژه
                { wch: 15 },  // تعداد کل تماس‌ها
                { wch: 20 },  // تماس‌های پاسخ داده شده
                { wch: 18 },  // نرخ موفقیت
                { wch: 22 },  // مدت کل تماس‌ها (دقیقه)
                { wch: 25 },  // میانگین مدت تماس (دقیقه)
                { wch: 22 },  // مدت کل تماس‌ها (ثانیه)
                { wch: 25 }   // میانگین مدت تماس (ثانیه)
            ];
            ws['!cols'] = colWidths;

            // اضافه کردن worksheet به workbook
            XLSX.utils.book_append_sheet(wb, ws, 'گزارش عملکرد تماس‌گیرندگان');

            // تولید فایل و دانلود
            const currentDate = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
            const fileName = `گزارش_عملکرد_تماس_گیرندگان_${projectName}_${currentDate}.xlsx`;

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            saveAs(blob, fileName);

            alert('فایل اکسل با موفقیت دانلود شد!');
            return true;
        } catch (error) {
            console.error('خطا در تولید فایل اکسل:', error);
            alert('خطا در تولید فایل اکسل');
            return false;
        }
    };
    const handleExportAllReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/excel/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data from /api/excel/');
            }

            const data = await response.json();
            const results = data.results;

            if (!results || results.length === 0) {
                alert('داده‌ای برای دانلود وجود ندارد');
                return;
            }

            // Map API data to Excel format with Persian headers
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
                'تاریخ تماس': gregorianToPersian(item.call_date),
                'فیلدهای سفارشی': item.custom_fields || '',
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(worksheetData);

            // Set column widths
            const colWidths = [
                { wch: 8 },   // ردیف
                { wch: 20 },  // نام تماس‌گیرنده
                { wch: 20 },  // نام مخاطب
                { wch: 15 },  // شماره مخاطب
                { wch: 20 },  // نام پروژه
                { wch: 15 },  // شماره تماس‌گیرنده
                { wch: 15 },  // نتیجه تماس
                { wch: 15 },  // وضعیت تماس
                { wch: 30 },  // یادداشت‌ها
                { wch: 15 },  // مدت زمان (ثانیه)
                { wch: 15 },  // تاریخ تماس
                { wch: 30 },  // فیلدهای سفارشی
            ];
            ws['!cols'] = colWidths;

            // Append worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'گزارش تماس‌ها');

            // Generate and download the Excel file
            const currentDate = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
            const fileName = `گزارش_کامل_تماس‌ها_${currentDate}.xlsx`;

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            saveAs(blob, fileName);

            alert('گزارش کامل تماس‌ها با موفقیت دانلود شد!');
        } catch (error) {
            console.error('خطا در تولید فایل اکسل:', error);
            alert('خطا در تولید گزارش کامل');
        } finally {
            setLoading(false);
        }
    };
    const exportDashboardStatsToExcel = (dashboardData) => {
        try {
            const wb = XLSX.utils.book_new();

            // آمار کلی
            const generalStats = [
                ['نوع آمار', 'مقدار'],
                ['کل پروژه‌ها', dashboardData.projectLength || 0],
                ['کل تماس‌ها', dashboardData.total_calls || 0],
                ['کل تماس‌گیرندگان', dashboardData.total_callers || 0],
                ['نرخ موفقیت کلی', `${dashboardData.success_rate || 0}%`]
            ];

            const ws1 = XLSX.utils.aoa_to_sheet(generalStats);
            ws1['!cols'] = [{ wch: 20 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, ws1, 'آمار کلی');

            // آمار پروژه‌ها
            if (dashboardData.projectStats && dashboardData.projectStats.length > 0) {
                const projectStats = dashboardData.projectStats.map((project, index) => ({
                    'ردیف': index + 1,
                    'نام پروژه': project.name || 'نامشخص',
                    'کل تماس‌ها': project.total_calls || 0,
                    'تماس‌های موفق': project.successful_calls || 0,
                    'نرخ موفقیت': `${project.success_rate || 0}%`
                }));

                const ws2 = XLSX.utils.json_to_sheet(projectStats);
                ws2['!cols'] = [
                    { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
                ];
                XLSX.utils.book_append_sheet(wb, ws2, 'آمار پروژه‌ها');
            }

            // توزیع وضعیت تماس‌ها
            if (dashboardData.callStatusDistribution && dashboardData.callStatusDistribution.length > 0) {
                const STATUS_NAME_MAP = {
                    interested: 'علاقه‌مند',
                    not_interested: 'غیر علاقه‌مند',
                    no_time: 'عدم وقت'
                };

                const callStatusStats = dashboardData.callStatusDistribution.map((status, index) => ({
                    'ردیف': index + 1,
                    'نوع وضعیت': STATUS_NAME_MAP[status.name.toLowerCase()] || status.name || 'نامشخص',
                    'درصد': `${status.value || 0}%`,
                    'تعداد': status.count || 0
                }));

                const ws3 = XLSX.utils.json_to_sheet(callStatusStats);
                ws3['!cols'] = [
                    { wch: 8 }, { wch: 20 }, { wch: 12 }, { wch: 12 }
                ];
                XLSX.utils.book_append_sheet(wb, ws3, 'توزیع وضعیت تماس‌ها');
            }

            // عملکرد تماس‌گیرندگان
            if (dashboardData.callerPerformance && dashboardData.callerPerformance.length > 0) {
                const callerStats = dashboardData.callerPerformance.map((caller, index) => ({
                    'ردیف': index + 1,
                    'نام تماس‌گیرنده': caller.name || 'نامشخص',
                    'پروژه': caller.project_name || 'نامشخص',
                    'کل تماس‌ها': caller.total_calls || 0,
                    'تماس‌های موفق': caller.successful_calls || 0,
                    'نرخ موفقیت': `${caller.success_rate || 0}%`,
                    'میانگین مدت تماس': `${caller.avg_duration || 0} دقیقه`
                }));

                const ws4 = XLSX.utils.json_to_sheet(callerStats);
                ws4['!cols'] = [
                    { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
                ];
                XLSX.utils.book_append_sheet(wb, ws4, 'عملکرد تماس‌گیرندگان');
            }

            // روند تماس‌ها در طول زمان
            if (dashboardData.callTrends && dashboardData.callTrends.length > 0) {
                const trendStats = dashboardData.callTrends.map((trend, index) => ({
                    'ردیف': index + 1,
                    'تاریخ': gregorianToPersian(trend.date),
                    'تعداد تماس‌ها': trend.calls || 0,
                    'تماس‌های موفق': trend.successful || 0,
                    'نرخ موفقیت': trend.calls > 0 ? `${Math.round((trend.successful / trend.calls) * 100)}%` : '0%'
                }));

                const ws5 = XLSX.utils.json_to_sheet(trendStats);
                ws5['!cols'] = [
                    { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
                ];
                XLSX.utils.book_append_sheet(wb, ws5, 'روند تماس‌ها');
            }

            // تولید فایل و دانلود
            const currentDate = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
            const fileName = `گزارش_کامل_داشبورد_${currentDate}.xlsx`;

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            saveAs(blob, fileName);

            alert('گزارش کامل داشبورد با موفقیت دانلود شد!');
            return true;
        } catch (error) {
            console.error('خطا در تولید فایل اکسل:', error);
            alert('خطا در تولید گزارش کامل');
            return false;
        }
    };

    // Fetch dashboard data from API
    const fetchContact = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setDashboardData(data.data); // Set the API response directly
                console.log('Dashboard data fetched:', data);
            } else {
                console.error('Failed to fetch dashboard data:', response.statusText);
                setDashboardData(null); // Fallback to null if API fails
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setDashboardData(null); // Fallback to null on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchContact();
    }, []);

    const handleBackClick = () => {
        alert('بازگشت به داشبورد اصلی');
    };

    const fetchDashboardData = async () => {
        const persianToGregorianForFilter = (pYear, pMonth, pDay) => {
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

        setLoading(true);
        try {
            // Convert Persian dates to Gregorian if needed
            const startDateParts = dateRange.start_date.split('/').map(Number); // [year, month, day]
            const endDateParts = dateRange.end_date.split('/').map(Number);     // [year, month, day]

            const startGregorian = persianToGregorianForFilter(startDateParts[0], startDateParts[1], startDateParts[2]);
            const endGregorian = persianToGregorianForFilter(endDateParts[0], endDateParts[1], endDateParts[2]);

            // Format Gregorian dates as YYYY-MM-DD
            const formatGregorianDate = (date) => {
                return date.toISOString().split('T')[0]; // e.g., 2024-09-14
            };

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    start_date: formatGregorianDate(startGregorian), // e.g., 2024-09-14
                    end_date: formatGregorianDate(endGregorian),     // e.g., 2024-10-14
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
                alert('فیلتر اعمال شد!');
            } else {
                console.error('Failed to fetch filtered dashboard data:', response.statusText);
                alert('خطا در اعمال فیلتر!');
            }
        } catch (error) {
            console.error('Error fetching filtered dashboard data:', error);
            alert('خطا در اعمال فیلتر!');
        } finally {
            setLoading(false);
        }
    };



    const handleExportCallerPerformance = (projectName = 'همه پروژه‌ها') => {
        if (dashboardData?.callerPerformance && dashboardData.callerPerformance.length > 0) {
            exportCallerPerformanceToExcel(dashboardData.callerPerformance, projectName);
        } else {
            alert('داده‌ای برای دانلود وجود ندارد');
        }
    };

    // Define colors and Persian name mappings for statuses
    const STATUS_COLORS = {
        interested: '#10B981', // Green
        not_interested: '#EF4444', // Red
        no_time: '#F59E0B', // Yellow
    };

    const STATUS_NAME_MAP = {
        interested: 'علاقه‌مند',
        not_interested: 'غیر علاقه‌مند',
        no_time: 'عدم وقت'
    };

    const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

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

    // Fallback UI if no data is available
    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">داده‌ای برای نمایش وجود ندارد</p>
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
        name: STATUS_NAME_MAP[status.name.toLowerCase()] || status.name
    })) || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
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
                                <h1 className="mr-4 text-xl font-semibold text-gray-900">داشبورد مدیریت</h1>
                            </div>
                        </div>
                        <Button
                            onClick={handleExportAllReports}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading}
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
                                        onClick={fetchDashboardData}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        disabled={!dateRange.start_date || !dateRange.end_date || loading}
                                    >
                                        {loading ? 'در حال بارگذاری...' : 'اعمال فیلتر'}
                                    </Button>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={() => {
                                            setDateRange({ start_date: '', end_date: '' });
                                            fetchContact(); // Refetch default data
                                        }}
                                        variant="outline"
                                        className="w-full"
                                        disabled={loading}
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
                                                {dashboardData.projectLength || 0}
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
                                                {dashboardData.total_calls || 0}
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
                                                {dashboardData.total_callers || 0}
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
                                                {dashboardData.success_rate || 0}%
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
                                    <BarChart data={dashboardData.projectStats} margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
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
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height={300}>
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
                                    <div className="mr-4">
                                        {callStatusDistributionWithPersianNames.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center mb-2">
                                                <div
                                                    className="w-3 h-3 rounded-full ml-2"
                                                    style={{ backgroundColor: STATUS_COLORS[Object.keys(STATUS_NAME_MAP).find(key => STATUS_NAME_MAP[key] === entry.name) || entry.name.toLowerCase()] || COLORS[index % COLORS.length] }}
                                                ></div>
                                                <span className="text-sm text-gray-700">
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
                            <CardTitle>روند تماس‌ها در طول زمان</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={callTrendsWithPersianDates}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="persianDate" />
                                    <YAxis />
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
                            <CardTitle className="flex items-center justify-between">
                                عملکرد تماس‌گیرندگان
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleExportCallerPerformance()}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                        disabled={loading}
                                    >
                                        <Download className="w-4 h-4 ml-2" />
                                        دانلود گزارش تماس‌گیرندگان
                                    </Button>
                                    <Button
                                        onClick={handleExportAllReports}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
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
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                تماس‌گیرنده
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                پروژه
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
                                                    {caller.project_name || 'نامشخص'}
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