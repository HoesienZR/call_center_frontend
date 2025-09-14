import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileSpreadsheet, Users, Phone, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '../config';

const FileUpload = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [contactsFile, setContactsFile] = useState(null);
  const [callersFile, setCallersFile] = useState(null);
  const [usersFile, setUsersFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    contacts: null,
    callers: null,
    users: null,
  });

  const handleFileChange = (type, file) => {
    if (type === 'contacts') {
      setContactsFile(file);
      setUploadStatus((prev) => ({ ...prev, contacts: null }));
    } else if (type === 'callers') {
      setCallersFile(file);
      setUploadStatus((prev) => ({ ...prev, callers: null }));
    } else if (type === 'users') {
      setUsersFile(file);
      setUploadStatus((prev) => ({ ...prev, users: null }));
    }
  };

  // تابع آپلود مخاطبین با endpoint صحیح
  const handleUploadContacts = async () => {
    if (!contactsFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', contactsFile);
    formData.append('project_id', projectId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/contacts/upload-contacts/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        let message = `فایل با موفقیت پردازش شد. `;
        message += `${data.successful_count || 0} مخاطب جدید اضافه شد، `;
        message += `${data.updated_count || 0} مخاطب به‌روزرسانی شد.`;

        if (data.failed_count > 0) {
          message += ` ${data.failed_count} خطا رخ داد.`;
        }

        setUploadStatus((prev) => ({
          ...prev,
          contacts: {
            success: true,
            message,
            successful_contacts: data.successful_contacts,
            updated_contacts: data.updated_contacts,
            failed_contacts: data.failed_contacts,
            callers_count: data.callers_count
          },
        }));
      } else {
        const errorData = await response.json();
        setUploadStatus((prev) => ({
          ...prev,
          contacts: {
            success: false,
            message: errorData.error || 'خطا در آپلود فایل',
            failed_contacts: errorData.failed_contacts
          },
        }));
      }
    } catch (error) {
      setUploadStatus((prev) => ({
        ...prev,
        contacts: { success: false, message: 'خطا در ارتباط با سرور' },
      }));
    }
    setUploading(false);
  };

  // تابع آپلود تماس‌گیرندگان
  const handleUploadCallers = async () => {
    if (!callersFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', callersFile);
    formData.append('project_id', projectId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/upload-callers/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        let message = `فایل با موفقیت آپلود شد. `;
        message += `${data.callers_updated || 0} تماس‌گیرنده به‌روزرسانی شد، `;
        message += `${data.callers_assigned || 0} تماس‌گیرنده به پروژه تخصیص یافت.`;

        if (data.total_errors > 0) {
          message += ` ${data.total_errors} خطا رخ داد.`;
        }

        setUploadStatus((prev) => ({
          ...prev,
          callers: {
            success: true,
            message,
            errors: data.errors
          },
        }));
      } else {
        const errorData = await response.json();
        setUploadStatus((prev) => ({
          ...prev,
          callers: {
            success: false,
            message: errorData.error || 'خطا در آپلود فایل',
            errors: errorData.errors
          },
        }));
      }
    } catch (error) {
      setUploadStatus((prev) => ({
        ...prev,
        callers: { success: false, message: 'خطا در ارتباط با سرور' },
      }));
    }
    setUploading(false);
  };

  // تابع آپلود کاربران (اگر این endpoint موجود باشد)
  const handleUploadUsers = async () => {
    if (!usersFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', usersFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/upload-users/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        let message = `فایل با موفقیت پردازش شد. `;
        message += `${data.successful_count || 0} کاربر جدید ایجاد شد، `;
        message += `${data.updated_count || 0} کاربر به پروژه اضافه شد.`;

        if (data.failed_count > 0) {
          message += ` ${data.failed_count} خطا رخ داد.`;
        }

        setUploadStatus((prev) => ({
          ...prev,
          users: {
            success: true,
            message,
            successful_users: data.successful_users,
            updated_users: data.updated_users,
            failed_users: data.failed_users
          },
        }));
      } else {
        const errorData = await response.json();
        setUploadStatus((prev) => ({
          ...prev,
          users: {
            success: false,
            message: errorData.error || 'خطا در آپلود فایل',
            failed_users: errorData.failed_users
          },
        }));
      }
    } catch (error) {
      setUploadStatus((prev) => ({
        ...prev,
        users: { success: false, message: 'خطا در ارتباط با سرور' },
      }));
    }
    setUploading(false);
  };

  const handleUploadAll = async () => {
    if (!contactsFile && !callersFile && !usersFile) return;

    setUploading(true);

    if (usersFile) {
      await handleUploadUsers();
    }

    if (contactsFile) {
      await handleUploadContacts();
    }

    if (callersFile) {
      await handleUploadCallers();
    }

    setUploading(false);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
        {/* Header */}
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
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="mr-4 text-xl font-semibold text-gray-900">آپلود فایل‌ها</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Instructions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-500 ml-2" />
                  راهنمای آپلود فایل‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">فایل مخاطبین (Contacts)</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      فایل اکسل حاوی اطلاعات مخاطبینی که قرار است با آن‌ها تماس گرفته شود.
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>ستون‌های الزامی: phone (شماره تلفن)</li>
                      <li>ستون‌های اختیاری: full_name (نام کامل), email (ایمیل), address (آدرس),custom_fields(اطلاعات سفارشی)</li>
                      <li>اگر نام کامل وارد نشود، از "مخاطب + شماره تلفن" استفاده می‌شود</li>
                      <li>تمام مخاطبین به‌صورت تصادفی به تماس‌گیرندگان موجود در پروژه تخصیص داده می‌شوند</li>
                      <li>فرمت فایل: Excel (.xlsx, .xls)</li>
                    </ul>
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                      <strong>نمونه فرمت:</strong> phone | full_name | email | address | custom_fields
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">فایل تماس‌گیرندگان (Callers)</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      فایل اکسل حاوی اطلاعات افرادی که قرار است تماس بگیرند.
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>ستون‌های مورد نیاز: phone_number</li>
                      <li>فرمت فایل: Excel (.xlsx, .xls) </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Contacts Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-500 ml-2" />
                    آپلود فایل مخاطبین
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        انتخاب فایل اکسل مخاطبین
                      </label>
                      <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleFileChange('contacts', e.target.files[0])}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>

                    {contactsFile && (
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5 text-blue-500 ml-2" />
                          <span className="text-sm text-blue-700">{contactsFile.name}</span>
                        </div>
                    )}

                    {uploadStatus.contacts && (
                        <div className={`flex items-start p-3 rounded-lg ${uploadStatus.contacts.success ? 'bg-green-50' : 'bg-red-50'}`}>
                          {uploadStatus.contacts.success ? (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-2 mt-0.5 flex-shrink-0" />
                          ) : (
                              <AlertCircle className="w-5 h-5 text-red-500 ml-2 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className={`text-sm ${uploadStatus.contacts.success ? 'text-green-700' : 'text-red-700'}`}>
                              {uploadStatus.contacts.message}
                            </span>

                            {/* نمایش جزئیات مخاطبین موفق */}
                            {uploadStatus.contacts.successful_contacts && uploadStatus.contacts.successful_contacts.length > 0 && (
                                <div className="mt-2 text-xs text-green-800">
                                  <p className="font-medium">مخاطبین جدید:</p>
                                  <ul className="list-disc list-inside">
                                    {uploadStatus.contacts.successful_contacts.slice(0, 3).map((contact, index) => (
                                        <li key={index}>{contact.full_name} - {contact.phone} → {contact.assigned_caller}</li>
                                    ))}
                                    {uploadStatus.contacts.successful_contacts.length > 3 && (
                                        <li>و {uploadStatus.contacts.successful_contacts.length - 3} مخاطب دیگر...</li>
                                    )}
                                  </ul>
                                </div>
                            )}

                            {/* نمایش جزئیات مخاطبین به‌روزرسانی شده */}
                            {uploadStatus.contacts.updated_contacts && uploadStatus.contacts.updated_contacts.length > 0 && (
                                <div className="mt-2 text-xs text-blue-800">
                                  <p className="font-medium">مخاطبین به‌روزرسانی شده:</p>
                                  <ul className="list-disc list-inside">
                                    {uploadStatus.contacts.updated_contacts.slice(0, 2).map((contact, index) => (
                                        <li key={index}>{contact.full_name} - {contact.phone} → {contact.assigned_caller}</li>
                                    ))}
                                    {uploadStatus.contacts.updated_contacts.length > 2 && (
                                        <li>و {uploadStatus.contacts.updated_contacts.length - 2} مخاطب دیگر...</li>
                                    )}
                                  </ul>
                                </div>
                            )}

                            {/* نمایش تعداد تماس‌گیرندگان */}
                            {uploadStatus.contacts.callers_count && (
                                <div className="mt-2 text-xs text-gray-700">
                                  تخصیص بین {uploadStatus.contacts.callers_count} تماس‌گیرنده فعال انجام شد
                                </div>
                            )}
                          </div>
                        </div>
                    )}

                    {/* نمایش خطاها */}
                    {uploadStatus.contacts && uploadStatus.contacts.failed_contacts && uploadStatus.contacts.failed_contacts.length > 0 && (
                        <div className="mt-2 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-800">خطاها:</p>
                          <ul className="list-disc list-inside text-xs text-red-700">
                            {uploadStatus.contacts.failed_contacts.slice(0, 3).map((error, index) => (
                                <li key={index}>ردیف {error.row}: {error.error}</li>
                            ))}
                            {uploadStatus.contacts.failed_contacts.length > 3 && (
                                <li>و {uploadStatus.contacts.failed_contacts.length - 3} خطای دیگر...</li>
                            )}
                          </ul>
                        </div>
                    )}

                    <Button
                        onClick={handleUploadContacts}
                        disabled={!contactsFile || uploading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {uploading ? 'در حال آپلود...' : 'آپلود فایل مخاطبین'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Callers Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 text-green-500 ml-2" />
                    آپلود فایل تماس‌گیرندگان
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        انتخاب فایل اکسل تماس‌گیرندگان
                      </label>
                      <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => handleFileChange('callers', e.target.files[0])}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </div>

                    {callersFile && (
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5 text-green-500 ml-2" />
                          <span className="text-sm text-green-700">{callersFile.name}</span>
                        </div>
                    )}

                    {uploadStatus.callers && (
                        <div className={`flex items-start p-3 rounded-lg ${uploadStatus.callers.success ? 'bg-green-50' : 'bg-red-50'}`}>
                          {uploadStatus.callers.success ? (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-2 mt-0.5 flex-shrink-0" />
                          ) : (
                              <AlertCircle className="w-5 h-5 text-red-500 ml-2 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className={`text-sm ${uploadStatus.callers.success ? 'text-green-700' : 'text-red-700'}`}>
                              {uploadStatus.callers.message}
                            </span>

                            {/* نمایش جزئیات کاربران جدید */}
                            {uploadStatus.callers.successful_callers && uploadStatus.callers.successful_callers.length > 0 && (
                                <div className="mt-2 text-xs text-green-800">
                                  <p className="font-medium">تماس‌گیرندگان جدید اضافه شده:</p>
                                  <ul className="list-disc list-inside">
                                    {uploadStatus.callers.successful_callers.slice(0, 3).map((caller, index) => (
                                        <li key={index}>{caller.full_name} ({caller.phone_number})</li>
                                    ))}
                                    {uploadStatus.callers.successful_callers.length > 3 && (
                                        <li>و {uploadStatus.callers.successful_callers.length - 3} تماس‌گیرنده دیگر...</li>
                                    )}
                                  </ul>
                                </div>
                            )}

                            {/* نمایش جزئیات کاربران به‌روزرسانی شده */}
                            {uploadStatus.callers.updated_callers && uploadStatus.callers.updated_callers.length > 0 && (
                                <div className="mt-2 text-xs text-blue-800">
                                  <p className="font-medium">نقش‌های تغییریافته و کاربران موجود:</p>
                                  <ul className="list-disc list-inside">
                                    {uploadStatus.callers.updated_callers.slice(0, 3).map((caller, index) => (
                                        <li key={index}>
                                          {caller.full_name} ({caller.phone_number})
                                          {caller.action === 'role_updated' && ` - نقش تغییر یافت: ${caller.old_role} → ${caller.new_role}`}
                                          {caller.action === 'already_caller' && ` - قبلاً تماس‌گیرنده بود`}
                                        </li>
                                    ))}
                                    {uploadStatus.callers.updated_callers.length > 3 && (
                                        <li>و {uploadStatus.callers.updated_callers.length - 3} کاربر دیگر...</li>
                                    )}
                                  </ul>
                                </div>
                            )}
                          </div>
                        </div>
                    )}

                    {/* نمایش خطاها */}
                    {uploadStatus.callers && uploadStatus.callers.failed_callers && uploadStatus.callers.failed_callers.length > 0 && (
                        <div className="mt-2 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-800">خطاها:</p>
                          <ul className="list-disc list-inside text-xs text-red-700">
                            {uploadStatus.callers.failed_callers.slice(0, 3).map((error, index) => (
                                <li key={index}>ردیف {error.row}: {error.error}</li>
                            ))}
                            {uploadStatus.callers.failed_callers.length > 3 && (
                                <li>و {uploadStatus.callers.failed_callers.length - 3} خطای دیگر...</li>
                            )}
                          </ul>
                        </div>
                    )}

                    <Button
                        onClick={handleUploadCallers}
                        disabled={!callersFile || uploading}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {uploading ? 'در حال آپلود...' : 'آپلود فایل تماس‌گیرندگان'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upload All Button */}
            {(contactsFile || callersFile) && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Button
                        onClick={handleUploadAll}
                        disabled={uploading}
                        className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3"
                        size="lg"
                    >
                      <Upload className="w-5 h-5 ml-2" />
                      {uploading ? 'در حال آپلود همه فایل‌ها...' : 'آپلود همه فایل‌ها'}
                    </Button>
                  </CardContent>
                </Card>
            )}
          </div>
        </main>
      </div>
  );
};

export default FileUpload;