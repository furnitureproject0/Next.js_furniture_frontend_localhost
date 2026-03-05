"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { updateCompanyThunk } from "@/store/slices/companiesSlice";
import { useState, useRef, useEffect, useMemo } from "react";

export default function EditCompanyModal({ isOpen, onClose, company }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { toast } = useGlobalToast();

    const fileInputRef = useRef(null);
    const searchRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    
    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `https://api.angebotsprofi.ch${logoPath}`; 
    };
    const [logoPreview, setLogoPreview] = useState(getLogoUrl(company?.logo));

    // 🟢 استخراج الداتا الأصلية مرة واحدة عشان نقارن بيها 🟢
    const initialData = useMemo(() => {
        const phones = Array.isArray(company?.phones) 
            ? company.phones.map(p => typeof p === 'object' ? p.phone : p) 
            : (company?.phone ? [company.phone] : [""]);
            
        const socialMedia = Array.isArray(company?.socialMedia) && company.socialMedia.length > 0
            ? company.socialMedia.map(s => ({ platform: s.platform, url: s.url })) // تنظيف الداتا من الـ IDs
            : [{ platform: "facebook", url: "" }];
            
        return { phones, socialMedia };
    }, [company]);

    const [addressQuery, setAddressQuery] = useState(company?.address || "");
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        name: company?.name || "",
        email: company?.email || "",
        description: company?.description || "",
        address: company?.address || "",
        website: company?.website || company?.url || "",
        phones: initialData.phones.length > 0 ? initialData.phones : [""],
        socialMedia: initialData.socialMedia
    });

    // 🟢 التحقق من وجود تغييرات (لإرسال الحقول المعدلة فقط) 🟢
    const hasChanges = useMemo(() => {
        if (logoFile) return true;
        if (formData.name !== (company.name || "")) return true;
        if (formData.email !== (company.email || "")) return true;
        if (formData.description !== (company.description || "")) return true;
        if (formData.address !== (company.address || "")) return true;
        
        let websiteUrl = formData.website.trim();
        if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
            websiteUrl = 'https://' + websiteUrl;
        }
        const originalWebsite = company.website || company.url || "";
        if (websiteUrl !== originalWebsite) return true;

        const validPhones = formData.phones.filter(p => p.trim() !== "");
        const origPhones = initialData.phones.filter(p => p.trim() !== "");
        if (JSON.stringify(validPhones) !== JSON.stringify(origPhones)) return true;

        const validSocials = formData.socialMedia.filter(s => s.url.trim() !== "");
        const origSocials = initialData.socialMedia.filter(s => s.url.trim() !== "");
        if (JSON.stringify(validSocials) !== JSON.stringify(origSocials)) return true;

        return false;
    }, [formData, logoFile, company, initialData]);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen || !company) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const handleSocialChange = (index, field, value) => {
        const newSocials = [...formData.socialMedia];
        newSocials[index] = { ...newSocials[index], [field]: value };
        setFormData(prev => ({ ...prev, socialMedia: newSocials }));
    };
    const addSocialField = () => {
        setFormData(prev => ({ ...prev, socialMedia: [...prev.socialMedia, { platform: "facebook", url: "" }] }));
    };
    const removeSocialField = (index) => {
        const newSocials = formData.socialMedia.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, socialMedia: newSocials.length ? newSocials : [{ platform: "facebook", url: "" }] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!hasChanges) {
            toast.info("No changes detected.");
            onClose();
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            
            // 🟢 الحل هنا: إرسال الاسم دائمًا كحقل أساسي لضمان عدم إرسال body فارغ للباك إند 🟢
            formDataToSend.append('name', formData.name);
            
            // باقي الحقول تتبعت لو اتغيرت بس (لتقليل حجم الريكويست)
            if (formData.email !== (company.email || "")) formDataToSend.append('email', formData.email);
            if (formData.description !== (company.description || "")) formDataToSend.append('description', formData.description);
            if (formData.address !== (company.address || "")) formDataToSend.append('address', formData.address);
            
            let websiteUrl = formData.website.trim();
            if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                websiteUrl = 'https://' + websiteUrl;
            }
            if (websiteUrl !== (company.website || company.url || "")) formDataToSend.append('website', websiteUrl);
            
            // الهواتف
            const validPhones = formData.phones.filter(phone => phone.trim() !== "");
            const origPhones = initialData.phones.filter(p => p.trim() !== "");
            if (JSON.stringify(validPhones) !== JSON.stringify(origPhones)) {
                formDataToSend.append('phones', JSON.stringify(validPhones));
            }

            // السوشيال ميديا
            const validSocials = formData.socialMedia.filter(social => social.url.trim() !== "");
            const origSocials = initialData.socialMedia.filter(s => s.url.trim() !== "");
            if (JSON.stringify(validSocials) !== JSON.stringify(origSocials)) {
                formDataToSend.append('socialMedia', JSON.stringify(validSocials));
            }
            
            // اللوجو (إذا تم تغييره)
            if (logoFile) {
                formDataToSend.append('logo', logoFile);
            }

            await dispatch(updateCompanyThunk({
                id: company.id,
                updates: formDataToSend,
            })).unwrap();

            toast.success(t("common.messages.updateSuccess") || "Company updated successfully");
            onClose();
        } catch (error) {
            console.error("Error updating company:", error);
            toast.error(error?.message || error || "An error occurred");
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {t("superAdmin.modals.editCompany.title") || "Edit Company"}
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
                    <form id="edit-company-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Logo Upload Section */}
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="relative group">
                                <div className={`w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all bg-slate-50 ${logoPreview ? 'border-primary-400 shadow-sm' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-100 cursor-pointer'}`}
                                     onClick={() => fileInputRef.current?.click()}
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400 group-hover:text-primary-500">
                                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Change Logo</span>
                                        </div>
                                    )}
                                </div>
                                
                                {logoPreview && (
                                    <button 
                                        type="button" 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveLogo(); }}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Website URL
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5 pt-2" ref={searchRef}>
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Company Location
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
                                    value={addressQuery}
                                    onChange={handleAddressInputChange}
                                    onFocus={() => addressQuery.length > 2 && setShowSuggestions(true)}
                                    className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
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
                                                className="px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 cursor-pointer border-b border-slate-50 last:border-0 flex items-start gap-2"
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

                        {/* Phones */}
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Phone Numbers</label>
                                <button type="button" onClick={addPhoneField} className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 px-2 py-1 rounded-lg">+ Add Phone</button>
                            </div>
                            {formData.phones.map((phone, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                                    />
                                    <button type="button" onClick={() => removePhoneField(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Social Media */}
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Social Media Links</label>
                                <button type="button" onClick={addSocialField} className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 px-2 py-1 rounded-lg">+ Add Link</button>
                            </div>
                            {formData.socialMedia.map((social, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
                                    <select 
                                        value={social.platform}
                                        onChange={(e) => handleSocialChange(index, "platform", e.target.value)}
                                        className="w-full sm:w-1/3 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
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
                                        className="w-full sm:w-2/3 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                                    />
                                    <button type="button" onClick={() => removeSocialField(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 resize-none"
                            />
                        </div>
                    </form>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
                    >
                        {t("common.buttons.cancel")}
                    </button>
                    <button
                        type="submit"
                        form="edit-company-form"
                        // الزرار هيفضل مقفول لو مفيش أي حاجة اتغيرت
                        disabled={isSubmitting || !hasChanges}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                            t("superAdmin.modals.editCompany.updateCompanyButton") || "Update Company"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}