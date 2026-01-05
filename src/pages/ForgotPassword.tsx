import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, ArrowLeft } from 'lucide-react';

// Step 1: Email Schema
const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
});

// Step 2: Reset Schema
const resetSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be 6+ chars'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type EmailInput = z.infer<typeof emailSchema>;
type ResetInput = z.infer<typeof resetSchema>;

const ForgotPassword: React.FC = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors, isSubmitting: emailSubmitting } } = useForm<EmailInput>({
        resolver: zodResolver(emailSchema)
    });

    const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors, isSubmitting: resetSubmitting } } = useForm<ResetInput>({
        resolver: zodResolver(resetSchema)
    });

    const onEmailSubmit = async (data: EmailInput) => {
        try {
            await authService.forgotPassword(data.email);
            setEmail(data.email);
            setStep(2);
            toast.success('OTP sent to your email');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    const onResetSubmit = async (data: ResetInput) => {
        try {
            await authService.resetPassword(email, data.otp, data.newPassword);
            toast.success('Password reset successfully');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E0E5EC] px-4">
            <div className="neu-extruded rounded-[2rem] p-8 w-full max-w-md bg-[#E0E5EC]">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-[#3D4852] mb-2">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {step === 1 
                            ? 'Enter your email to receive an OTP' 
                            : `Enter OTP sent to ${email} and new password`
                        }
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...registerEmail('email')}
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852]"
                                />
                            </div>
                            {emailErrors.email && <p className="text-red-500 text-xs mt-1 ml-2">{emailErrors.email.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={emailSubmitting}
                            className="w-full py-3 rounded-xl neu-btn-primary text-white font-bold"
                        >
                            {emailSubmitting ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-6">
                        <div>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...registerReset('otp')}
                                    placeholder="Enter 6-digit OTP"
                                    className="w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852]"
                                />
                            </div>
                            {resetErrors.otp && <p className="text-red-500 text-xs mt-1 ml-2">{resetErrors.otp.message}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    {...registerReset('newPassword')}
                                    placeholder="New Password"
                                    className="w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852]"
                                />
                            </div>
                            {resetErrors.newPassword && <p className="text-red-500 text-xs mt-1 ml-2">{resetErrors.newPassword.message}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    {...registerReset('confirmPassword')}
                                    placeholder="Confirm New Password"
                                    className="w-full pl-12 pr-4 py-3 neu-inset rounded-xl bg-transparent outline-none text-[#3D4852]"
                                />
                            </div>
                            {resetErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-2">{resetErrors.confirmPassword.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={resetSubmitting}
                            className="w-full py-3 rounded-xl neu-btn-primary text-white font-bold"
                        >
                            {resetSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-[#6C63FF] flex items-center justify-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
