import type { Metadata, Viewport } from "next";
import { Roboto, Lato, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NewProvider from "@/components/providers/NewProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
        className={`${roboto.variable} ${lato.variable} ${inter.variable} ${plusJakarta.variable} antialiased`}
      >
        <NewProvider>
          {children}
        </NewProvider>
      </body>
    </html>
  );
}
