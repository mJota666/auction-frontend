import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Rating {
    id: number;
    fromUserId: number;
    fromUserName: string;
    score: number; // 1 or -1
    comment: string;
    createdAt: string;
    productTitle?: string;
}

const MyRatings: React.FC = () => {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const data = await authService.getRatings();
                console.log('My Ratings Data:', data); // Debug log
                setRatings(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch ratings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, []);

    if (loading) return <div className="text-center py-10">Loading ratings...</div>;

    const positiveCount = ratings.filter(r => r.score > 0).length;
    const negativeCount = ratings.filter(r => r.score < 0).length;
    const total = positiveCount + negativeCount;
    const percentage = total > 0 ? ((positiveCount / total) * 100).toFixed(1) : 100;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#3D4852]">My Ratings</h2>
            </div>

            <div className="flex items-center justify-between gap-6 neu-inset px-8 py-6 rounded-2xl bg-gray-50/50 mb-8">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <span className="block text-3xl font-black text-green-500">{percentage}%</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Positive</span>
                    </div>
                    <div className="h-12 w-px bg-gray-200"></div>
                    <div className="flex gap-8 text-base font-bold">
                        <span className="flex items-center text-green-600 gap-2"><ThumbsUp className="w-6 h-6"/> {positiveCount}</span>
                        <span className="flex items-center text-red-500 gap-2"><ThumbsDown className="w-6 h-6"/> {negativeCount}</span>
                    </div>
                </div>
                <div className="text-sm text-gray-400 font-medium italic">
                    Total: {total} ratings
                </div>
            </div>

            {ratings.length === 0 ? (
                <div className="neu-inset rounded-2xl p-12 text-center text-gray-400 font-medium">
                    No ratings received yet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {ratings.map((rating) => (
                        <div key={rating.id} className="neu-extruded rounded-2xl p-6 flex gap-6 items-start transition-all hover:translate-y-[-2px] duration-300">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${rating.score > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                {rating.score > 0 ? <ThumbsUp className="w-7 h-7" /> : <ThumbsDown className="w-7 h-7" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold text-[#3D4852] text-lg">{rating.fromUserName || `User #${rating.fromUserId}`}</span>
                                        {rating.productTitle && (
                                            <div className="text-xs text-[#6C63FF] font-medium mt-0.5">
                                                Purchase: {rating.productTitle}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                                        {new Date(rating.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="neu-inset rounded-xl p-4 bg-gray-50/50">
                                    <p className="text-gray-600 italic text-sm leading-relaxed">"{rating.comment}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRatings;
