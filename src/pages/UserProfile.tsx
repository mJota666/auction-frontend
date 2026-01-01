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
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            disabled={!isEditing}
                            {...register('fullName')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                         {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            disabled={true} // Usually email is not editable or requires special flow
                            {...register('email')}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border cursor-not-allowed"
                        />
                         {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                </div>

                {isEditing && (
                    <div className="border-t pt-6 mt-6">
                         <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input
                                    type="password"
                                    {...register('currentPassword')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    {...register('newPassword')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                                 {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
            
            <div className="mt-8 border-t pt-6">
                 <h2 className="text-lg font-medium text-gray-900 mb-4">Account Status</h2>
                 <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                     <div>
                         <p className="text-sm font-medium text-gray-500">Role</p>
                         <p className="text-lg font-semibold text-gray-900">{user?.role}</p>
                     </div>
                     {user?.role === 'USER' && (
                         <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                             Request Upgrade to Seller
                         </button>
                     )}
                 </div>
            </div>
        </div>
    );
};

export default UserProfile;
