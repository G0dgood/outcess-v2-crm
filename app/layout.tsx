import type { Metadata } from "next";
import { Roboto, Lato, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PrivilegeProvider } from "@/contexts/PrivilegeContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { NavigationProvider } from "@/components/providers/NavigationProvider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
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
        <ReduxProvider>
          <ThemeProvider>
            <AuthProvider>
              <PrivilegeProvider>
                <SocketProvider config={{ autoConnect: false }}>
                  <NavigationProvider>
                    {children}
                    <Toaster
                      position="top-right"
                      richColors
                      closeButton
                      toastOptions={{
                        style: { borderRadius: 0 }
                      }}
                    />
                  </NavigationProvider>
                </SocketProvider>
              </PrivilegeProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
