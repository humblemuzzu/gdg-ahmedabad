import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/context/theme-context";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Bureaucracy Breaker",
  description: "Your government process GPS. Cut through red tape with AI-powered guidance.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

// Script to prevent theme flash on page load
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('bb-theme');
    var root = document.documentElement;
    
    // Apply dark class for dark themes or default
    if (!theme || theme === 'default' || theme === 'slate') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch (e) {
    // Default to dark if localStorage is not available
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
