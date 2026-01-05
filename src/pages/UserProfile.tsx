import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import { User, Heart, Gavel, ShoppingBag, Truck, Package, Star, Briefcase } from 'lucide-react';

// Sub-components / Pages
import MyBids from '../components/profile/MyBids';
import MyProducts from '../components/profile/MyProducts';
import MyRatings from '../components/profile/MyRatings';
import MyOrders from './MyOrders';
import MySales from './MySales';
import Favorites from './Favorites';
import UpgradeModal from '../components/UpgradeModal';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().optional(),
  dob: z.string().optional(), // YYYY-MM-DD
  birthDate: z.string().optional(), // Back-compat
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const UserProfile: React.FC = () => {
    const { user, login, token } = useAuth();
    const [activeTab, setActiveTab] = useState('settings');
    const [isEditing, setIsEditing] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

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
            address: user?.address || '',
            dob: user?.dob?.split('T')[0] || (user as any)?.birthDate?.split('T')[0] || '', // Handle various back-compat names
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName || '',
                email: user.email || '',
                address: (user as any)?.address || '',
                dob: user?.dob?.split('T')[0] || (user as any)?.birthDate?.split('T')[0] || '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormInputs) => {
        try {
            // 1. Handle Password Change if requested
            if (data.newPassword && data.currentPassword) {
                 await authService.changePassword({
                     oldPassword: data.currentPassword,
                     newPassword: data.newPassword,
                     confirmPassword: data.newPassword
                 });
                 toast.success('Password changed successfully');
            }

            // 2. Handle Profile Update
            const profileData = {
                fullName: data.fullName,
                email: data.email, // Email is disabled but might be needed by BE or just ignored
                address: data.address,
                dob: data.dob
            };

            await authService.updateProfile(profileData);
            
            if (token && user) {
                const newUserData = { 
                    ...user, 
                    fullName: data.fullName,
                    address: data.address,
                    dob: data.dob
                };
                // Re-hydrate context
                const storedRefresh = localStorage.getItem('refreshToken') || '';
                login(token, storedRefresh, newUserData);
            }
            toast.success('Profile updated successfully');
            setIsEditing(false);
            reset({ ...data, currentPassword: '', newPassword: '' }); // Clear passwords
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update settings');
        }
    };

    const tabs = [
        { id: 'settings', label: 'Profile Settings', icon: User },
        { id: 'ratings', label: 'My Ratings', icon: Star },
        { id: 'favorites', label: 'Watchlist', icon: Heart },
        { id: 'bids', label: 'My Bids', icon: Gavel },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    ];

    if (user?.role === 'SELLER' || user?.role === 'ADMIN') {
        tabs.push({ id: 'products', label: 'My Products', icon: Package });
        tabs.push({ id: 'sales', label: 'My Sales', icon: Truck });
    }

    return (
        <div className="px-20 h-full flex flex-col py-6">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-3xl font-bold text-[#3D4852]">Account Management</h1>
                
                {user?.role !== 'SELLER' && user?.role !== 'ADMIN' && (
                    <div className="flex items-center gap-4 mb-1">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wide hidden md:block opacity-70">
                            Want to start selling?
                        </span>
                        <button
                            onClick={() => setIsUpgradeModalOpen(true)}
                            className="neu-btn px-6 py-2.5 rounded-xl border-2 border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white font-bold text-sm flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/30"
                        >
                            <Briefcase className="w-4 h-4" />
                            Request Upgrade
                        </button>
                    </div>
                )}
            </div>
            
            <div className="w-full flex flex-row gap-1 flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-1/4 flex-shrink-0 h-full overflow-y-auto p-6 custom-scrollbar">
                    <div className="neu-extruded rounded-[2rem] p-6 min-h-full flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-20 h-20 !rounded-full neu-inset flex items-center justify-center mb-3 p-2">
                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-inner ${user?.role === 'SELLER' ? 'bg-[#6C63FF]' : 'bg-[#3D4852]'}`}>
                                        {user?.fullName?.[0] || 'U'}
                                    </div>
                                </div>
                                <p className="font-bold text-[#3D4852] text-lg text-center truncate w-full">{user?.fullName}</p>
                                <p className="text-xs text-gray-500 font-medium truncate">{user?.email}</p>
                            </div>
                            
                            <nav className="space-y-3">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                                            activeTab === tab.id 
                                                ? 'neu-inset text-[#6C63FF]' 
                                                : 'text-gray-500 hover:text-[#6C63FF] hover:bg-gray-50'
                                        }`}
                                    >
                                        <tab.icon className={`w-5 h-5 mr-3 transition-colors ${activeTab === tab.id ? 'text-[#6C63FF]' : 'text-gray-400 group-hover:text-[#6C63FF]'}`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-auto">                            
                            <div className="pt-6 border-t border-[#d1d9e6]">
                                <p className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Member since {new Date().getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-3/4 h-full overflow-y-auto p-6 custom-scrollbar">
                    <div className="rounded-[2.5rem] p-8 neu-extruded min-h-full w-full">
                        
                        {activeTab === 'settings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                                    <h2 className="text-2xl font-bold text-[#3D4852]">Profile Settings</h2>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`neu-btn px-4 py-2 rounded-lg text-sm font-bold transition-all ${isEditing ? 'text-red-500' : 'text-[#6C63FF]'}`}
                                    >
                                        {isEditing ? 'Cancel' : 'Edit Info'}
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#3D4852] ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                {...register('fullName')}
                                                className={`w-full px-5 py-3.5 neu-inset rounded-2xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all ${!isEditing ? 'opacity-60 bg-gray-50' : ''}`}
                                            />
                                            {errors.fullName && <p className="text-red-500 text-xs ml-1">{errors.fullName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#3D4852] ml-1">Email</label>
                                            <input
                                                type="email"
                                                disabled={true}
                                                {...register('email')}
                                                className="w-full px-5 py-3.5 neu-inset rounded-2xl text-[#3D4852] opacity-60 bg-gray-50 cursor-not-allowed"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#3D4852] ml-1">Address</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                {...register('address')}
                                                className={`w-full px-5 py-3.5 neu-inset rounded-2xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all ${!isEditing ? 'opacity-60 bg-gray-50' : ''}`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#3D4852] ml-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                disabled={!isEditing}
                                                {...register('dob')}
                                                className={`w-full px-5 py-3.5 neu-inset rounded-2xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all ${!isEditing ? 'opacity-60 bg-gray-50' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-[#3D4852] mb-4">Change Password</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-[#3D4852] ml-1">Current Password</label>
                                                    <input
                                                        type="password"
                                                        {...register('currentPassword')}
                                                        className="w-full px-5 py-3.5 neu-inset rounded-2xl"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-[#3D4852] ml-1">New Password</label>
                                                    <input
                                                        type="password"
                                                        {...register('newPassword')}
                                                        className="w-full px-5 py-3.5 neu-inset rounded-2xl"
                                                        placeholder="••••••••"
                                                    />
                                                    {errors.newPassword && <p className="text-red-500 text-xs ml-1">{errors.newPassword.message}</p>}
                                                </div>
                                            </div>
                                            <div className="mt-8 flex justify-between items-center">
                                                <button type="submit" className="neu-btn-primary px-8 py-3 rounded-xl text-white font-bold ml-auto">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {activeTab === 'ratings' && <MyRatings />}
                        {activeTab === 'bids' && <MyBids />}
                        {activeTab === 'favorites' && <Favorites isTab={true} />}
                        {activeTab === 'orders' && <MyOrders isTab={true} />}
                        {activeTab === 'products' && <MyProducts />}
                        {activeTab === 'sales' && <MySales isTab={true} />}

                    </div>
                </div>
            </div>
            
            <UpgradeModal 
                isOpen={isUpgradeModalOpen} 
                onClose={() => setIsUpgradeModalOpen(false)} 
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default UserProfile;
