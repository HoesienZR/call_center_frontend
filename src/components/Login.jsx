// src/components/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config'; //
const Login = ( ) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // **این خط را تغییر دهید**
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);

        // Store token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.user_id,
          username: data.username,
          email: data.email,
          is_staff: data.is_staff
        }));

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        const errorData = await response.json(); // دریافت پیام خطا از بک‌اند
        console.error('Login failed:', errorData);
        alert('ورود ناموفق: ' + (errorData.error || 'خطای نامشخص')); // نمایش پیام خطا به کاربر
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('خطا در اتصال به سرور'); // نمایش خطای شبکه به کاربر
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-12">
            <div className="mx-auto mb-6 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <Headphones className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">مرکز تماس</h1>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                    type="email"
                    name="email"
                    placeholder="ایمیل"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                />
              </div>

              <div className="space-y-2">
                <Input
                    type="password"
                    name="password"
                    placeholder="رمز عبور"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                />
              </div>

              <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
                  disabled={isLoading}
              >
                {isLoading ? 'در حال ورود...' : 'ورود'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ثبت نام
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default Login;
