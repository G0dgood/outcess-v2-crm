import type { Metadata, Viewport } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import NewProvider from "@/components/providers/NewProvider";
import BucketNotificationHandler from "@/components/BucketNotificationHandler";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Outcess CRM",
  description: "Outcess is a CRM software for your business.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${workSans.variable} antialiased`}
      >
        <NewProvider>
          <BucketNotificationHandler />
          {children}
        </NewProvider>
      </body>
    </html>
  );
}
