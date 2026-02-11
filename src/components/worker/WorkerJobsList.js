"use client";

import { useTranslation } from "@/hooks/useTranslation";

const JobCard = ({ job, onViewJob }) => {
	const { t } = useTranslation();
	const getStatusColor = (status) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "assigned":
			case "scheduled":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "in-progress":
				return "bg-orange-100 text-orange-800 border-orange-200";
			case "completed":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<div
			className="bg-white border border-purple-200/40 rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow cursor-pointer"
			onClick={() => onViewJob(job)}
		>
			<div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
				<div className="flex-1 min-w-0">
					<h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-1.5 sm:mb-2 truncate">
						{t("worker.jobs.job")} #{job.id}
					</h3>
					<span
						className={`inline-block px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
							job.status,
						)}`}
					>
						{job.status.toUpperCase()}
					</span>
				</div>
			</div>

			<div className="space-y-2 mb-3 sm:mb-4">
				<div className="flex items-center gap-2 text-xs sm:text-sm text-purple-700">
					<svg
						className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
					<span className="truncate">{t("worker.jobs.service")}: {job.service || "Moving"}</span>
				</div>

				{job.address && (
					<div className="flex items-center gap-2 text-xs sm:text-sm text-purple-700">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
						</svg>
						<span className="truncate">{job.address}</span>
					</div>
				)}

				{job.date && (
					<div className="flex items-center gap-2 text-xs sm:text-sm text-purple-700">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						<span>{job.date}</span>
					</div>
				)}
			</div>

			<div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-100 flex justify-end">
				<button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all">
					{t("worker.jobs.viewDetails")}
				</button>
			</div>
		</div>
	);
};

export default function WorkerJobsList({ jobs, onViewJob }) {
	const { t } = useTranslation();
	if (jobs.length === 0) {
		return (
			<div className="bg-white border border-purple-200/40 rounded-xl p-8 sm:p-12 text-center">
				<div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
					<svg
						className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
				<h3 className="text-lg sm:text-xl font-semibold text-purple-900 mb-1 sm:mb-2">
					{t("worker.jobs.noJobsYet")}
				</h3>
				<p className="text-sm sm:text-base text-purple-700/70">
					{t("worker.jobs.noJobsAssigned")}
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
			{jobs.map((job) => (
				<JobCard key={job.id} job={job} onViewJob={onViewJob} />
			))}
		</div>
	);
}

