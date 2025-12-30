import React, { useEffect, useState } from 'react';
import { adminService, type AdminStats } from '../../services/admin';
import { Users, DollarSign, Gavel } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalRevenue: 0, activeAuctions: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
                // Mock data for demo if API fails/not ready
                setStats({ totalUsers: 150, totalRevenue: 50000000, activeAuctions: 45 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;

    const cards = [
        { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
        { name: 'Total Revenue', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
        { name: 'Active Auctions', value: stats.activeAuctions, icon: Gavel, color: 'bg-indigo-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <card.icon className={`h-6 w-6 text-white p-1 rounded-md ${card.color}`} aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                                        <dd className="text-lg font-medium text-gray-900">{card.value}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8">
                {/* Could add charts or recent activity here */}
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-500">Welcome to the admin panel. Use the navigation to manage users and categories.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
