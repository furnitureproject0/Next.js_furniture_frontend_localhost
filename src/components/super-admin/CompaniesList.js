"use client";
import { useState, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
	updateCompanyThunk,
	activateCompanyThunk,
	suspendCompanyThunk,
} from "@/store/slices/companiesSlice";
import { useTranslation } from "@/hooks/useTranslation";
import EditCompanyModal from "./modals/EditCompanyModal";

// Company Icon Component with Multi-color Beautiful SVGs
const CompanyIcon = ({ type, services = [] }) => {
	const typeLower = type?.toLowerCase() || "";
	const serviceList = (Array.isArray(services) ? services : [services]).map(s => s?.toLowerCase() || "");
	
	const isMoving = serviceList.includes("moving") || serviceList.includes("umzug");
	const isCleaning = serviceList.includes("cleaning") || serviceList.includes("reinigung");
	const isShipping = typeLower === "shipping" || serviceList.includes("shipping") || serviceList.includes("delivery");
	const isWarehouse = typeLower === "warehouse" || serviceList.includes("warehouse") || serviceList.includes("storage");
	const isRetail = typeLower === "retail" || serviceList.includes("retail") || serviceList.includes("shop");
	const isInternal = typeLower === "internal";

	// Moving Icon (Truck & Box)
	if (isMoving) {
		return (
			<svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1 14h15a1 1 0 001-1V5a2 2 0 00-2-2H4a2 2 0 00-2 2v7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				<path d="M16 11l4-0.5V6l-4-1v6z" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
				<path d="M3 14v1a2 2 0 002 2h4a2 2 0 002-2v-1" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
				<circle cx="5.5" cy="18.5" r="2.5" fill="#FFD700" stroke="white" strokeWidth="1"/>
				<circle cx="14.5" cy="18.5" r="2.5" fill="#FFD700" stroke="white" strokeWidth="1"/>
				<path d="M21 16l-3 4-1-1" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		);
	}

	// Cleaning Icon (Sparkles & Spray)
	if (isCleaning) {
		return (
			<svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M11 19l-7-7 1.5-1.5 7 7L11 19z" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1.5"/>
				<path d="M14.5 4.5l3 3m-3 0l3-3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
				<path d="M5 4l1 1m6 0l-1-1M3 8h1m16 0h1m-1 7l.5.5m-5 .5l-.5-.5" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round"/>
				<circle cx="12" cy="10" r="4" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)"/>
				<path d="M10 10a2 2 0 012-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M18 12c1.5 0 2.5 1 2.5 2.5S19.5 17.5 18 17.5" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
			</svg>
		);
	}

	// Shipping Icon (Cargo Ship/Container)
	if (isShipping) {
		return (
			<svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M2 17h20l-2 4H4l-2-4z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
				<path d="M4 17V8a2 2 0 012-2h12a2 2 0 012 2v9" stroke="white" strokeWidth="1.5"/>
				<rect x="7" y="9" width="4" height="4" rx="0.5" fill="#FFD700" stroke="white" strokeWidth="1"/>
				<rect x="13" y="9" width="4" height="4" rx="0.5" fill="#7DD3FC" stroke="white" strokeWidth="1"/>
				<path d="M12 3v3m0 0H8m4 0h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
			</svg>
		);
	}

	// Warehouse Icon
	if (isWarehouse) {
		return (
			<svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M3 21h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
				<path d="M5 21V10l7-5 7 5v11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				<rect x="9" y="14" width="6" height="7" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.5"/>
				<path d="M12 14v7M9 17h6" stroke="white" strokeWidth="1"/>
				<path d="M7 8l1-1m8 0l1 1" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
			</svg>
		);
	}

	// Retail Icon
	if (isRetail) {
		return (
			<svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M3 10V21h18V10" stroke="white" strokeWidth="1.5"/>
				<path d="M2 10l2-4h16l2 4H2z" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1.5"/>
				<path d="M6 10v2m4-2v2m4-2v2m4-2v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
				<rect x="9" y="15" width="6" height="6" fill="#FFD700" stroke="white" strokeWidth="1"/>
				<circle cx="16" cy="4" r="1.5" fill="#7DD3FC" stroke="white" strokeWidth="1"/>
			</svg>
		);
	}

	// Internal/Auth Icon
	if (isInternal) {
		return (
			<svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 21s-8-4.5-8-11.8V5l8-3 8 3v4.2c0 7.3-8 11.8-8 11.8z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
				<path d="M9 12l2 2 4-4" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
				<circle cx="12" cy="12" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
			</svg>
		);
	}
	
	// Default Beautiful Icon
	return (
		<svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M3 21h18M5 21V7l7-4 7 4v14M8 21v-8h8v8" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
			<path d="M8 7h3m2 0h3m-5 4h3m-3 4h3" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round"/>
			<circle cx="12" cy="17" r="1" fill="#FFD700" />
		</svg>
	);
};

// Premium Gradient helper function with depth and vibrancy
const getGradientByType = (type, services = []) => {
	const typeLower = type?.toLowerCase() || "";
	const serviceList = (Array.isArray(services) ? services : [services]).map(s => s?.toLowerCase() || "");

	if (typeLower === "shipping" || serviceList.includes("shipping")) {
		return "bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-sky-400 to-blue-600";
	}
	if (typeLower === "warehouse" || serviceList.includes("warehouse")) {
		return "bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-violet-400 to-purple-700";
	}
	if (typeLower === "retail" || serviceList.includes("retail")) {
		return "bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-amber-400 to-orange-600";
	}
	if (serviceList.includes("moving") || serviceList.includes("umzug")) {
		return "bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-rose-400 to-red-600";
	}
	if (serviceList.includes("cleaning") || serviceList.includes("reinigung")) {
		return "bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-emerald-400 to-teal-600";
	}
	if (typeLower === "internal") {
		return "bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-indigo-500 to-slate-800";
	}
	
	return "bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-slate-400 to-slate-700";
};

const CompanyCard = ({ company, onEdit, onDelete, onToggleStatus, t, index }) => {
	const cardRef = useRef(null);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [tilt, setTilt] = useState({ x: 0, y: 0 });

	const handleMouseMove = (e) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		setMousePos({ x, y });
		
		// Calculate tilt
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const tiltX = (y - centerY) / 25;
		const tiltY = (centerX - x) / 25;
		setTilt({ x: tiltX, y: tiltY });
	};

	const handleMouseLeave = () => {
		setTilt({ x: 0, y: 0 });
	};

	return (
		<div 
			ref={cardRef}
			className="group/card relative bg-white border border-primary-100 hover:border-primary-400/50 rounded-2xl p-6 transition-all duration-300 animate-slide-in overflow-hidden"
			style={{ 
				animationDelay: `${index * 60}ms`,
				transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
				boxShadow: tilt.x !== 0 ? '0 30px 60px -12px rgba(34, 132, 230, 0.15)' : 'none'
			}}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			{/* Interactive Hover Light Effect */}
			<div 
				className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-30 transition-opacity duration-300"
				style={{
					background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, var(--color-primary-200), transparent 70%)`
				}}
			></div>

			<div className="relative flex items-start justify-between z-10">
				{/* ... (Company Info remains unchanged) */}
				<div className="flex items-start gap-6 flex-1">
					<div className={`relative w-24 h-24 ${getGradientByType(company.type, company.services)} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 group-hover/card:scale-105 group-hover/card:rotate-1 transition-all duration-500 border-2 border-white/20 overflow-hidden`}>
						{company.logo ? (
							<img 
								src={company.logo} 
								alt={company.name} 
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.onerror = null;
									e.target.style.display = 'none';
									if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
								}}
							/>
						) : null}
						<div className={`${company.logo ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
							<CompanyIcon type={company.type} services={company.services} />
						</div>
						
						{/* Subtle overlay for depth */}
						<div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
						
						{/* Animated Shine Effect */}
						<div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/card:animate-shine-slow pointer-events-none"></div>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2.5">
							<h3 className="text-xl font-bold text-slate-800 group-hover/card:text-primary-600 transition-colors">
								{company.name}
							</h3>
							<div className="relative">
								<span
									className={`px-3.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border shadow-sm flex items-center gap-1.5 ${
										company.available
											? "bg-emerald-50 text-emerald-700 border-emerald-200"
											: "bg-rose-50 text-rose-700 border-rose-200"
									}`}
								>
									<span className={`inline-block w-2 h-2 rounded-full ${company.available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
									{company.available ? t("superAdmin.companyDetails.active") : t("superAdmin.companyDetails.inactive")}
								</span>
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-4 px-1">
							{company.url && (
								<a
									href={company.url.startsWith("http") ? company.url : `https://${company.url}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2.5 text-sm font-medium text-primary-500 hover:text-primary-700 transition-colors group/link"
								>
									<div className="w-5 h-5 rounded-lg bg-primary-100 flex items-center justify-center group-hover/link:animate-bounce-subtle">
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" />
										</svg>
									</div>
									{company.url}
								</a>
							)}
							<div className="flex items-center gap-2.5 text-sm text-slate-500 font-medium">
								<div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center">
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>
								{company.email}
							</div>
							{company.phone && (
								<div className="flex items-center gap-2.5 text-sm text-slate-500 font-medium">
									<div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center">
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28m1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516" />
										</svg>
									</div>
									{company.phone}
								</div>
							)}
						</div>
						
						<div className="flex flex-wrap gap-3 mt-4">
							<div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center gap-2 group/tag shadow-sm hover:bg-white transition-colors">
								<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t("superAdmin.companyDetails.type")}:</span>
								<span className="text-xs font-black text-slate-700 group-hover/tag:text-primary-600 transition-colors uppercase tracking-tight leading-none">{company.type || t("common.nA")}</span>
							</div>
							
							{company.services && (Array.isArray(company.services) ? company.services : [company.services]).map((service, sIdx) => (
								<div key={sIdx} className="px-3 py-1.5 rounded-lg bg-primary-50/50 border border-primary-100 flex items-center gap-2 shadow-sm hover:bg-primary-50 transition-colors group/service">
									<svg className="w-3 h-3 text-primary-500 group-hover/service:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
									</svg>
									<span className="text-xs font-bold text-primary-700 uppercase tracking-tight leading-none">{service}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="flex flex-col items-end gap-6">
					<div className="flex items-center gap-4">
						{/* Joined Date */}
						<div className="text-right px-4 py-3 rounded-xl bg-slate-50/80 border border-slate-100 shadow-sm min-w-[120px]">
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">
								{t("superAdmin.companyDetails.joined")}
							</p>
							<div className="flex items-center justify-end gap-2 text-slate-800">
								<svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<p className="text-xs font-black uppercase tracking-tight">{company.joined || t("common.labels.notSet").toUpperCase()}</p>
							</div>
						</div>

						{/* Last Activity */}
						<div className="text-right px-4 py-3 rounded-xl bg-emerald-50/30 border border-emerald-100/50 shadow-sm min-w-[120px]">
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">
								{t("superAdmin.companyDetails.lastActivity")}
							</p>
							<div className="flex items-center justify-end gap-2 text-slate-800">
								<svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p className="text-xs font-black uppercase tracking-tight">{company.lastActivity || t("common.labels.notSet").toUpperCase()}</p>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-sm opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-4 group-hover/card:translate-x-0">
						<button
							onClick={() => onToggleStatus(company)}
							className="group/btn p-2 text-slate-500 hover:text-green-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
							title={company.available ? t("superAdmin.companyDetails.deactivateCompany") : t("superAdmin.companyDetails.activateCompany")}
						>
							<svg className={`w-5 h-5 group-hover/btn:scale-110 transition-transform ${company.available ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						</button>
						<button
							onClick={() => onEdit(company)}
							className="group/btn p-2 text-slate-500 hover:text-primary-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
							title={t("superAdmin.companyDetails.editCompany")}
						>
							<svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default function CompaniesList({ companies }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [editingCompany, setEditingCompany] = useState(null);

	const handleEdit = (company) => {
		setEditingCompany(company);
	};

	const handleToggleStatus = (company) => {
		if (company.available) {
			dispatch(suspendCompanyThunk(company.id));
		} else {
			dispatch(activateCompanyThunk(company.id));
		}
	};

	if (companies.length === 0) {
		return (
			<div className="bg-white border border-primary-200/40 rounded-lg sm:rounded-xl p-8 sm:p-10 lg:p-12 text-center animate-scale-in">
				<div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg
						className="w-10 h-10 text-slate-300"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
						/>
					</svg>
				</div>
				<p className="text-slate-600 font-medium text-lg">
					{t("superAdmin.companyManagement.noCompaniesFound")}
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-5">
				{companies.map((company, index) => (
					<CompanyCard
						key={company.id}
						company={company}
						onEdit={handleEdit}
						onToggleStatus={handleToggleStatus}
						t={t}
						index={index}
					/>
				))}
			</div>

			{/* Edit Company Modal */}
			{editingCompany && (
				<EditCompanyModal
					isOpen={!!editingCompany}
					onClose={() => setEditingCompany(null)}
					company={editingCompany}
				/>
			)}
		</>
	);
}

