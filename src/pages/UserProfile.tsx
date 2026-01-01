import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const UserProfile: React.FC = () => {
    const { user, login, token } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileFormInputs>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.fullName || '',
            email: user?.email || '',
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName || '',
                email: user.email || '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormInputs) => {
        try {
            // Depending on API, we might update profile and password separately or together
            const updatedUser = await authService.updateProfile(data);
            console.log('Update success, response:', updatedUser);
            
            // Update context
             if (token && user) {
                // API returns success message only, so we update local state with form data
                // We assume email is read-only or handled separately if changed
                const newUserData = { 
                    ...user, 
                    fullName: data.fullName 
                };
                
                login(token, newUserData); // Update user in local storage/context
            }

            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            console.error('Error Response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 neu-extruded mt-10 rounded-[2.5rem]">
            <div className="flex justify-between items-center border-b border-gray-200/50 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#3D4852]">User Profile</h1>
                    <p className="text-sm text-[#6B7280] mt-1">Manage your account settings and preferences</p>
                </div>
                
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`neu-btn px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${isEditing ? 'text-red-500' : 'text-[#6C63FF]'}`}
                >
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#3D4852] ml-1">Full Name</label>
                        <input
                            type="text"
                            disabled={!isEditing}
                            {...register('fullName')}
                            className={`w-full px-5 py-3.5 neu-inset rounded-2xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all ${!isEditing ? 'opacity-80' : ''}`}
                            placeholder="Your full name"
                        />
                         {errors.fullName && <p className="text-red-500 text-xs mt-2 ml-1">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#3D4852] ml-1">Email Address</label>
                        <input
                            type="email"
                            disabled={true} 
                            {...register('email')}
                             className="w-full px-5 py-3.5 neu-inset rounded-2xl text-[#6B7280] bg-transparent cursor-not-allowed opacity-70 focus:outline-none"
                        />
                         {errors.email && <p className="text-red-500 text-xs mt-2 ml-1">{errors.email.message}</p>}
                    </div>
                </div>

                {isEditing && (
                    <div className="pt-6 mt-6 border-t border-gray-200/50">
                         <h2 className="text-xl font-bold text-[#3D4852] mb-6 flex items-center gap-2">
                            Security Settings
                         </h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[#3D4852] ml-1">Current Password</label>
                                <input
                                    type="password"
                                    {...register('currentPassword')}
                                    className="w-full px-5 py-3.5 neu-inset rounded-2xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[#3D4852] ml-1">New Password</label>
                                <input
                                    type="password"
                                    {...register('newPassword')}
                                    className="w-full px-5 py-3.5 neu-inset rounded-2xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
                                    placeholder="••••••••"
                                />
                                 {errors.newPassword && <p className="text-red-500 text-xs mt-2 ml-1">{errors.newPassword.message}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="neu-btn-primary px-8 py-3 rounded-xl font-semibold text-white transition-all transform hover:-translate-y-0.5"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
            
            <div className="mt-12">
                 <h2 className="text-xl font-bold text-[#3D4852] mb-4 ml-1">Account Status</h2>
                 <div className="neu-inset rounded-2xl p-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-inner ${user?.role === 'ADMIN' ? 'bg-red-500' : user?.role === 'SELLER' ? 'bg-[#6C63FF]' : 'bg-blue-400'}`}>
                            {user?.role ? user.role[0] : 'U'}
                        </div>
                        <div>
                             <p className="text-sm font-medium text-[#6B7280]">Current Role</p>
                             <p className="text-lg font-bold text-[#3D4852]">{user?.role || 'GUEST'}</p>
                         </div>
                     </div>
                     
                     {user?.role === 'USER' && (
                         <button className="neu-btn px-5 py-2.5 rounded-xl text-[#6C63FF] font-semibold text-sm hover:text-[#5a52d5]">
                             Upgrade to Seller
                         </button>
                     )}
                 </div>
            </div>
        </div>
    );
};

export default UserProfile;
