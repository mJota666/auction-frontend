import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthScene from '../components/AuthScene';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import { User, Mail, MapPin, Calendar, Lock, UserPlus, ShieldCheck, ArrowLeft } from 'lucide-react';

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
        // Do not advance to OTP on error (e.g., Email already exists)
        toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!tempData?.email) return;

      setLoading(true);
      try {
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
    <div className="flex h-screen w-full bg-[#E0E5EC] overflow-hidden">
      {/* Left Side - 3D Scene */}
      <div className="hidden md:block w-1/2 h-full relative bg-slate-900 rounded-r-[3rem] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 z-10">
            <AuthScene />
        </div>
        <div className="absolute bottom-10 left-10 z-20 text-white/90">
            <h2 className="text-4xl font-bold mb-3 drop-shadow-md">Join the Auction</h2>
            <p className="text-xl font-light drop-shadow-sm">Create an account to start bidding on exclusive items today.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8 relative z-30 overflow-y-auto custom-scrollbar">
        <div className="max-w-md w-full neu-extruded p-10 rounded-[2.5rem] my-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-[#3D4852] tracking-tight mb-2">Create Account</h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
               {step === 'info' ? 'Already have an account? ' : 'Verification '}
               {step === 'info' && (
                  <Link to="/login" className="font-bold text-[#6C63FF] hover:underline transition-colors">
                    Sign in
                  </Link>
               )}
            </p>
          </div>
          
          {step === 'info' ? (
              <form className="space-y-6" onSubmit={handleSubmit(onInfoSubmit)}>
                <div className="space-y-4">
                  <div>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          {...register('fullName')}
                          className={`w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852] font-medium placeholder-gray-400 ${errors.fullName ? 'border border-red-500' : ''}`}
                          placeholder="Full Name"
                        />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-2">{errors.fullName.message}</p>}
                  </div>
                  
                  <div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          {...register('email')}
                          className={`w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852] font-medium placeholder-gray-400 ${errors.email ? 'border border-red-500' : ''}`}
                          placeholder="Email address"
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email.message}</p>}
                  </div>
                  
                  <div>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          {...register('address')}
                          className={`w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852] font-medium placeholder-gray-400 ${errors.address ? 'border border-red-500' : ''}`}
                          placeholder="Address (for shipping)"
                        />
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1 ml-2">{errors.address.message}</p>}
                  </div>

                  <div>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          {...register('dob')}
                          className={`w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852] font-medium placeholder-gray-400 ${errors.dob ? 'border border-red-500' : ''}`}
                        />
                    </div>
                    {errors.dob && <p className="text-red-500 text-xs mt-1 ml-2">{errors.dob.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="password"
                              {...register('password')}
                              className={`w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852] font-medium placeholder-gray-400 ${errors.password ? 'border border-red-500' : ''}`}
                              placeholder="Password"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-2">{errors.password.message}</p>}
                      </div>
                      <div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="password"
                              {...register('confirmPassword')}
                              className={`w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852] font-medium placeholder-gray-400 ${errors.confirmPassword ? 'border border-red-500' : ''}`}
                              placeholder="Confirm"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-2">{errors.confirmPassword.message}</p>}
                      </div>
                  </div>
                </div>

                <div className="flex justify-center my-4 scale-90 origin-center">
                    <ReCAPTCHA
                        sitekey={siteKey}
                        onChange={onCaptchaChange}
                        theme="light"
                    />
                </div>
                {!siteKey && <p className="text-xs text-center text-red-500">Missing VITE_RECAPTCHA_SITE_KEY in .env</p>}

                <div className="flex items-center justify-center">
                  <input
                    id="terms"
                    type="checkbox"
                    {...register('terms')}
                    className="h-4 w-4 text-[#6C63FF] focus:ring-[#6C63FF] border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 font-medium">
                    I agree to the <a href="#" className="text-[#6C63FF] hover:underline">Terms</a> and <a href="#" className="text-[#6C63FF] hover:underline">Privacy Policy</a>
                  </label>
                </div>
                {errors.terms && <p className="text-red-500 text-xs text-center">{errors.terms.message}</p>}

                <div>
                  <button
                    type="submit"
                    disabled={loading || !captchaVerified}
                    className={`w-full neu-btn-primary rounded-xl py-4 text-white font-bold text-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${loading || !captchaVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : (
                        <>
                            <UserPlus className="w-5 h-5" />
                            <span>Register Account</span>
                        </>
                    )}
                  </button>
                </div>
              </form>
          ) : (
              <form className="mt-8 space-y-6" onSubmit={onOtpSubmit}>
                  <div className="text-center">
                      <ShieldCheck className="w-12 h-12 text-[#6C63FF] mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4 font-medium">
                          We sent a verification code to <br/>
                          <span className="font-bold text-[#3D4852] text-lg">{tempData?.email}</span>
                      </p>
                      
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full text-center text-3xl tracking-[0.5em] font-bold py-4 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852]"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-4">Please check your email inbox and spam folder.</p>
                  </div>
                  <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep('info')}
                        className="w-1/3 neu-btn py-3 rounded-xl text-sm font-bold text-gray-600 hover:text-[#3D4852]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 neu-btn-primary py-3 rounded-xl text-white font-bold shadow-lg"
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
