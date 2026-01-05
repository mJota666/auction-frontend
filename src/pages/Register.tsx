import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthScene from '../components/AuthScene';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(10, 'Address must be detailed (at least 10 chars)'),
  dob: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"), // YYYY-MM-DD
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState<'info' | 'otp'>('info');
  const [otp, setOtp] = React.useState('');
  const [tempData, setTempData] = React.useState<RegisterFormInputs | null>(null);
  
  // Captcha State
  const [captchaVerified, setCaptchaVerified] = React.useState(false);

  const onCaptchaChange = (token: string | null) => {
      if (token) {
          setCaptchaVerified(true);
      } else {
          setCaptchaVerified(false);
      }
  };

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test Key (always works for localhost)

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onInfoSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    try {
        // Step 1: Register (Backend sends OTP email)
        await authService.register({
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            address: data.address,
            dob: data.dob
        });
        
        setTempData(data);
        setStep('otp');
        toast.success(`Account created! OTP sent to ${data.email}`);
        
    } catch (err: any) {
        console.error('Registration error:', err);
        // User requested to proceed to OTP even if error (likely Email send failure but User created)
        toast.warning(err.response?.data?.message || 'Registration issue, attempting verification...');
        setTempData(data);
        setStep('otp');
    } finally {
        setLoading(false);
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!tempData?.email) return;

      setLoading(true);
      try {
        // Step 2: Verify OTP
        await authService.verifyAccount(tempData.email, otp);
        
        toast.success('Verification successful! You can now login.');
        navigate('/login');
      } catch (err: any) {
        console.error('Verification error:', err);
        toast.error(err.response?.data?.message || err.message || 'Verification failed');
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
            <h2 className="text-3xl font-bold mb-2">Join the Auction</h2>
            <p className="text-lg">Create an account to start bidding today.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8 relative z-30 overflow-y-auto">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="mt-2 text-sm text-slate-600">
               {step === 'info' ? 'Already have an account? ' : 'Verification '}
               {step === 'info' && (
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Sign in
                  </Link>
               )}
            </p>
          </div>
          
          {step === 'info' ? (
              <form className="mt-8 space-y-6" onSubmit={handleSubmit(onInfoSubmit)}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="full-name" className="sr-only">Full Name</label>
                    <input
                      id="full-name"
                      type="text"
                      autoComplete="name"
                      {...register('fullName')}
                      className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${errors.fullName ? 'border-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                      placeholder="Full Name"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1 px-3">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                      id="email-address"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                      placeholder="Email address"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 px-3">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="address" className="sr-only">Address</label>
                    <input
                      id="address"
                      type="text"
                      {...register('address')}
                      className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${errors.address ? 'border-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                      placeholder="Address (for shipping)"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1 px-3">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="dob" className="sr-only">Date of Birth</label>
                    <input
                      id="dob"
                      type="date"
                      {...register('dob')}
                      className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${errors.dob ? 'border-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    />
                    {errors.dob && <p className="text-red-500 text-xs mt-1 px-3">{errors.dob.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...register('password')}
                      className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${errors.password ? 'border-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                      placeholder="Password"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1 px-3">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      className={`appearance-none rounded-none relative block w-full px-3 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                      placeholder="Confirm Password"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 px-3">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                {/* Real Google reCaptcha */}
                <div className="flex justify-center my-4">
                    <ReCAPTCHA
                        sitekey={siteKey}
                        onChange={onCaptchaChange}
                    />
                </div>
                {!siteKey && <p className="text-xs text-center text-red-500">Missing VITE_RECAPTCHA_SITE_KEY in .env</p>}

                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    {...register('terms')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-slate-900">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  </label>
                </div>
                {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}

                <div>
                  <button
                    type="submit"
                    disabled={loading || !captchaVerified}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading || !captchaVerified ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                  >
                    {loading ? 'Processing...' : 'Register Account'}
                  </button>
                </div>
              </form>
          ) : (
              <form className="mt-8 space-y-6" onSubmit={onOtpSubmit}>
                  <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">We sent a verification code to <strong>{tempData?.email}</strong></p>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full text-center text-2xl tracking-widest rounded-md border-gray-300 shadow-sm border p-3"
                        placeholder="______"
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-2">Check your email for the code</p>
                  </div>
                  <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setStep('info')}
                        className="w-1/2 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                  </div>
              </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
