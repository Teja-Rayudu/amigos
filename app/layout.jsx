import { Inter } from "next/font/google";
import "./globals.css";

//components
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AMIGOS",
  description: "Connect, Share & Stay Protected with Deep Shield",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
