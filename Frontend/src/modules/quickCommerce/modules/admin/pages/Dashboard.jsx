import React, { useState, useEffect } from 'react';
import Card from '@shared/components/ui/Card';
import PageHeader from '@shared/components/ui/PageHeader';
import StatCard from '@shared/components/ui/StatCard';
import Badge from '@shared/components/ui/Badge';
import { adminApi } from '../services/adminApi';
import { motion } from 'framer-motion';
import {
    Users,
    Store,
    Truck,
    BarChart3,
    Activity,
    Database,
    RotateCw,
    Loader2,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { cn } from '@qc/lib/utils';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminApi.getStats();
                if (res.data.success) {
                    setStatsData(res.data.result);
                    setLastUpdatedAt(new Date());
                }
            } catch (error) {
                console.error("Dashboard Stats Error:", error);
                toast.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full"></div>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Synchronizing Data...</p>
            </div>
        );
    }

    const overview = statsData?.overview || {};
    const formatLastUpdated = (value) => {
        if (!value) return 'Last Update: --';
        const now = new Date();
        const updated = new Date(value);
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const updatedDate = new Date(updated.getFullYear(), updated.getMonth(), updated.getDate());
        const dayDiff = Math.round((nowDate - updatedDate) / (1000 * 60 * 60 * 24));

        let dayLabel = updated.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (dayDiff === 0) dayLabel = 'Today';
        if (dayDiff === 1) dayLabel = 'Yesterday';

        const timeLabel = updated.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        return `Last Update: ${dayLabel}, ${timeLabel}`;
    };

    const stats = [
        {
            label: 'Total Users',
            value: overview.totalUsers?.toLocaleString() || '0',
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            trend: '+12.5%',
            trendDir: 'up',
            description: 'Active this month'
        },
        {
            label: 'Active Sellers',
            value: overview.activeSellers?.toLocaleString() || '0',
            icon: Store,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            trend: '+5.2%',
            trendDir: 'up',
            description: 'Verified stores'
        },
        {
            label: 'Total Orders',
            value: overview.totalOrders?.toLocaleString() || '0',
            icon: Truck,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            trend: '+18.4%',
            trendDir: 'up',
            description: 'Last 30 days'
        },
        {
            label: 'Revenue',
            value: `₹${overview.totalRevenue?.toLocaleString() || '0'}`,
            icon: BarChart3,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: '+8.2%',
            trendDir: 'up',
            description: 'Net earnings'
        },
    ];

    const chartData = statsData?.revenueHistory || [];
    const categoryData = statsData?.categoryData || [];
    const recentOrders = statsData?.recentOrders || [];
    const topProducts = statsData?.topProducts || [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="ds-section-spacing px-2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <PageHeader
                title="Dashboard"
                description="Monitor your platform's key performance indicators in real-time."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <Badge variant="outline" className="ds-badge ds-badge-gray bg-white/50 backdrop-blur-sm">
                                {formatLastUpdated(lastUpdatedAt)}
                            </Badge>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 group"
                        >
                            <RotateCw className="w-4 h-4 text-slate-500 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                }
            />

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={stat.label} 
                        variants={itemVariants}
                        className="group"
                    >
                        <div className={cn(
                            "relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] border border-white/50",
                            idx === 0 && "bg-gradient-to-br from-indigo-500/10 via-indigo-50/50 to-white shadow-indigo-100/50",
                            idx === 1 && "bg-gradient-to-br from-purple-500/10 via-purple-50/50 to-white shadow-purple-100/50",
                            idx === 2 && "bg-gradient-to-br from-orange-500/10 via-orange-50/50 to-white shadow-orange-100/50",
                            idx === 3 && "bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white shadow-emerald-100/50",
                        )}>
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-20 transition-transform group-hover:scale-150 duration-700"
                                style={{ backgroundColor: stat.color.replace('text-', '') }}
                            />
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-3.5 rounded-2xl shadow-sm ring-1 ring-white/50", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6", stat.color)} strokeWidth={2.5} />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase",
                                        stat.trendDir === 'up' ? "bg-emerald-100/80 text-emerald-700" : "bg-rose-100/80 text-rose-700"
                                    )}>
                                        {stat.trendDir === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div>
                                </div>
                                
                                <div className="mt-auto">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{stat.value}</h3>
                                    <p className="text-[10px] font-bold text-slate-400/80 italic">{stat.description}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Revenue Analytics */}
                <motion.div className="lg:col-span-2" variants={itemVariants}>
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Analytics</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed breakdown of earnings</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-2xl">
                                <BarChart3 className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <div className="ds-chart-container h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={(value) => `₹${value >= 1000 ? value / 1000 + 'k' : value}`}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
                                        contentStyle={{
                                            borderRadius: '20px',
                                            border: 'none',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                            padding: '16px',
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        animationDuration={2500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                {/* Categories Distribution */}
                <motion.div className="lg:col-span-1" variants={itemVariants}>
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 shadow-xl shadow-slate-200/50 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Categories</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sales by segment</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        animationBegin={500}
                                        animationDuration={2000}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">72%</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Growth</span>
                            </div>
                        </div>
                        <div className="space-y-4 mt-8 px-2">
                            {categoryData.map((cat) => (
                                <div key={cat.name} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-3 w-3 rounded-full shadow-sm ring-4 ring-white" style={{ backgroundColor: cat.color }} />
                                        <span className="text-xs font-black text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-wider">{cat.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">₹{cat.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Recent Orders */}
                <motion.div className="lg:col-span-2" variants={itemVariants}>
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Orders</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time order flow</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-2xl">
                                <Truck className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-slate-100">
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                            <td className="py-5 text-xs font-black text-primary uppercase tracking-widest">#{order.id}</td>
                                            <td className="py-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm uppercase group-hover:scale-110 transition-transform">
                                                        {order.customer?.[0] || "?"}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{order.customer}</span>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <Badge variant={order.status} className="rounded-full px-3 py-1.5 text-[9px] font-black tracking-widest uppercase border-none">
                                                    {order.statusText}
                                                </Badge>
                                            </td>
                                            <td className="py-5 text-sm font-black text-slate-900 text-right">₹{order.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="w-full mt-8 py-4 rounded-[1.5rem] bg-slate-900 text-[10px] font-black text-white hover:bg-primary hover:shadow-2xl hover:shadow-primary/40 transition-all uppercase tracking-[0.3em]">
                            Open Order Ledger
                        </button>
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div className="lg:col-span-1" variants={itemVariants}>
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 shadow-xl shadow-slate-200/50 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Products</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Best sellers this week</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-2xl">
                                <Database className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {topProducts.length > 0 ? topProducts.map((product, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer bg-slate-50/50">
                                    <div className="flex items-center space-x-4">
                                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform overflow-hidden ring-4 ring-white", !product.image ? (product.color + " text-2xl") : "bg-white")}>
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="opacity-80">{product.icon}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-none">{product.name}</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase mt-2 tracking-[0.2em]">{product.cat}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900">₹{product.rev}</p>
                                        <div className="flex items-center justify-end gap-0.5 mt-1">
                                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                            <p className="text-[10px] text-emerald-500 font-black">{product.trend}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center flex flex-col items-center gap-4">
                                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center">
                                        <Activity className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">No sales data yet</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-400 hover:border-primary hover:text-primary transition-all uppercase tracking-[0.3em] hover:bg-primary/5">
                            Expand Inventory
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
