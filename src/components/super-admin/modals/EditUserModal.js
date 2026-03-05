"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUserThunk } from "@/store/slices/usersSlice";
import { useState, useRef, useEffect, useMemo } from "react";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export default function EditUserModal({ isOpen, onClose, user }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { toast } = useGlobalToast();

    // جلب بيانات المستخدم المحدثة من الـ Store
    const users = useAppSelector((state) => state.users.users);
    const currentUser = users.find((u) => u.id === user?.id) || user;

    const searchRef = useRef(null);

    // استخراج الهواتف بذكاء لضمان عرضها عند فتح المودال
    const initialPhones = useMemo(() => {
        if (Array.isArray(currentUser?.phones) && currentUser.phones.length > 0) {
            return currentUser.phones.map(p => typeof p === 'object' ? p.phone : p);
        }
        if (typeof currentUser?.phone === 'string' && currentUser.phone.trim() !== "") {
            return [currentUser.phone];
        }
        return [""];
    }, [currentUser]);

    // استخراج العنوان بذكاء لضمان عرضه عند فتح المودال
    const initialAddress = useMemo(() => {
        return currentUser?.location?.address || currentUser?.address || "";
    }, [currentUser]);

    const initialBirthdate = currentUser?.birthdate ? currentUser.birthdate.split('T')[0] : "";
    const initialRole = currentUser?.role || "client";

    const [isSubmitting, setIsSubmitting] = useState(false);

    // States للبحث في الخرائط
    const [addressQuery, setAddressQuery] = useState(initialAddress);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        role: initialRole,
        birthdate: initialBirthdate,
        phones: initialPhones.length > 0 ? initialPhones : [""],
        address: initialAddress,
    });

    // تحديث الفورم عند تغير المستخدم الحالي
    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || "",
                email: currentUser.email || "",
                role: currentUser.role || "client",
                birthdate: currentUser.birthdate ? currentUser.birthdate.split('T')[0] : "",
                phones: initialPhones,
                address: initialAddress,
            });
            setAddressQuery(initialAddress);
        }
    }, [currentUser, initialPhones, initialAddress]);

    // تأثير البحث عن العناوين مع Debounce 
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (addressQuery.trim().length > 2 && showSuggestions && addressQuery !== formData.address) {
                setIsSearching(true);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json&addressdetails=1&limit=5&accept-language=en`);
                    const data = await res.json();
                    setSuggestions(data);
                } catch (err) {
                    console.error("Address search error:", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [addressQuery, showSuggestions, formData.address]);

    // إغلاق القائمة المنسدلة للاقتراحات عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // دوال العنوان
    const handleAddressInputChange = (e) => {
        const val = e.target.value;
        setAddressQuery(val);
        setFormData((prev) => ({ ...prev, address: val }));
        setShowSuggestions(true);
    };

    const handleSelectAddress = (suggestion) => {
        const selectedAddress = suggestion.display_name;
        setAddressQuery(selectedAddress);
        setFormData((prev) => ({ ...prev, address: selectedAddress }));
        setShowSuggestions(false);
    };

    // وظائف التحكم بمصفوفة أرقام الهواتف
    const handlePhoneChange = (index, value) => {
        const newPhones = [...formData.phones];
        newPhones[index] = value;
        setFormData(prev => ({ ...prev, phones: newPhones }));
    };
    const addPhoneField = () => {
        setFormData(prev => ({ ...prev, phones: [...prev.phones, ""] }));
    };
    const removePhoneField = (index) => {
        const newPhones = formData.phones.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, phones: newPhones.length ? newPhones : [""] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;

        // تجميع الحقول التي تغيرت فقط (Partial Update)
        const payload = {};
        
        if (formData.name !== (currentUser?.name || "")) payload.name = formData.name;
        if (formData.email !== (currentUser?.email || "")) payload.email = formData.email;
        if (formData.role !== initialRole) payload.role = formData.role;
        if (formData.birthdate !== initialBirthdate) payload.birthdate = formData.birthdate;

        const validPhones = formData.phones.filter(phone => phone.trim() !== "");
        const validInitialPhones = initialPhones.filter(phone => phone.trim() !== "");
        
        if (JSON.stringify(validPhones) !== JSON.stringify(validInitialPhones)) {
            payload.phones = validPhones;
        }

        if (formData.address !== initialAddress) {
            payload.location = { address: formData.address };
        }

        // إغلاق المودال مباشرة إذا لم يتم تغيير أي حقل
        if (Object.keys(payload).length === 0) {
            toast.info("No changes detected.");
            onClose();
            return;
        }

        setIsSubmitting(true);

        try {
            await dispatch(updateUserThunk({
                id: currentUser.id,
                updates: payload,
            })).unwrap();

            toast.success(t("common.messages.updateSuccess") || "User updated successfully");
            onClose();
        } catch (error) {
            toast.error(error?.message || error || t("common.error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !currentUser) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-scale-in custom-scrollbar flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-4 rounded-t-xl sm:rounded-t-2xl z-10 flex-shrink-0">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {t("superAdmin.modals.editUser.title") || "Edit User"}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form id="edit-user-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
                    
                    {/* Basic Info */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-5">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    {t("superAdmin.modals.addUser.fullName")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                    placeholder={t("superAdmin.modals.addUser.namePlaceholder")}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    {t("superAdmin.modals.addUser.email")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                    placeholder={t("superAdmin.modals.addUser.emailPlaceholder")}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Birthdate
                                </label>
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all text-slate-700"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    {t("superAdmin.modals.addUser.role")} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all cursor-pointer"
                                >
                                    <option value="client">{t("superAdmin.roles.customer") || "Client"}</option>
                                    <option value="super_admin">{t("superAdmin.roles.super_admin") || "Super Admin"}</option>
                                    <option value="site_admin">{t("superAdmin.roles.site_admin") || "Site Admin"}</option>
                                    <option value="company_admin">{t("superAdmin.roles.company_admin") || "Company Admin"}</option>
                                    <option value="company_secretary">{t("superAdmin.roles.company_secretary") || "Company Secretary"}</option>
                                    <option value="driver">{t("superAdmin.roles.driver") || "Driver"}</option>
                                    <option value="worker">{t("superAdmin.roles.worker") || "Worker"}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Phones */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-bold text-slate-800">Phone Numbers</h3>
                            <button type="button" onClick={addPhoneField} className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 px-2 py-1 rounded-lg">+ Add Phone</button>
                        </div>
                        <div className="space-y-3">
                            {formData.phones.map((phone, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                                        placeholder="+2010..."
                                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                    />
                                    <button type="button" onClick={() => removePhoneField(index)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location (Autocomplete) */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Location Address</h3>
                        <div className="space-y-1.5" ref={searchRef}>
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Search Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    name="addressQuery"
                                    value={addressQuery}
                                    onChange={handleAddressInputChange}
                                    onFocus={() => addressQuery.length > 2 && setShowSuggestions(true)}
                                    placeholder="Type to search for user address..."
                                    className="w-full pl-11 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                    autoComplete="off"
                                />
                                {isSearching && (
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                        <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    </div>
                                )}
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                                        {suggestions.map((suggestion) => (
                                            <li 
                                                key={suggestion.place_id}
                                                onClick={() => handleSelectAddress(suggestion)}
                                                className="px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 cursor-pointer border-b border-slate-50 last:border-0 flex items-start gap-2"
                                            >
                                                <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                                <span>{suggestion.display_name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer / Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t("common.buttons.cancel")}
                    </button>
                    <button
                        type="submit"
                        form="edit-user-form"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </>
                        ) : (
                            t("superAdmin.modals.editUser.updateUserButton") || "Update User"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}