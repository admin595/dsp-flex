import { clsx } from 'clsx';

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return <button {...rest} className={clsx('px-3 py-2 rounded-lg border bg-white hover:bg-gray-100', className)} />;
}
export function Badge({ children, tone='slate'}: { children: React.ReactNode, tone?: 'slate'|'green'|'yellow'|'red'|'blue' }) {
  const map = {
    slate: 'bg-slate-100 text-slate-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
  } as const;
  return <span className={`text-xs px-2 py-0.5 rounded-full ${map[tone]}`}>{children}</span>;
}
export function Section({ title, children }: { title: string, children: React.ReactNode}) {
  return (
    <section className="bg-white border rounded-2xl p-4">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}