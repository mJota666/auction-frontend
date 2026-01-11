import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../services/auth';
import { Star, ThumbsUp, ThumbsDown, User as UserIcon, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';

interface Rating {
    id: number;
    fromUserId: number;
    fromUserName: string;
    score: number;
    comment: string;
    createdAt: string;
    productTitle?: string;
}

const PublicProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Parallel fetch for speed
                const [ratingsData, profileData] = await Promise.all([
                    authService.getRatings(Number(id)),
                    authService.getUserPublicProfile(Number(id))
                ]);

                setRatings(Array.isArray(ratingsData) ? ratingsData : []);
                setUserProfile(profileData);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const positiveCount = userProfile?.ratingPositive ?? ratings.filter(r => r.score > 0).length;
    const negativeCount = userProfile?.ratingNegative ?? ratings.filter(r => r.score < 0).length;
    const total = positiveCount + negativeCount;
    const percentage = total > 0 ? ((positiveCount / total) * 100).toFixed(1) : 100;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F4F8] flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center pt-20">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F8] flex flex-col">
            <Navbar />
            <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* Header Section */}
                    <div className="neu-extruded rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 neu-inset rounded-full flex items-center justify-center p-2 flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-[#E0E5EC] flex items-center justify-center text-[#6C63FF]">
                                <UserIcon className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-2 flex-1">
                            <h1 className="text-3xl font-extrabold text-[#3D4852]">
                                {userProfile?.fullName || `User #${id}`}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-medium text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> 
                                    Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="neu-inset px-8 py-6 rounded-2xl bg-gray-50/50 flex items-center gap-6">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-green-500">{percentage}%</span>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Positive</span>
                            </div>
                            <div className="h-12 w-px bg-gray-200"></div>
                            <div className="flex gap-6 text-base font-bold">
                                <div className="flex flex-col items-center">
                                     <ThumbsUp className="w-6 h-6 text-green-600 mb-1"/> 
                                     <span className="text-green-600">{positiveCount}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                     <ThumbsDown className="w-6 h-6 text-red-500 mb-1"/> 
                                     <span className="text-red-500">{negativeCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ratings List */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#3D4852] pl-2 flex items-center gap-2">
                             <Star className="w-6 h-6 text-[#6C63FF] fill-current" />
                             Rating History ({total})
                        </h2>
                        
                        {ratings.length === 0 ? (
                            <div className="neu-extruded rounded-2xl p-12 text-center text-gray-400 font-medium">
                                No ratings available for this user.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {ratings.map((rating) => (
                                    <div key={rating.id} className="neu-extruded rounded-2xl p-6 flex gap-6 items-start transition-all hover:scale-[1.01] duration-300">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${rating.score > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                            {rating.score > 0 ? <ThumbsUp className="w-7 h-7" /> : <ThumbsDown className="w-7 h-7" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-bold text-[#3D4852] text-lg">{rating.fromUserName || `User #${rating.fromUserId}`}</span>
                                                    {rating.productTitle && (
                                                        <div className="text-xs text-[#6C63FF] font-medium mt-0.5">
                                                            Transaction: {rating.productTitle}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                                                    {new Date(rating.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {rating.comment && (
                                                <div className="neu-inset rounded-xl p-4 bg-gray-50/50">
                                                    <p className="text-gray-600 italic text-sm leading-relaxed">"{rating.comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
