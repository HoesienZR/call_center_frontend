import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, User } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CallFeedback = () => {
  const navigate = useNavigate();
  const { projectId, contactId } = useParams();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    status: '',
    result: '',
    notes: '',
    follow_up_date: '',
    follow_up_notes: '',
    duration: 0,
  });

  const callStatuses = [
    { value: 'answered', label: 'پاسخ داد' },
    { value: 'pending', label: 'در انتظار' },
    { value: 'no_answer', label: 'پاسخ نداد' },
    { value: 'wrong_number', label: 'شماره اشتباه' },
  ];

  const callResults = [
    { value: 'interested', label: 'علاقه‌مند هست' },
    { value: 'no_time', label: 'وقت ندارد' },
    { value: 'not_interested', label: 'علاقه‌مند نیست' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchContact();
  }, [navigate, projectId, contactId]);

  const fetchContact = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setContact(data);
      } else {
        console.error('Failed to fetch contact');
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // تبدیل follow_up_date به فرمت ISO 8601
    let follow_up_date = feedback.follow_up_date || null;
    if (follow_up_date) {
      follow_up_date = `${follow_up_date}T00:00:00Z`;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/calls/submit_call/`,  {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callecaller_id: contactId,  // این فیلد اشتباه نام‌گذاری شده!
          project_id: projectId,
          status: feedback.status,
          call_result: feedback.result,
          notes: feedback.notes,
          follow_up_date: follow_up_date,
          follow_up_notes: feedback.follow_up_notes,
          duration: feedback.duration,
        }),
      });

      if (response.ok) {
        alert('بازخورد با موفقیت ثبت شد!');
        navigate(`/project/${projectId}/call-request`);
      } else {
        const errorData = await response.json();
        console.error('Failed to submit feedback:', errorData);
        alert(`خطا در ثبت بازخورد: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('خطا در ارتباط با سرور');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFeedback(prev => {
      const newFeedback = { ...prev, [field]: value };

      // اگر وضعیت تماس تغییر کرد و به غیر از "answered" انتخاب شد، نتیجه تماس را پاک کن
      if (field === 'status' && value !== 'answered') {
        newFeedback.result = '';
        newFeedback.follow_up_date = '';
        newFeedback.follow_up_notes = '';
      }

      return newFeedback;
    });
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

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                    onClick={() => navigate(`/project/${projectId}/call-request`)}
                    className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="mr-4 text-xl font-semibold text-gray-900">ثبت بازخورد تماس</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Contact Summary */}
            {contact && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 text-blue-500 ml-2" />
                      خلاصه اطلاعات مخاطب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">نام:</span>
                        <p className="font-medium">{contact.full_name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">تلفن:</span>
                        <p className="font-medium font-mono" dir="rtl">{contact.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">زمان تماس:</span>
                        <p className="font-medium">{new Date().toLocaleString('fa-IR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            )}

            {/* Feedback Form */}
            <Card>
              <CardHeader>
                <CardTitle>فرم بازخورد تماس</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  {/* Call Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      وضعیت تماس
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {callStatuses.map((status) => (
                          <button
                              key={status.value}
                              type="button"
                              onClick={() => handleInputChange('status', status.value)}
                              className={`p-3 border rounded-lg text-center transition-colors ${
                                  feedback.status === status.value
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-300 hover:border-gray-400'
                              }`}
                          >
                            <span className="text-sm font-medium">{status.label}</span>
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* Call Result - فقط زمانی که وضعیت "پاسخ داد" باشد نمایش داده شود */}
                  {feedback.status === 'answered' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          نتیجه تماس
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {callResults.map((result) => (
                              <button
                                  key={result.value}
                                  type="button"
                                  onClick={() => handleInputChange('result', result.value)}
                                  className={`p-3 border rounded-lg text-center transition-colors ${
                                      feedback.result === result.value
                                          ? 'border-green-500 bg-green-50'
                                          : 'border-gray-300 hover:border-gray-400'
                                  }`}
                              >
                                <span className="text-sm font-medium">{result.label}</span>
                              </button>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      یادداشت‌ها و توضیحات
                    </label>
                    <textarea
                        value={feedback.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="توضیحات تکمیلی در مورد تماس..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="4"
                    />
                  </div>

                  {/* Duration - فقط زمانی که وضعیت "پاسخ داد" باشد نمایش داده شود */}
                  {feedback.status === 'answered' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          مدت زمان تماس (ثانیه)
                        </label>
                        <Input
                            type="number"
                            value={feedback.duration}
                            onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                            placeholder="مدت زمان تماس به ثانیه"
                        />
                      </div>
                  )}

                  {/* Follow-up */}
                  {feedback.result === 'callback_requested' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تاریخ تماس مجدد
                          </label>
                          <Input
                              type="date"
                              value={feedback.follow_up_date}
                              onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            یادداشت تماس مجدد
                          </label>
                          <Input
                              type="text"
                              value={feedback.follow_up_notes}
                              onChange={(e) => handleInputChange('follow_up_notes', e.target.value)}
                              placeholder="یادداشت برای تماس بعدی..."
                          />
                        </div>
                      </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/project/${projectId}/call-request`)}
                        disabled={submitting}
                    >
                      انصراف
                    </Button>
                    <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={!feedback.status || (feedback.status === 'answered' && !feedback.result) || submitting}
                    >
                      {submitting ? 'در حال ثبت...' : 'ثبت بازخورد'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  );
};

export default CallFeedback;