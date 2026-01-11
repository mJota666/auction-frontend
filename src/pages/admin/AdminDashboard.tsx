import React, { useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Users, DollarSign, Gavel } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { stats, fetchStats } = useAdmin();

    useEffect(() => {
        fetchStats();
    }, []);

    const newAuctions = stats?.newAuctionsLast7Days;
    const revenueTrend = stats?.revenueTrend;

    if (!stats) return <div className="flex justify-center py-20 text-[#3D4852] font-medium">Loading Dashboard...</div>;

    const cards = [
        { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
        { name: 'Total Revenue', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue), icon: DollarSign, color: 'text-green-500' },
        { name: 'Active Auctions', value: stats.activeAuctions, icon: Gavel, color: 'text-indigo-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-[#3D4852]">Admin Dashboard</h1>
                <nav className="flex space-x-4">
                    <a href="/admin" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6C63FF] neu-inset">Overview</a>
                    <a href="/admin/users" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Users</a>
                    <a href="/admin/products" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Products</a>
                    <a href="/admin/categories" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Categories</a>
                </nav>
            </div>
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-12">
                {cards.map((card) => (
                    <div key={card.name} className="neu-extruded rounded-[2rem] p-6 flex items-center justify-between bg-[#E0E5EC]">
                        <div>
                            <p className="text-sm font-bold text-[#6B7280] uppercase tracking-wider mb-1">{card.name}</p>
                            <p className="text-2xl font-extrabold text-[#3D4852]">{card.value}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-full neu-inset flex items-center justify-center ${card.color}`}>
                            <card.icon className="w-7 h-7" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section - Only show if data exists */}
            {newAuctions && revenueTrend && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* New Auctions Chart */}
                    <div className="neu-flat rounded-[2.5rem] p-8 bg-[#E0E5EC]">
                        <h3 className="text-xl font-bold text-[#3D4852] mb-6 flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-indigo-500" /> New Auctions <span className="text-sm font-normal text-gray-500 ml-auto">(Last 7 Days)</span>
                        </h3>
                        <div className="neu-inset rounded-[2rem] p-6 h-64 flex items-end justify-between gap-4">
                            {newAuctions.map((value, idx) => (
                                <div key={idx} className="flex flex-col items-center w-full h-full justify-end group">
                                    <div 
                                        className="w-full bg-[#6C63FF] rounded-t-xl opacity-80 group-hover:opacity-100 transition-all shadow-md relative group-hover:-translate-y-1"
                                        style={{ height: `${(value / Math.max(...newAuctions)) * 100}%` }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3D4852] text-white text-xs font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {value} Auctions
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 mt-3">D-{7-idx}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue Trend Chart */}
                    <div className="neu-flat rounded-[2.5rem] p-8 bg-[#E0E5EC]">
                        <h3 className="text-xl font-bold text-[#3D4852] mb-6 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-500" /> Revenue Trend <span className="text-sm font-normal text-gray-500 ml-auto">(Last 7 Months)</span>
                        </h3>
                        <div className="neu-inset rounded-[2rem] p-6 h-64 flex items-end justify-between gap-4">
                            {revenueTrend.map((value, idx) => (
                                <div key={idx} className="flex flex-col items-center w-full h-full justify-end group">
                                    <div 
                                        className="w-full bg-green-500 rounded-t-xl opacity-80 group-hover:opacity-100 transition-all shadow-md relative group-hover:-translate-y-1"
                                        style={{ height: `${value}%` }} 
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3D4852] text-white text-xs font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {value}%
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 mt-3">M-{7-idx}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default AdminDashboard;
