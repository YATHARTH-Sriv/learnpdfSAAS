import type { Metadata } from "next";
import { EdgeStoreProvider } from '../lib/edgestore';
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs'
import Providers from "./helpers/Provider";
// import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LearnPDF"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
      <EdgeStoreProvider>
    <html lang='en'>
      <body>
        {children}
      </body>
      {/* <Toaster/> */}
    </html>
    </EdgeStoreProvider>
    </Providers>
  </ClerkProvider>
  );
}
