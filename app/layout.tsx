import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";

const wordSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "DesignX",
  description: "A Simple and Efficient Design tool with collaborative feature",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"${wordSans.className} bg-primary-grey-200"}>
        <Room>
        {children}
        </Room>
      </body>
    </html>
  );
}
