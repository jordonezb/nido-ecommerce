import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nido - Experiencia de Regalos Interactivos en Tiempo Real',
  description:
    'Cápsula Anti-Devoluciones, Co-Regalo y Unboxing Interactivo en Vivo con Nido Live Gift',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
