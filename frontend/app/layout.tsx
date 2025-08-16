export const metadata = { title: 'DSP Flex – Kanban', description: 'Task Assignments v1' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}