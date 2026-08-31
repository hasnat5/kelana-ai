import type { Metadata } from "next";
import { Caveat, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KelanaAI",
  description: "Plan your next adventure",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-body antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
