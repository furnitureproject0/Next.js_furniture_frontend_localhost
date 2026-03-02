"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";

// دالة مساعدة لجلب التوكن
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
    }
    return '';
};

export default function SiteAdminOrderDetailsPage() {
    const { t } = useTranslation();
    const { toast } = useGlobalToast();
    const params = useParams();
    const router = useRouter();
    
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false);

    const orderId = parseInt(params.orderId, 10);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;
            
            setIsLoading(true);
            try {
                const token = getAuthToken(); 
                
                const response = await fetch(`https://api.angebotsprofi.ch/api/orders-v2/${orderId}`, {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        ...(token ? { "Authorization": `Bearer ${token}` } : {})
                    },
                    credentials: "include" 
                });

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Server returned HTML or invalid format instead of JSON.");
                }

                const data = await response.json();

                if (response.ok && data.success) {
                    setOrder(data.data);
                } else {
                    throw new Error(data.message || "Failed to load order details");
                }
            } catch (error) {
                console.error("Failed to load order:", error);
                toast.error(error.message || "Failed to load order details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, toast]);

    const handleBack = () => router.back();

    // دالة الطباعة الجديدة لسحب الـ PDF
    // دالة الطباعة المباشرة (بدون فتح تابة جديدة)
    const handlePrint = async () => {
        if (!orderId) return;
        
        setIsPrinting(true);
        try {
            const token = getAuthToken();
            
            const response = await fetch(`https://api.angebotsprofi.ch/api/orders-v2/${orderId}/pdf`, {
                method: "GET",
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to generate PDF");
            }

            // استلام الملف كـ Blob
            const blob = await response.blob();
            const pdfUrl = window.URL.createObjectURL(blob);
            
            // إنشاء iframe مخفي لطباعة الـ PDF في الخلفية
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = pdfUrl;
            document.body.appendChild(iframe);

            // بمجرد تحميل الـ PDF داخل الـ iframe المخفي، بنفتح شاشة الطباعة
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }, 100); // تأخير بسيط جداً لضمان قراءة المتصفح للـ PDF
            };

            // تنظيف الميموري والـ iframe بعد وقت كافي (عشان لو اليوزر ساب شاشة الطباعة مفتوحة شوية)
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                window.URL.revokeObjectURL(pdfUrl);
            }, 60000); // دقيقة واحدة

        } catch (error) {
            console.error("Print error:", error);
            toast.error("Failed to download PDF for printing");
        } finally {
            setIsPrinting(false);
        }
    };

    // دوال مساعدة للتنسيق
    const formatPrice = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return null;
        return `${num.toFixed(2)} CHF`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "assigned": return "bg-blue-100 text-blue-800 border-blue-200";
            case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200";
            case "completed": return "bg-green-100 text-green-800 border-green-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Order Details</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-100 relative">
                    <div className="absolute inset-0 bg-emerald-50 rounded-3xl animate-ping opacity-20"></div>
                    <svg className="w-12 h-12 text-emerald-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Order Not Found</h1>
                <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">
                    We couldn&apos;t find order #{orderId} in our records.
                </p>
                <button onClick={handleBack} className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200/60 border border-slate-100 hover:bg-slate-50">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRoles={["site-admin", "super-admin"]}>
            <div className="min-h-screen bg-slate-50/50 pb-20">
                {/* ── Top Navigation Bar ── */}
                <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBack} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                Order #{order.id}
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </h1>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                Created on {formatDate(order.createdAt)} • Type: <span className="uppercase">{order.type}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handlePrint} 
                            disabled={isPrinting}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPrinting ? (
                                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            )}
                            {isPrinting ? "Loading PDF..." : "Print PDF"}
                        </button>
                        <button onClick={() => router.push(`/site-admin/orders/${order.id}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-md shadow-emerald-500/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            Edit Order
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-6 space-y-6">
                    {/* ── Main Details Grid ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Client Info */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Client Details</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-black border border-blue-100">
                                    {order.client?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-900">{order.client?.name}</p>
                                    <p className="text-sm font-medium text-slate-500">{order.client?.email}</p>
                                </div>
                            </div>
                            {order.client?.phones?.length > 0 && (
                                <div className="pt-3 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 mb-1">Phone Numbers</p>
                                    {order.client.phones.map(p => (
                                        <p key={p.id} className="text-sm font-semibold text-slate-700">{p.phone}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Execution & Company */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Execution Info</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Scheduled Date & Time</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {formatDate(order.execution_date) || "TBD"} 
                                        {order.execution_time && ` at ${order.execution_time.substring(0,5)}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Lead Company</p>
                                    <p className="text-sm font-bold text-slate-800">{order.company?.name || "Not Assigned"}</p>
                                </div>
                                {order.assigned_vehicles?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Assigned Vehicles</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {order.assigned_vehicles.map(v => (
                                                <span key={v.id} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-600">
                                                    {v.license_plate}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Pricing Summary */}
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-black text-emerald-600/70 uppercase tracking-widest mb-4">Order Total Summary</h3>
                                <div className="space-y-2">
                                    {order.fixed_price !== "0.00" && (
                                        <div className="flex justify-between items-center text-sm font-medium text-emerald-800">
                                            <span>Fixed Price</span>
                                            <span>{formatPrice(order.fixed_price)}</span>
                                        </div>
                                    )}
                                    {order.min_total_price !== "0.00" && (
                                        <div className="flex justify-between items-center text-sm font-medium text-emerald-800">
                                            <span>Min Estimated</span>
                                            <span>{formatPrice(order.min_total_price)}</span>
                                        </div>
                                    )}
                                    {order.max_total_price !== "0.00" && (
                                        <div className="flex justify-between items-center text-sm font-medium text-emerald-800">
                                            <span>Max Estimated</span>
                                            <span>{formatPrice(order.max_total_price)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-emerald-200/50 flex justify-between items-end">
                                <span className="text-sm font-black text-emerald-900 uppercase">Total Estimate</span>
                                <span className="text-2xl font-black text-emerald-600">
                                    {order.fixed_price !== "0.00" ? formatPrice(order.fixed_price) : `${formatPrice(order.min_total_price)} - ${formatPrice(order.max_total_price)}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Locations Section ── */}
                    {(order.primary_location || order.secondary_location) && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Route Locations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                {order.secondary_location && <div className="hidden md:block absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 z-10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>}
                                
                                {order.primary_location && (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Primary Location (From)</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{order.primary_location.address}</p>
                                    </div>
                                )}
                                {order.secondary_location && (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secondary Location (To)</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{order.secondary_location.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Services Section ── */}
                    {order.orderServices?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Requested Services ({order.orderServices.length})</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.orderServices.map(os => (
                                    <div key={os.id} className="p-6">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                                    {os.service?.name}
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border ${getStatusColor(os.status)}`}>
                                                        {os.status}
                                                    </span>
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1 max-w-2xl">{os.service?.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Service Subtotal</p>
                                                <p className="text-lg font-black text-slate-800">
                                                    {os.fixed_price !== "0.00" ? formatPrice(os.fixed_price) : `${formatPrice(os.min_total_price)} - ${formatPrice(os.max_total_price)}`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Service Pricing Breakdown */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Pricing Type</span>
                                                <span className="text-sm font-semibold text-slate-700 uppercase">{os.pricing_type.replace('_', ' ')}</span>
                                            </div>
                                            {os.pricing_type !== 'custom' && os.pricing_type !== 'flat_rate' && (
                                                <>
                                                    {os.price_per_unit !== "0.00" && (
                                                        <div>
                                                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Price Per Unit</span>
                                                            <span className="text-sm font-semibold text-slate-700">{formatPrice(os.price_per_unit)}</span>
                                                        </div>
                                                    )}
                                                    {os.min_units > 0 && (
                                                        <div>
                                                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Min Units</span>
                                                            <span className="text-sm font-semibold text-slate-700">{os.min_units}</span>
                                                        </div>
                                                    )}
                                                    {os.max_units > 0 && (
                                                        <div>
                                                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Max Units</span>
                                                            <span className="text-sm font-semibold text-slate-700">{os.max_units}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Additions for this service */}
                                        {os.additions?.length > 0 && (
                                            <div className="mt-4">
                                                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Additions</h5>
                                                <div className="space-y-2">
                                                    {os.additions.map(add => (
                                                        <div key={add.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                                            <div>
                                                                <span className="text-sm font-bold text-slate-800 block">{add.Addition?.name || "Addition"}</span>
                                                                <span className="text-[10px] font-semibold text-slate-400 uppercase">{add.pricing_type.replace('_', ' ')}</span>
                                                                {add.note && <p className="text-xs text-slate-500 mt-1 italic">Note: {add.note}</p>}
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-sm font-bold text-slate-700">
                                                                    {add.fixed_price !== "0.00" ? formatPrice(add.fixed_price) : `${formatPrice(add.min_total_price)} - ${formatPrice(add.max_total_price)}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {os.notes && (
                                            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">Service Notes</span>
                                                <p className="text-xs font-medium text-amber-800">{os.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Global Notes ── */}
                    {order.notes && (
                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                            <h3 className="text-xs font-black text-amber-600/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Important Order Notes
                            </h3>
                            <p className="text-sm font-medium text-amber-900 leading-relaxed">
                                {order.notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}