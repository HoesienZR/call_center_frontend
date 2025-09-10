import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileSpreadsheet, Users, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const FileUpload = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [contactsFile, setContactsFile] = useState(null);
  const [callersFile, setCallersFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    contacts: null,
    callers: null,
  });

  const handleFileChange = (type, file) => {
    if (type === 'contacts') {
      setContactsFile(file);
      setUploadStatus((prev) => ({ ...prev, contacts: null }));
    } else if (type === 'callers') {
      setCallersFile(file);
      setUploadStatus((prev) => ({ ...prev, callers: null }));
    }
  };

  const uploadFile = async (file, endpoint, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId); // اصلاح کلید از 'project' به 'project_id'
    if (type === 'contacts') {
      formData.append('auto_assign', 'true'); // افزودن پارامتر auto_assign
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/uploaded-files/${endpoint}/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        let message = `فایل با موفقیت آپلود شد. ${data.contacts_added || 0} مخاطب اضافه شد.`;
        if (type === 'contacts') {
          message += ` ${data.contacts_updated || 0} مخاطب به‌روزرسانی شد.`;
          message += ` ${data.auto_assigned_count || 0} مخاطب به‌صورت تصادفی تخصیص یافت.`;
          if (data.total_errors > 0) {
            message += ` ${data.total_errors} خطا رخ داد.`;
          }
        } else {
          message += ` ${data.callers_updated || 0} تماس‌گیرنده به‌روزرسانی شد.`;
          message += ` ${data.callers_assigned || 0} تماس‌گیرنده به پروژه تخصیص یافت.`;
          if (data.total_errors > 0) {
            message += ` ${data.total_errors} خطا رخ داد.`;
          }
        }
        setUploadStatus((prev) => ({
          ...prev,
          [type]: { success: true, message, errors: data.errors },
        }));
        return true;
      } else {
        const errorData = await response.json();
        setUploadStatus((prev) => ({
          ...prev,
          [type]: { success: false, message: errorData.error || 'خطا در آپلود فایل', errors: errorData.errors },
        }));
        return false;
      }
    } catch (error) {
      setUploadStatus((prev) => ({
        ...prev,
        [type]: { success: false, message: 'خطا در ارتباط با سرور', errors: [] },
      }));
      return false;
    }
  };

  const handleUploadContacts = async () => {
    if (!contactsFile) return;

    setUploading(true);
    await uploadFile(contactsFile, 'upload_contacts', 'contacts');
    setUploading(false);
  };

  const handleUploadCallers = async () => {
    if (!callersFile) return;

    setUploading(true);
    await uploadFile(callersFile, 'upload_callers', 'callers');
    setUploading(false);
  };

  const handleUploadAll = async () => {
    if (!contactsFile && !callersFile) return;

    setUploading(true);

    if (contactsFile) {
      await uploadFile(contactsFile, 'upload_contacts', 'contacts');
    }

    if (callersFile) {
      await uploadFile(callersFile, 'upload_callers', 'callers');
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
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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
                      فایل اکسل حاوی اطلاعات افرادی که قرار است با آن‌ها تماس گرفته شود.
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>ستون‌های مورد نیاز: نام، شماره تلفن</li>
                      <li>ستون اختیاری: ایمیل، آدرس، تماس‌گیرنده (اگر خالی باشد، به‌صورت تصادفی تخصیص داده می‌شود)</li>
                      <li>فرمت فایل: Excel (.xlsx, .xls) یا CSV (.csv)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">فایل تماس‌گیرندگان (Callers)</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      فایل اکسل حاوی اطلاعات افرادی که قرار است تماس بگیرند.
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>ستون‌های مورد نیاز: نام کاربری، نام کامل</li>
                      <li>ستون اختیاری: ایمیل، رمز عبور (در صورت عدم ارائه، رمز تولید می‌شود)</li>
                      <li>فرمت فایل: Excel (.xlsx, .xls) یا CSV (.csv)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        انتخاب فایل اکسل یا CSV مخاطبین
                      </label>
                      <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
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
                        <div className={`flex items-center p-3 rounded-lg ${uploadStatus.contacts.success ? 'bg-green-50' : 'bg-red-50'}`}>
                          {uploadStatus.contacts.success ? (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                          ) : (
                              <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                          )}
                          <span className={`text-sm ${uploadStatus.contacts.success ? 'text-green-700' : 'text-red-700'}`}>
                        {uploadStatus.contacts.message}
                      </span>
                        </div>
                    )}

                    {uploadStatus.contacts && uploadStatus.contacts.errors && uploadStatus.contacts.errors.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          <p>خطاها:</p>
                          <ul className="list-disc list-inside">
                            {uploadStatus.contacts.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
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
                        انتخاب فایل اکسل یا CSV تماس‌گیرندگان
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
                        <div className={`flex items-center p-3 rounded-lg ${uploadStatus.callers.success ? 'bg-green-50' : 'bg-red-50'}`}>
                          {uploadStatus.callers.success ? (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                          ) : (
                              <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                          )}
                          <span className={`text-sm ${uploadStatus.callers.success ? 'text-green-700' : 'text-red-700'}`}>
                        {uploadStatus.callers.message}
                      </span>
                        </div>
                    )}

                    {uploadStatus.callers && uploadStatus.callers.errors && uploadStatus.callers.errors.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          <p>خطاها:</p>
                          <ul className="list-disc list-inside">
                            {uploadStatus.callers.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
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
                        className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
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