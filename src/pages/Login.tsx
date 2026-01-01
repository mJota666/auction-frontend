import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthScene from '../components/AuthScene';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
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

      // Extract token (handle wrapped or flat)
      // Force cast to any to handle flexible backend response structures without TS errors
      const responseData: any = response.data || response;
      const token = responseData.token;

      if (token) {
          // Extract User
          // Case 1: Nested { data: { user: { ... } } }
          let user = responseData.user;
          
          // Case 2: Flat { data: { token: '...', role: 'SELLER', ... } }
          if (!user && (responseData.role || responseData.email)) {
             // Explicitly map fields to clean User object
             user = {
                 id: responseData.id || 0,
                 email: responseData.email || data.email,
                 role: responseData.role || 'USER',
                 fullName: responseData.fullName || responseData.fullname || responseData.name || 'User' 
             };
          }

          // Case 3: Fallback
          if (!user) {
             user = { email: data.email, fullName: 'User', id: 0, role: 'USER' };
          }

          // Normalize Role
          if (user) {
              const role = user.role ? user.role.toUpperCase() : 'USER';
              user = { ...user, role };
          }
          
          console.log('Final Login User:', user);
          login(token, user);
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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Left Side - 3D Scene */}
      <div className="hidden md:block w-1/2 h-full relative bg-slate-900">
        <div className="absolute inset-0 z-10">
            <AuthScene />
        </div>
        <div className="absolute bottom-10 left-10 z-20 text-white/80">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-lg">Access your auctions and manage your bids.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8 relative z-30 flex-col">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sign in</h1>
            <p className="mt-2 text-sm text-slate-600">
              Or{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                create a new account
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* ... fields ... */}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 px-3">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${errors.password ? 'border-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 px-3">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
