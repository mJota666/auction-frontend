import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthScene from '../components/AuthScene';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);

    try {
      const response = await authService.login(data);

      const responseData: any = response.data || response;
      const token = responseData.token;
      const refreshToken = responseData.refreshToken || '';

      if (token) {
          let user = responseData.user;
          
          if (!user && (responseData.role || responseData.email)) {
             user = {
                 id: responseData.id || 0,
                 email: responseData.email || data.email,
                 role: responseData.role || 'USER',
                 fullName: responseData.fullName || responseData.fullname || responseData.name || 'User' 
             };
          }

          if (!user) {
             user = { email: data.email, fullName: 'User', id: 0, role: 'USER' };
          }

          if (user) {
              const role = user.role ? user.role.toUpperCase() : 'USER';
              user = { ...user, role };
          }
          
          console.log('Final Login User:', user);
          login(token, refreshToken, user);
          toast.success('Login successful!');
          navigate('/');

      } else {
          throw new Error('No token received from server');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#E0E5EC] overflow-hidden">
      {/* Left Side - 3D Scene */}
      <div className="hidden md:block w-1/2 h-full relative bg-slate-900 rounded-r-[3rem] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 z-10">
            <AuthScene />
        </div>
        <div className="absolute bottom-10 left-10 z-20 text-white/90">
            <h2 className="text-4xl font-bold mb-3 drop-shadow-md">Welcome Back</h2>
            <p className="text-xl font-light drop-shadow-sm">Access your auctions and manage your bids with style.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8 relative z-30">
        <div className="max-w-md w-full neu-extruded p-10 rounded-[2.5rem]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#3D4852] tracking-tight mb-2">Sign In</h1>
            <p className="text-sm text-gray-500 font-medium">
              Join the auction community
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email-address"
                      type="email"
                      {...register('email')}
                      className={`w-full pl-12 pr-4 py-3.5 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852] font-medium placeholder-gray-400 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Email address"
                    />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      {...register('password')}
                      className={`w-full pl-12 pr-4 py-3.5 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852] font-medium placeholder-gray-400 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Password"
                    />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-2">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#6C63FF] focus:ring-[#6C63FF] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 font-medium">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-bold text-gray-500 hover:text-[#6C63FF] transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full neu-btn-primary rounded-xl py-4 text-white font-bold text-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                  <span>Signing In...</span>
              ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
              )}
            </button>
            
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold text-[#6C63FF] hover:underline">
                        Create Account
                    </Link>
                </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
