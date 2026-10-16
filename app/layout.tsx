import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://dionsburgershop.vercel.app"),
  title: "Sua sorte tá na mesa! | Dion’s",
  description:
    "Sua sorte tá na mesa! Conheça a roleta da Dion’s Burger Shop. Em breve.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Dion’s Burger Shop",
    title: "Sua sorte tá na mesa! | Dion’s",
    description: "Sua sorte tá na mesa! Conheça a roleta da Dion’s Burger Shop.",
    images: [{ url: "/brand/share-cover.jpg", width: 1200, height: 675, alt: "Dion’s Burger Shop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sua sorte tá na mesa! | Dion’s",
    description: "Sua sorte tá na mesa! Conheça a roleta da Dion’s Burger Shop.",
    images: ["/brand/share-cover.jpg"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
