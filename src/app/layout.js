import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import LanguageInitializer from "@/components/LanguageInitializer";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata = {
	title: "Modern Dashboard - Admin Panel",
	description:
		"A beautiful, modern dashboard built with Next.js and Tailwind CSS",
	keywords: "dashboard, admin, modern, ui, ux, nextjs, tailwind",
};

export default function RootLayout({ children }) {
	return (
		<html 
			lang="en" 
			className={inter.variable}
			suppressHydrationWarning
		>
			<body className="font-sans antialiased bg-gray-50" suppressHydrationWarning>
				<ReduxProvider>
					<ToastProvider>
						<LanguageInitializer>
							<LayoutWrapper>{children}</LayoutWrapper>
						</LanguageInitializer>
					</ToastProvider>
				</ReduxProvider>
			</body>
		</html>
	);
}
