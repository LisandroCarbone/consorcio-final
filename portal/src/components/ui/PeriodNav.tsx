interface PeriodNavProps {
  periodo: string;
}

export function PeriodNav({ periodo }: PeriodNavProps) {
  // Parse YYYY-MM-DD manually
  const parts = (periodo || "").split("-");
  const year = parseInt(parts[0], 10) || new Date().getFullYear();
  const month = parseInt(parts[1], 10) || (new Date().getMonth() + 1); // 1-indexed

  // Prev month:
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // Next month:
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth === 13) {
    nextMonth = 1;
    nextYear += 1;
  }

  const prev = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
  const next = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return (
    <>
      <a href={`?periodo=${prev}`} className="btn-secondary text-sm">← Anterior</a>
      <a href={`?periodo=${next}`} className="btn-secondary text-sm">Siguiente →</a>
    </>
  );
}

