# DSP Flex – Kanban API (Prototype)

Minimal Node + Express TypeScript API (in-memory) for the Trello-style board.

## Dev
```bash
npm i
npm run dev
```

## Endpoints
- `GET /boards/default`
- `POST /tasks`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/move`
- `DELETE /tasks/:id`