import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Phone, User, CheckCircle, Search, XCircle, RefreshCw, MapPin, UserCheck, X, Menu } from 'lucide-react';
import { API_BASE_URL } from '@/config.js';

const CallRequest = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();

    // State های اصلی
    const [allContacts, setAllContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [toast, setToast] = useState(null);
    // State جدید برای ردیابی وضعیت تماس هر مخاطب
    const [callStatuses, setCallStatuses] = useState({});

    // State های کاربر و دسترسی - استفاده از API جدید
    const [userRole, setUserRole] = useState(null);

    // State های خطا و فرم
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [newContact, setNewContact] = useState({
        full_name: '',
        phone: '',
        email: '',
        address: '',
        assigned_caller_phone: '',
        custom_text: '',
        call_status: 'pending',
        is_active: true,
    });

    const getToken = () => localStorage.getItem('token');

    // نمایش پیام toast
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // دریافت نقش کاربر با استفاده از API جدید
    const fetchUserRole = useCallback(async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/user-role/`, {
                headers: { 'Authorization': `Token ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('احراز هویت ناموفق بود. لطفاً دوباره وارد شوید.');
                } else if (response.status === 403) {
                    throw new Error('شما به این پروژه دسترسی ندارید.');
                } else if (response.status === 404) {
                    throw new Error('پروژه یافت نشد.');
                } else {
                    throw new Error('خطا در دریافت اطلاعات کاربر.');
                }
            }

            const roleData = await response.json();
            setUserRole(roleData);
            return roleData;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching user role:', err);
            return null;
        }
    }, [projectId]);

    const fetchContacts = useCallback(async (token, roleData) => {
        if (!roleData || (!roleData.is_admin && !roleData.is_caller)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/contacts/?project_id=${projectId}`, {
                method: 'GET',
                headers: { 'Authorization': `Token ${token}` },
            });

            if (response.status === 404) {
                setAllContacts([]);
            } else if (response.ok) {
                const data = await response.json();
                let contacts = Array.isArray(data.results) ? data.results : [];

                // بک‌اند خودش فیلتر می‌کند، نیازی به فیلتر اضافی نیست
                setAllContacts(contacts);

                // مقداردهی اولیه callStatuses برای هر مخاطب
                const initialStatuses = {};
                contacts.forEach(contact => {
                    initialStatuses[contact.id] = contact.call_status || 'pending';
                });
                setCallStatuses(initialStatuses);
            } else {
                throw new Error('خطا در دریافت لیست مخاطبین.');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching contacts:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate('/login');
            return;
        }

        const initialize = async () => {
            const roleData = await fetchUserRole(token);
            if (roleData) {
                await fetchContacts(token, roleData);
            } else {
                setLoading(false);
            }
        };

        initialize();
    }, [navigate, fetchUserRole, fetchContacts]);

    const handleStartCall = (contactId, phoneNumber) => {
        // Update call status to 'in_progress'
        setCallStatuses(prev => ({
            ...prev,
            [contactId]: 'in_progress'
        }));
        // Open the phone dialer with the contact's phone number
        if (phoneNumber) {
            window.location.href = `tel:${phoneNumber}`;
        }
    };

    const handleEndCall = (contactId) => {
        handleAction(async () => {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
                body: JSON.stringify({ call_status: 'pending' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'خطا در اتمام تماس.');
            }

            // حذف مخاطب از لیست
            setAllContacts(prev => prev.filter(contact => contact.id !== contactId));

            // حذف وضعیت تماس
            setCallStatuses(prev => {
                const newStatuses = { ...prev };
                delete newStatuses[contactId];
                return newStatuses;
            });

            showToast('تماس با موفقیت به اتمام رسید.');
            navigate(`/project/${projectId}/call-feedback/${contactId}`);
        });
    };

    const handleAction = async (actionFunction) => {
        setActionLoading(true);
        setError(null);
        try {
            await actionFunction();
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSkipContact = (contactId) => handleAction(async () => {
        if (!window.confirm('آیا مطمئن هستید که می‌خواهید این مخاطب را رد کنید؟')) return;

        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}/release/`, {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'خطا در رد کردن مخاطب.');
        }

        // حذف مخاطب از لیست
        setAllContacts(prev => prev.filter(contact => contact.id !== contactId));

        // حذف وضعیت تماس
        setCallStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[contactId];
            return newStatuses;
        });

        showToast('مخاطب با موفقیت رد شد.');
    });

    const handleRequestNewContact = () => handleAction(async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/contacts/request_new/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ project_id: parseInt(projectId) }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'خطا در درخواست مخاطب جدید.');
        }
        showToast('درخواست مخاطب جدید ارسال شد.');

        // به‌روزرسانی لیست مخاطبین
        const roleData = await fetchUserRole(token);
        if (roleData) {
            await fetchContacts(token, roleData);
        }
    });

    const validateForm = () => {
        const errors = {};
        if (!newContact.full_name.trim()) {
            errors.full_name = 'نام کامل الزامی است.';
        }
        if (!newContact.phone.trim()) {
            errors.phone = 'شماره تلفن الزامی است.';
        } else if (!/^\d{11}$/.test(newContact.phone.replace(/\D/g, ''))) {
            errors.phone = 'شماره تلفن باید 11 رقمی باشد.';
        }
        if (userRole?.is_admin && newContact.assigned_caller_phone && !/^\d{11}$/.test(newContact.assigned_caller_phone.replace(/\D/g, ''))) {
            errors.assigned_caller_phone = 'شماره تماس تماس‌گیرنده باید 11 رقمی باشد.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        handleAction(async () => {
            const token = getToken();

            const body = {
                full_name: newContact.full_name,
                phone: newContact.phone,
                email: newContact.email,
                address: newContact.address,
                project_id: parseInt(projectId),
                custom_fields: newContact.custom_text || "", // مستقیماً متن ارسال می‌شود
                call_status: newContact.call_status || "pending",
                is_active: newContact.is_active !== undefined ? newContact.is_active : true,
            };

            // اضافه کردن فیلد caller_phone_number فقط برای ادمین‌ها
            if (userRole?.is_admin && newContact.assigned_caller_phone) {
                body.caller_phone_number = newContact.assigned_caller_phone;
            }



            try {
                const response = await fetch(`${API_BASE_URL}/api/contacts/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error adding contact:', errorData);
                    const formattedErrors = {};
                    for (const key in errorData) {
                        formattedErrors[key] = Array.isArray(errorData[key]) ? errorData[key].join(' ') : errorData[key];
                    }
                    setFormErrors(formattedErrors);
                    showToast('خطا در افزودن مخاطب. لطفاً فیلدها را بررسی کنید.', 'error');
                    return;
                }

                // پاک کردن فرم بعد از موفقیت
                setNewContact({
                    full_name: '',
                    phone: '',
                    email: '',
                    address: '',
                    assigned_caller_phone: '',
                    custom_text: '',
                    call_status: 'pending',
                    is_active: true,
                });
                setIsDialogOpen(false);
                setFormErrors({});
                // به‌روزرسانی لیست مخاطبین
                await fetchContacts(token, userRole);
                showToast('مخاطب با موفقیت اضافه شد.');
            } catch (error) {
                console.error('Network or unexpected error:', error);
                setFormErrors({ non_field_errors: 'خطایی در ارتباط با سرور رخ داد.' });
                showToast('خطایی در ارتباط با سرور رخ داد.', 'error');
            }
        });
    };

    const handleDeleteContact = (contactId) => {
        if (!window.confirm('آیا مطمئن هستید که می‌خواهید این مخاطب را حذف کنید؟')) return;

        handleAction(async () => {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'خطا در حذف مخاطب.');
            }
            showToast('مخاطب با موفقیت حذف شد.');

            // به‌روزرسانی لیست مخاطبین
            await fetchContacts(token, userRole);
        });
    };

    // *** تغییر کلیدی: تابع جدید برای بررسی دسترسی ادمین به مخاطب ***
    const canAdminCallContact = (contactData) => {
        // اگر کاربر ادمین نیست، این تابع کاربرد ندارد
        if (!userRole?.is_admin) {
            return false;
        }

        // اگر مخاطب تماس‌گیرنده مشخصی ندارد، ادمین نمی‌تواند تماس بگیرد
        if (!contactData.assigned_caller_phone) {
            return false;
        }

        // بررسی تطابق شماره تلفن ادمین (از فیلد phone) با تماس‌گیرنده مسئول
        const adminPhone = userRole.phone?.replace(/\D/g, '') || '';
        const assignedCallerPhone = contactData.assigned_caller_phone?.replace(/\D/g, '') || '';

        return adminPhone === assignedCallerPhone;
    };

    // کامپوننت نمایش لیست مخاطبین
    const ContactListItem = ({ contactData, index }) => {
        const [showDetails, setShowDetails] = useState(false);

        // *** تغییر کلیدی: بهبود تابع بررسی دسترسی تماس ***
        const canCallContact = () => {
            // اگر API فیلد can_call رو ارسال کرده، از اون استفاده کن

            // *** تغییر کلیدی: بررسی جداگانه برای ادمین ***
            if (userRole?.is_admin) {
                return canAdminCallContact(contactData);
            }

            // اگر کاربر تماس‌گیرنده است و مخاطب برای او اختصاص یافته
            if (userRole?.is_caller) {
                // اگر مخاطب تماس‌گیرنده مشخصی ندارد، همه می‌توانند تماس بگیرند
                if (!contactData.assigned_caller_phone) {
                    return true;
                }

                // بررسی تطابق شماره تلفن کاربر caller با شماره تماس‌گیرنده مسئول
                const userPhone = userRole.phone?.replace(/\D/g, '') || '';
                const assignedCallerPhone = contactData.assigned_caller_phone?.replace(/\D/g, '') || '';

                return userPhone === assignedCallerPhone;
            }

            return false;
        };
        return (
            <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-3 hover:shadow-md transition-shadow duration-200"
                key={contactData.id || index}
            >
                {/* هدر لیست با اطلاعات اصلی - Responsive */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* اطلاعات اصلی مخاطب */}
                    <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{contactData.full_name}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 sm:space-x-reverse mt-1 space-y-1 sm:space-y-0">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                    <span className="text-xs sm:text-sm text-gray-600 font-mono" dir="ltr">{contactData.phone}</span>
                                </div>

                                {contactData.address && (
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                        <span className="text-xs sm:text-sm text-gray-600 truncate max-w-24 sm:max-w-32">{contactData.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* آمار تماس‌ها و دکمه‌های اکشن - Responsive */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
                        {/* آمار تماس‌ها */}
                        <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4 space-x-reverse text-xs sm:text-sm bg-gray-50 rounded-lg p-2 sm:bg-transparent sm:p-0">
                            <div className="text-center">
                                <div className="text-blue-600 font-bold">{contactData.contact_calls_count || 0}</div>
                                <div className="text-gray-500 text-xs">کل تماس ها </div>
                            </div>
                            <div className="text-center">
                                <div className="text-green-600 font-bold">{contactData.contacts_calls_answered_count  || 0}</div>
                                <div className="text-gray-500 text-xs">پاسخ داده </div>
                            </div>
                            <div className="text-center">
                                <div className="text-red-600 font-bold"> { contactData.contacts_calls_rate || 0}</div>
                                <div className="text-gray-500 text-xs">نرخ پاسخدهی</div>
                            </div>
                            <div className="text-center">
                                <div className="text-orange-600 font-bold">{ contactData.contact_calls_not_answered_count || 0}</div>
                                <div className="text-gray-500 text-xs">عدم پاسخ</div>
                            </div>
                        </div>

                        {/* دکمه‌های اکشن */}
                        <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                            <Button
                                onClick={() => setShowDetails(!showDetails)}
                                variant="outline"
                                size="sm"
                                className="rounded-lg text-xs flex-1 sm:flex-none"
                            >
                                {showDetails ? 'کمتر' : 'بیشتر'}
                            </Button>

                            {/* *** تغییر کلیدی: نمایش دکمه‌های تماس با محدودیت ادمین *** */}
                            {canCallContact() ? (
                                <>
                                    {callStatuses[contactData.id] === 'in_progress' ? (
                                        <Button
                                            onClick={() => handleEndCall(contactData.id)}
                                            size="sm"
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex-1 sm:flex-none"
                                            disabled={actionLoading}
                                        >
                                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            <span className="hidden sm:inline">اتمام</span>
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleStartCall(contactData.id, contactData.phone)}
                                            size="sm"
                                            className="bg-green-500 hover:bg-green-600 text-white rounded-lg flex-1 sm:flex-none"
                                            disabled={actionLoading}
                                        >
                                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            <span className="hidden sm:inline">شروع</span>
                                        </Button>
                                    )}

                                    <Button
                                        onClick={() => handleSkipContact(contactData.id)}
                                        variant="destructive"
                                        size="sm"
                                        className="rounded-lg flex-1 sm:flex-none"
                                        disabled={actionLoading}
                                    >
                                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        <span className="hidden sm:inline">رد</span>
                                    </Button>
                                </>
                            ) : (
                                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                                    {/* *** تغییر کلیدی: پیام مخصوص ادمین *** */}
                                    {userRole?.is_admin ?
                                        'شما نمیتوانید با مخاطبین دیگران تماس بگیرید' :
                                        'مخاطب مخصوص شما نیست'
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* جزئیات اضافی که با کلیک نمایش داده می‌شود */}
                {showDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* فیلد سفارشی */}
                            {contactData.custom_fields?.custom_text && (
                                <div className="lg:col-span-1">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">یادداشت سفارشی:</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                        {contactData.custom_fields.custom_text}
                                    </p>
                                </div>
                            )}

                            {/* آدرس کامل */}
                            {contactData.address && (
                                <div className="lg:col-span-1">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">آدرس کامل:</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 break-words">
                                        {contactData.address}
                                    </p>
                                </div>
                            )}

                            {/* تماس‌گیرنده مسئول */}
                            {contactData.assigned_caller && (
                                <div className="lg:col-span-1">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">تماس‌گیرنده مسئول:</h4>
                                    <div className="flex items-center space-x-2 space-x-reverse bg-purple-50 rounded-lg p-3">
                                        <UserCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                        <span className="text-sm text-purple-800 font-medium truncate">{contactData.assigned_caller}</span>
                                    </div>
                                </div>
                            )}

                            {/* یادداشت‌های تماس */}
                            <div className="lg:col-span-2">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">یادداشت‌های تماس:</h4>
                                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                    {contactData.call_notes && contactData.call_notes.length > 0 ? (
                                        <div className="space-y-2">
                                            {contactData.call_notes.map((note, noteIndex) => (
                                                <div key={noteIndex} className="text-sm">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                                                        <span className="font-medium text-gray-700">{note.caller_name || 'ناشناس'}</span>
                                                        <span className="text-xs text-gray-500">{note.created_at}</span>
                                                    </div>
                                                    <p className="text-gray-600 break-words">{note.note}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">هیچ یادداشتی ثبت نشده است.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* وضعیت فعلی تماس */}
                        <div className="mt-3 flex items-center justify-between">
                            <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    callStatuses[contactData.id] === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : callStatuses[contactData.id] === 'in_progress'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                وضعیت: {callStatuses[contactData.id] === 'pending' ? 'در انتظار' :
                                callStatuses[contactData.id] === 'in_progress' ? 'در حال انجام' : 'نامشخص'}
                            </div>

                            {/* نمایش وضعیت دسترسی تماس */}
                            {!canCallContact() && (
                                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                    غیرقابل دسترس برای شما
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const filteredContacts = allContacts.filter((c) =>
        (c.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!userRole || (!userRole.is_admin && !userRole.is_caller)) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
                <Card className="max-w-md w-full bg-white shadow-lg rounded-2xl">
                    <CardContent className="p-6 sm:p-8 text-center">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">عدم دسترسی</h3>
                        <p className="text-gray-600 mb-6">
                            {userRole ?
                                'شما به این بخش دسترسی ندارید. نقش شما در این پروژه مجوز استفاده از این بخش را نمی‌دهد.' :
                                'خطا در تشخیص نقش کاربر.'
                            }
                        </p>
                        <Button
                            onClick={() => navigate(`/`)}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl px-6 py-2 w-full sm:w-auto"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            بازگشت به خانه
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-indigo-100" dir="rtl">
            {toast && (
                <div
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 mx-4 max-w-sm w-full rounded-xl shadow-lg border ${
                        toast.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                    } transition-opacity duration-300`}
                >
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="text-sm">{toast.message}</span>
                    </div>
                </div>
            )}

            <header className="bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/project/${projectId}`)}
                                className="hover:bg-gray-100 rounded-xl transition-colors duration-200 flex-shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent truncate">
                                درخواست تماس
                            </h1>
                            {userRole && (
                                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                    {userRole.role_display}
                                </span>
                            )}
                        </div>
                        {userRole && (userRole.is_admin || userRole.is_caller) && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-3 sm:px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base">
                                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">افزودن مخاطب</span>
                                        <span className="sm:hidden">افزودن</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] sm:max-w-md lg:max-w-lg bg-white rounded-2xl mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">افزودن مخاطب جدید</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddContact} className="space-y-4 sm:space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">نام کامل *</label>
                                                <Input
                                                    type="text"
                                                    placeholder="نام و نام خانوادگی"
                                                    value={newContact.full_name}
                                                    onChange={(e) => setNewContact({ ...newContact, full_name: e.target.value })}
                                                    className="rounded-xl bg-gray-50 focus:ring-indigo-500"
                                                    required
                                                />
                                                {formErrors.full_name && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">شماره تلفن *</label>
                                                <Input
                                                    type="text"
                                                    placeholder="09xxxxxxxxx"
                                                    value={newContact.phone}
                                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                                    dir="ltr"
                                                    className="rounded-xl bg-gray-50 focus:ring-indigo-500"
                                                    required
                                                />
                                                {formErrors.phone && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ایمیل (اختیاری)</label>
                                            <Input
                                                type="email"
                                                placeholder="example@email.com"
                                                value={newContact.email}
                                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                                dir="ltr"
                                                className="rounded-xl bg-gray-50 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">آدرس (اختیاری)</label>
                                            <Textarea
                                                placeholder="آدرس کامل مخاطب"
                                                value={newContact.address}
                                                onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                                                rows={3}
                                                className="rounded-xl bg-gray-50 focus:ring-indigo-500 resize-none"
                                            />
                                        </div>
                                        {userRole?.is_admin && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">شماره تماس تماس‌گیرنده *</label>
                                                <Input
                                                    type="text"
                                                    placeholder="09xxxxxxxxx"
                                                    value={newContact.assigned_caller_phone}
                                                    onChange={(e) => setNewContact({ ...newContact, assigned_caller_phone: e.target.value })}
                                                    dir="ltr"
                                                    className="rounded-xl bg-gray-50 focus:ring-indigo-500"
                                                />
                                                {formErrors.assigned_caller_phone && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.assigned_caller_phone}</p>
                                                )}
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">فیلد سفارشی (اختیاری)</label>
                                            <Textarea
                                                placeholder="متن دلخواه"
                                                value={newContact.custom_text}
                                                onChange={(e) => setNewContact({ ...newContact, custom_text: e.target.value })}
                                                rows={3}
                                                className="rounded-xl bg-gray-50 focus:ring-indigo-500 resize-none"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse pt-4 border-t">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsDialogOpen(false)}
                                                className="rounded-xl border-gray-300 hover:bg-gray-100 w-full sm:w-auto"
                                            >
                                                انصراف
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={actionLoading}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-full sm:w-auto"
                                            >
                                                {actionLoading ? 'در حال افزودن...' : 'افزودن مخاطب'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
                        <div className="flex items-start space-x-2 space-x-reverse">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm font-medium break-words">{error}</p>
                        </div>
                    </div>
                )}

                <div className="mb-6 sm:mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border-0">
                        <CardContent className="p-4 sm:p-6">
                            <div className="relative">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                <Input
                                    placeholder="جستجو در میان مخاطبین..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 sm:pl-12 pr-4 py-3 rounded-xl bg-white/90 border-0 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                {filteredContacts.length} مخاطب یافت شد
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {filteredContacts.length > 0 ? (
                        <>
                            {/* Header لیست */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                        لیست مخاطبین ({filteredContacts.length} مخاطب)
                                    </h2>
                                    <div className="text-sm text-gray-500">
                                        {callStatuses && Object.values(callStatuses).filter(status => status === 'in_progress').length > 0 && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                {Object.values(callStatuses).filter(status => status === 'in_progress').length} تماس در حال انجام
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* لیست مخاطبین */}
                            <div className="space-y-3">
                                {filteredContacts.map((contact, index) => (
                                    <ContactListItem key={contact.id || index} contactData={contact} index={index} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-0">
                            <CardContent className="text-center py-12 sm:py-16 px-4 sm:px-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">مخاطب جدیدی برای شما وجود ندارد</h3>
                                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base max-w-sm mx-auto">در حال حاضر هیچ مخاطب تخصیص یافته‌ای برای تماس وجود ندارد.</p>
                                {userRole?.is_caller && (
                                    <Button
                                        onClick={handleRequestNewContact}
                                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                                        disabled={actionLoading}
                                    >
                                        <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${actionLoading ? 'animate-spin' : ''}`} />
                                        {actionLoading ? 'در حال درخواست...' : 'درخواست مخاطب جدید'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CallRequest;