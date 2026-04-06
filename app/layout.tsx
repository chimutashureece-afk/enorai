import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solace Companion",
  description: "A therapy-inspired mental health support chatbot with clear safety boundaries."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
