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
  title: "Peoplely",
  description: "Peoplely is a CRM software for your business.",
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
      <head>
        <link rel="preconnect" href="http://localhost:8000" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (window.location.pathname === '/' || window.location.pathname.startsWith('/blog') || window.location.pathname.startsWith('/about') || window.location.pathname.startsWith('/careers')) {
                    return;
                  }
                  const darkMode = localStorage.getItem('darkMode');
                  if (darkMode === 'true') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
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
