import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { TourOverlay } from "@/lib/hooks/useTour";
import { NotificationContainer } from "@/components/NotificationContainer";

export const metadata: Metadata = {
  title: "ADHCO - Construction Management",
  description: "All-in-one construction management and invoicing platform",
  icons: {
    icon: "/favicon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
          <TourOverlay />
          <NotificationContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
