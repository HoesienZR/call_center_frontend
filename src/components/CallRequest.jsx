import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Phone, User, CheckCircle, Search } from 'lucide-react';
import { API_BASE_URL } from '@/config.js';

const CallRequest = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAdminOrCreator, setIsAdminOrCreator] = useState(false);
    const [currentContactIndex, setCurrentContactIndex] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [newContact, setNewContact] = useState({
        full_name: '',
        phone: '',
        address: '',
        assigned_caller_id: '',
        custom_fields: '',
    });

    useEffect(() => {
        console.log('Project ID from useParams:', projectId);
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUserRole();
        fetchCurrentUser();
        fetchContacts();
    }, [navigate, projectId]);

    useEffect(() => {
        setCurrentContactIndex(0);
    }, [searchTerm]);

    const fetchUserRole = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const user_response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
                headers: { 'Authorization': `Token ${token}` },
            });
            const user_data = await user_response.json();
            const data = await response.json();
            console.log('Project Data:', data, 'User Data:', user_data);
            if (data.created_by.id === user_data.id || user_data.is_staff === true) {
                setIsAdminOrCreator(true);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            setError('خطا در بررسی نقش کاربر.');
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
                headers: { 'Authorization': `Token ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }
            const data = await response.json();
            console.log('Current User:', data);
            setCurrentUser({ id: data.id, first_name: data.first_name, last_name: data.last_name });
        } catch (error) {
            console.error('Error fetching current user:', error);
            setError('خطا در دریافت اطلاعات کاربر.');
        }
    };

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/contacts/caller_pending_contact/${projectId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Fetched Contacts:', data);
            setContacts(data);
            setCurrentContactIndex(0);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setError('خطا در بارگذاری مخاطبین. لطفاً دوباره تلاش کنید.');
            setLoading(false);
        }
    };

    const handleStartCall = (contactId) => {
        navigate(`/project/${projectId}/call-feedback/${contactId}`);
    };

    const handleSkipContact = async (contactId) => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await fetch(`${API_BASE_URL}/api/contacts/remove_assigned_caller/${contactId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to skip contact: ${response.status}`);
            }
            const data = await response.json();
            console.log('Skip Contact Response:', data);
            await fetchContacts();
        } catch (error) {
            console.error('Error skipping contact:', error);
            setError(`خطا در رد کردن مخاطب: ${error.message}`);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!newContact.full_name.trim()) {
            errors.full_name = 'نام کامل الزامی است';
        }
        if (!newContact.phone.trim()) {
            errors.phone = 'شماره تلفن الزامی است';
        } else if (!/^\+?\d{10,15}$/.test(newContact.phone.trim())) {
            errors.phone = 'شماره تلفن معتبر نیست';
        }
        if (!newContact.assigned_caller_id.trim()) {
            errors.assigned_caller_id = 'شناسه تماس‌گیرنده الزامی است';
        } else if (isNaN(parseInt(newContact.assigned_caller_id))) {
            errors.assigned_caller_id = 'شناسه تماس‌گیرنده باید یک عدد معتبر باشد';
        }
        if (newContact.custom_fields) {
            try {
                JSON.parse(newContact.custom_fields);
            } catch {
                errors.custom_fields = 'فیلدهای سفارشی باید یک JSON معتبر باشد';
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (!projectId || isNaN(parseInt(projectId))) {
                throw new Error('شناسه پروژه نامعتبر است');
            }

            const payload = {
                project_id: parseInt(projectId),
                full_name: newContact.full_name.trim(),
                phone: newContact.phone.trim(),
                address: newContact.address ? newContact.address.trim() : '',
                assigned_caller_id: parseInt(newContact.assigned_caller_id),
                custom_fields: newContact.custom_fields ? JSON.parse(newContact.custom_fields || '{}') : {},
            };

            console.log('Sending payload:', payload);

            const response = await fetch(`${API_BASE_URL}/api/contacts/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response:', errorData);
                throw new Error(errorData.detail || JSON.stringify(errorData) || 'Failed to add contact');
            }

            const newContactData = await response.json();
            setContacts((prevContacts) => [...prevContacts, newContactData]);
            setIsDialogOpen(false);
            setNewContact({
                full_name: '',
                phone: '',
                address: '',
                assigned_caller_id: '',
                custom_fields: '',
            });
            setFormErrors({});
            setLoading(false);
        } catch (error) {
            console.error('Error adding contact:', error);
            setError(`خطا در افزودن مخاطب: ${error.message}`);
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter((contact) => {
        const fullName = contact.full_name.toLowerCase();
        const phone = contact.phone.toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = fullName.includes(search) || phone.includes(search);
        console.log('Contact:', contact, 'Matches Search:', matchesSearch);
        return matchesSearch;
    });

    if (loading || !currentUser) {
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
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="mr-4 text-xl font-semibold text-gray-900">لیست درخواست‌های تماس</h1>
                            </div>
                        </div>
                        {isAdminOrCreator && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                                        <Phone className="w-5 h-5 ml-2" />
                                        افزودن مخاطب جدید
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                                    <DialogHeader>
                                        <DialogTitle>افزودن مخاطب جدید</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddContact} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">نام کامل</label>
                                            <Input
                                                value={newContact.full_name}
                                                onChange={(e) => setNewContact({ ...newContact, full_name: e.target.value })}
                                                required
                                                className={formErrors.full_name ? 'border-red-500' : ''}
                                            />
                                            {formErrors.full_name && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">شماره تلفن</label>
                                            <Input
                                                value={newContact.phone}
                                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                                required
                                                dir="ltr"
                                                className={formErrors.phone ? 'border-red-500' : ''}
                                            />
                                            {formErrors.phone && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">آدرس (اختیاری)</label>
                                            <Input
                                                value={newContact.address}
                                                onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">شناسه تماس‌گیرنده</label>
                                            <Input
                                                value={newContact.assigned_caller_id}
                                                onChange={(e) => setNewContact({ ...newContact, assigned_caller_id: e.target.value })}
                                                required
                                                type="number"
                                                className={formErrors.assigned_caller_id ? 'border-red-500' : ''}
                                            />
                                            {formErrors.assigned_caller_id && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.assigned_caller_id}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">فیلدهای سفارشی </label>
                                            <Input
                                                value={newContact.custom_fields}
                                                onChange={(e) => setNewContact({ ...newContact, custom_fields: e.target.value })}
                                                dir="ltr"
                                                className={formErrors.custom_fields ? 'border-red-500' : ''}
                                            />
                                            {formErrors.custom_fields && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.custom_fields}</p>
                                            )}
                                        </div>
                                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                            {loading ? 'در حال افزودن...' : 'افزودن مخاطب'}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0 flex justify-center">
                    <div className="mb-6 w-full max-w-md bg-white rounded-lg shadow-sm p-4">
                        <label className="text-sm font-medium text-gray-600 mb-2 block">جستجو</label>
                        <div className="relative">
                            <Input
                                placeholder="جستجو بر اساس نام یا شماره"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                dir="rtl"
                                className="pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition-all"
                            />
                            <Search className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {filteredContacts.length > 0 && (
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                {filteredContacts.length} مخاطب یافت شد
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-center">
                    {error && (
                        <div className="text-red-600 text-center mb-4">{error}</div>
                    )}
                    {filteredContacts.length === 0 || currentContactIndex >= filteredContacts.length ? (
                        <Card className="w-full max-w-md">
                            <CardContent className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    تمامی تماس‌ها کامل شده است
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    هیچ مخاطب در انتظاری باقی نمانده است.
                                </p>
                                <Button
                                    onClick={() => navigate(`/project/${projectId}`)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    بازگشت به پروژه
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="w-full max-w-md">
                            <CardContent className="p-6 text-center">
                                <div className="flex justify-center items-center mb-4">
                                    <User className="w-5 h-5 text-blue-500 ml-2" />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {filteredContacts[currentContactIndex].full_name}
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">شماره تلفن: </span>
                                        <span className="text-gray-900 font-mono" dir="ltr">
                      {filteredContacts[currentContactIndex].phone}
                    </span>
                                    </div>
                                    {filteredContacts[currentContactIndex].address && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">آدرس: </span>
                                            <span className="text-gray-900">
                        {filteredContacts[currentContactIndex].address}
                      </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">شناسه تماس‌گیرنده: </span>
                                        <span className="text-gray-900">
                      {filteredContacts[currentContactIndex].id || 'تخصیص نشده'}
                    </span>
                                    </div>
                                    {filteredContacts[currentContactIndex].custom_fields && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">فیلدهای سفارشی: </span>
                                            <span className="text-gray-900">
                        {filteredContacts[currentContactIndex].custom_fields || 'ندارد'}
                      </span>
                                        </div>
                                    )}
                                    <div className="mt-6 flex justify-center space-x-2 space-x-reverse">
                                        <Button
                                            onClick={() => handleStartCall(filteredContacts[currentContactIndex].id)}
                                            className="bg-green-600 hover:bg-green-700"
                                            size="sm"
                                        >
                                            <Phone className="w-4 h-4 ml-1" />
                                            تماس
                                        </Button>
                                        <Button
                                            onClick={() => handleSkipContact(filteredContacts[currentContactIndex].id)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            رد
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CallRequest;