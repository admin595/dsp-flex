import { BoardView } from '../components/kanban/Board';

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <BoardView />
      <div className="text-xs text-gray-500">Dev: API at http://localhost:4000 • set NEXT_PUBLIC_API_URL to change.</div>
    </main>
  )
}