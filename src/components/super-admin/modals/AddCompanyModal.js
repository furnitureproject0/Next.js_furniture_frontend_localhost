"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import { createCompanyThunk } from "@/store/slices/companiesSlice"; 
import { useGlobalToast } from "@/hooks/useGlobalToast";

export default function AddCompanyModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { toast } = useGlobalToast();
    
    const fileInputRef = useRef(null);
    const searchRef = useRef(null);

    const [availableServices, setAvailableServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    
    // 🟢 تم دمج حقولك مع الحقول المطلوبة للـ UI عشان مفيش حاجة تضرب 🟢
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        description: "",
        address: "",
        website: "",
        type: "Furniture Moving",
        services: [],
        available: true,
        phones: [""], 
        socialMedia: [{ platform: "facebook", url: "" }]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    
    const [addressQuery, setAddressQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // بحث العناوين
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (addressQuery.trim().length > 2 && showSuggestions) {
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
    }, [addressQuery, showSuggestions]);

    // إغلاق قائمة العناوين عند الضغط بالخارج
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // دوال التحكم في حقول الهواتف الديناميكية 
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

    // دوال التحكم في حقول السوشيال ميديا الديناميكية
    const handleSocialChange = (index, field, value) => {
        const newSocials = [...formData.socialMedia];
        newSocials[index][field] = value;
        setFormData(prev => ({ ...prev, socialMedia: newSocials }));
    };
    const addSocialField = () => {
        setFormData(prev => ({ ...prev, socialMedia: [...prev.socialMedia, { platform: "facebook", url: "" }] }));
    };
    const removeSocialField = (index) => {
        const newSocials = formData.socialMedia.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, socialMedia: newSocials.length ? newSocials : [{ platform: "facebook", url: "" }] }));
    };

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

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { 
                toast.error("Image size should be less than 2MB");
                e.target.value = "";
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const canSubmit = formData.name && formData.email && formData.website && formData.description && formData.address;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 🟢 الـ Validation بتاعك للـ services 🟢
        // (مؤقتاً معمول كومنت لو مفيش UI للخدمات لسه عشان الفورم تتبعت)
        /*
        if (!formData.services || formData.services.length === 0) {
            toast.error(t("superAdmin.modals.addCompany.selectServicesError") || "Please select at least one service");
            return;
        }
        */

        if (!canSubmit) {
            toast.error("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('website', formData.website);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('address', formData.address);
            
            // إضافة الخدمات لو موجودة (من شغلك)
            if (formData.services && formData.services.length > 0) {
                formDataToSend.append('services', JSON.stringify(formData.services));
            }

            const validPhones = formData.phones.filter(phone => phone.trim() !== "");
            if (validPhones.length > 0) {
                formDataToSend.append('phones', JSON.stringify(validPhones));
            }

            const validSocials = formData.socialMedia.filter(social => social.url.trim() !== "");
            if (validSocials.length > 0) {
                formDataToSend.append('socialMedia', JSON.stringify(validSocials));
            }
            
            if (logoFile) {
                formDataToSend.append('logo', logoFile);
            }

            const resultAction = await dispatch(createCompanyThunk(formDataToSend));

            if (createCompanyThunk.fulfilled.match(resultAction)) {
                toast.success(t("common.success") || "Company created successfully");
                setFormData({ 
                    name: "", email: "", website: "", description: "", address: "",
                    type: "Furniture Moving", services: [], available: true,
                    phones: [""], socialMedia: [{ platform: "facebook", url: "" }]
                });
                setAddressQuery("");
                handleRemoveLogo();
                onClose();
            } else {
                throw new Error(resultAction.payload?.message || "Failed to create company");
            }
        } catch (error) {
            console.error("Error creating company:", error);
            toast.error(error?.message || error || t("common.error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {t("superAdmin.modals.addCompany.title") || "Create New Company"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form (Scrollable) */}
                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form id="add-company-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Logo Upload Section */}
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="relative group">
                                <div className={`w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all bg-slate-50 ${logoPreview ? 'border-primary-400 shadow-sm' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-100 cursor-pointer'}`}
                                     onClick={() => !logoPreview && fileInputRef.current?.click()}
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400 group-hover:text-primary-500">
                                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Upload Logo</span>
                                        </div>
                                    )}
                                </div>
                                
                                {logoPreview && (
                                    <button 
                                        type="button" 
                                        onClick={handleRemoveLogo}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleLogoChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </div>
                        </div>

                        {/* Basic Info Section */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-5">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Company Name */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        minLength={3}
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Express Logistics"
                                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@company.com"
                                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                    />
                                </div>

                                {/* Website */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                        Website URL <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="website"
                                        required
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://www.company.com"
                                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-5">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Location & Address</h3>
                            <div className="space-y-1.5" ref={searchRef}>
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Search Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="addressQuery"
                                        required
                                        value={addressQuery}
                                        onChange={handleAddressInputChange}
                                        onFocus={() => addressQuery.length > 2 && setShowSuggestions(true)}
                                        placeholder="Type to search for company address..."
                                        className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                        autoComplete="off"
                                    />
                                    {isSearching && (
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                            <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    )}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                                            {suggestions.map((suggestion) => (
                                                <li 
                                                    key={suggestion.place_id}
                                                    onClick={() => handleSelectAddress(suggestion)}
                                                    className="px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex items-start gap-2"
                                                >
                                                    <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    </svg>
                                                    <span>{suggestion.display_name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Phones Section */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <h3 className="text-sm font-bold text-slate-800">Phone Numbers</h3>
                                <button type="button" onClick={addPhoneField} className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1 rounded-lg transition-colors">
                                    + Add Phone
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.phones.map((phone, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => handlePhoneChange(index, e.target.value)}
                                            placeholder="e.g., +41441234567"
                                            className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removePhoneField(index)}
                                            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Media Section */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <h3 className="text-sm font-bold text-slate-800">Social Media Links</h3>
                                <button type="button" onClick={addSocialField} className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1 rounded-lg transition-colors">
                                    + Add Social Link
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.socialMedia.map((social, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-center gap-3">
                                        <select 
                                            value={social.platform}
                                            onChange={(e) => handleSocialChange(index, "platform", e.target.value)}
                                            className="w-full sm:w-1/3 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all cursor-pointer"
                                        >
                                            <option value="facebook">Facebook</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="twitter">Twitter</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <input
                                            type="url"
                                            value={social.url}
                                            onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                                            placeholder="https://..."
                                            className="w-full sm:w-2/3 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeSocialField(index)}
                                            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2 block mb-3">
                                Company Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief details about the company's services, history, and mission..."
                                className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all resize-none shadow-sm"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer / Buttons */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-company-form"
                        disabled={isSubmitting || !canSubmit}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            "Create Company"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}