export const metadata = {
  title: 'Sistema de Canchas - Cliente',
  description: 'Reserva tu cancha fácilmente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}