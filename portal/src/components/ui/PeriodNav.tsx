interface PeriodNavProps {
  periodo: string;
}

export function PeriodNav({ periodo }: PeriodNavProps) {
  const d = new Date(periodo);
  const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10);
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().slice(0, 10);
  return (
    <>
      <a href={`?periodo=${prev}`} className="btn-secondary text-sm">← Anterior</a>
      <a href={`?periodo=${next}`} className="btn-secondary text-sm">Siguiente →</a>
    </>
  );
}
