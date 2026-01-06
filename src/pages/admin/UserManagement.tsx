import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Lock, Unlock, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';

const UserManagement: React.FC = () => {
    const { users, upgradeRequests, loading, fetchUsers, fetchUpgradeRequests, toggleUserLock, approveUpgrade, rejectUpgrade } = useAdmin();
    const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');

    useEffect(() => {
        if (activeTab === 'all') fetchUsers();
        if (activeTab === 'requests') fetchUpgradeRequests();
    }, [activeTab]);

    if (loading && users.length === 0 && upgradeRequests.length === 0) return <div className="flex justify-center py-20 text-[#3D4852] font-medium">Loading Users...</div>;

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'text-red-500';
            case 'SELLER': return 'text-blue-600';
            default: return 'text-gray-500';
        }
    };

    const renderUserList = () => {
        const list = activeTab === 'all' ? users : upgradeRequests;
        if (list.length === 0) {
            return (
                <div className="neu-inset rounded-[2rem] p-10 text-center text-gray-500 italic">
                    {activeTab === 'all' ? 'No users found.' : 'No pending upgrade requests.'}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Header Row (Desktop) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-bold text-[#6B7280] text-sm tracking-wider uppercase">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-3">User</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {list.map((user) => (
                    <div key={user.id} className="neu-flat rounded-2xl p-6 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group hover:bg-white/40 transition-colors">
                         {/* Mobile Labels are implicit via layout or you can add them if needed */}
                         
                         <div className="col-span-1 font-mono text-gray-400 text-xs">#{user.id}</div>
                         
                         <div className="col-span-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full neu-inset flex items-center justify-center text-[#6C63FF]">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-[#3D4852]">{user.fullName}</span>
                         </div>

                         <div className="col-span-3 text-sm text-[#555] break-all">{user.email}</div>
                         
                         <div className="col-span-2">
                             <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-[#E0E5EC] neu-extruded ${getRoleColor(user.role)}`}>
                                 {user.role}
                             </span>
                         </div>

                         <div className="col-span-1">
                             <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
                                 user.locked ? 'text-red-500' : 'text-green-500'
                             }`}>
                                 <span className={`w-2 h-2 rounded-full ${user.locked ? 'bg-red-500' : 'bg-green-500'}`} />
                                 {user.locked ? 'Locked' : 'Active'}
                             </span>
                         </div>

                         <div className="col-span-2 flex justify-end gap-3">
                             {activeTab === 'all' ? (
                                user.role !== 'ADMIN' && (
                                <button 
                                    onClick={() => toggleUserLock(user.id)}
                                    className={`w-10 h-10 rounded-xl neu-btn flex items-center justify-center transition-colors ${
                                        user.locked ? 'text-indigo-500 hover:text-indigo-600' : 'text-red-400 hover:text-red-500'
                                    }`}
                                    title={user.locked ? "Unlock User" : "Lock User"}
                                >
                                    {user.locked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </button>
                                )
                             ) : (
                                 <>
                                    <button 
                                        onClick={() => user.upgradeRequestId && approveUpgrade(user.upgradeRequestId)}
                                        className="w-10 h-10 rounded-xl neu-btn text-green-500 hover:text-green-600 flex items-center justify-center"
                                        title="Approve Upgrade"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const reason = window.prompt("Enter rejection reason:");
                                            if (reason && user.upgradeRequestId) rejectUpgrade(user.upgradeRequestId, reason);
                                        }}
                                        className="w-10 h-10 rounded-xl neu-btn text-red-500 hover:text-red-600 flex items-center justify-center"
                                        title="Reject Upgrade"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                 </>
                             )}
                         </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-[#3D4852]">User Management</h1>
                <nav className="flex space-x-4">
                    <a href="/admin" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Overview</a>
                    <a href="/admin/users" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6C63FF] neu-inset">Users</a>
                    <a href="/admin/products" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Products</a>
                    <a href="/admin/categories" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Categories</a>
                </nav>
            </div>
            
            <div className="mb-8 flex space-x-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                        activeTab === 'all' 
                        ? 'neu-inset text-[#6C63FF]' 
                        : 'neu-flat text-gray-500 hover:text-[#3D4852]'
                    }`}
                >
                    All Users
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'requests' 
                        ? 'neu-inset text-[#6C63FF]' 
                        : 'neu-flat text-gray-500 hover:text-[#3D4852]'
                    }`}
                >
                    Upgrade Requests
                    {upgradeRequests.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                            {upgradeRequests.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="neu-extruded rounded-[2.5rem] p-8 md:p-10 bg-[#E0E5EC]">
                {renderUserList()}
            </div>
        </div>
    );
};

export default UserManagement;
