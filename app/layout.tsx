import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Sua sorte tá na mesa! | Dion’s", description: "Experimente a roleta da Dion’s Burger Shop. Demonstração visual, sem premiação real." };
export default function RootLayout({ children }: {children: React.ReactNode}) { return <html lang="pt-BR"><body>{children}</body></html>; }
