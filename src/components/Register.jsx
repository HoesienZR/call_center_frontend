import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password2: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'نام الزامی است';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'ایمیل الزامی است';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'فرمت ایمیل صحیح نیست';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'نام کاربری الزامی است';
    }
    
    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 6) {
      newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    }
    
    if (formData.password !== formData.password2) {
      newErrors.password2 = 'تکرار رمز عبور مطابقت ندارد';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
          if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        alert('ثبت نام با موفقیت انجام شد! لطفاً وارد شوید.');
        navigate('/login');
      } else {        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        setErrors(errorData);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">ثبت نام</h1>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="text"
                  name="first_name"
                  placeholder="نام"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="h-11 text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>
              
              <div>
                <Input
                  type="text"
                  name="last_name"
                  placeholder="نام خانوادگی"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="h-11 text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <Input
                type="email"
                name="email"
                placeholder="ایمیل"
                value={formData.email}
                onChange={handleInputChange}
                className="h-11 text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Input
                type="text"
                name="username"
                placeholder="نام کاربری"
                value={formData.username}
                onChange={handleInputChange}
                className="h-11 text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
            
            <div>
              <Input
                type="password"
                name="password"
                placeholder="رمز عبور"
                value={formData.password}
                onChange={handleInputChange}
                className="h-11 text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            
            <div>
              <Input
                type="password"
                name="password2"
                placeholder="تایید رمز عبور"
                value={formData.password2}
                onChange={handleInputChange}
                className="h-11 text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.password2 && (
                <p className="text-red-500 text-sm mt-1">{errors.password2}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'در حال ثبت نام...' : 'ثبت نام'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ورود
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

