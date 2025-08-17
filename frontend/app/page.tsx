
'use client'
import useSWR from 'swr'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const f = (u:string)=>fetch(u).then(r=>r.json())
export default function Page(){
  const {data, mutate} = useSWR(`${API}/boards/default`, f)
  const tasks = data?.tasks||[]
  async function add(){
    await fetch(`${API}/tasks`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'New Task'})})
    mutate()
  }
  return <main style={{padding:20}}>
    <h1>DSP Flex v2 (DB)</h1>
    <button onClick={add}>New Task</button>
    <pre>{JSON.stringify(data,null,2)}</pre>
  </main>
}
