import type { Metadata } from "next";
import { title, description, logo } from "./common";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: title,
  description: description,
  icons: [logo, "/favicon.ico"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Header></Header>
        {children}
      </body>
    </html>
  );
}
