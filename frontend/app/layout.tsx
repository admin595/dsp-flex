import './globals.css';

export const metadata = {
  title: 'DSP Flex',
  description: 'Kanban Task Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
