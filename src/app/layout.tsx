import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { TopBarComponent } from "./top-bar";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Onyx",
  description: "Web3 portfolio showcase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-900 text-foreground">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TopBarComponent />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
