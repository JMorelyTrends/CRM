import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import ClientLayout from "./Components/Main containers/ClientLayout"; 
import StoreProvider from "./StoreProvider";
import { Toaster } from "sonner"

const geistSans = Geist({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "CRM",
  description: "Morley Trend CRM.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.className} ${geistMono.className} ${roboto.className}`}>
      <body>
        <StoreProvider>
        <ClientLayout>{children}
        <Toaster position="top-center" richColors /> {/* You can customize position, colors */}
        </ClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
