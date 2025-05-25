export function getWeekendDates(referenceDate = new Date()) {
  const day = referenceDate.getDay(); // 0 (Sun) to 6 (Sat)
  const date = referenceDate.getDate();

  // Clone the reference date
  const prevSaturday = new Date(referenceDate);
  const prevSunday = new Date(referenceDate);
  const nextSaturday = new Date(referenceDate);

  // Set previous Saturday (last weekend's start)
  const daysSinceSaturday = (day + 1) % 7 + 1; // from Mon=1 to Sat=6
  prevSaturday.setDate(date - daysSinceSaturday);
  
  // Set previous Sunday (last weekend's end)
  prevSunday.setDate(prevSaturday.getDate() + 1);

  // Set next Saturday (next weekend's start)
  const daysUntilNextSaturday = (6 - day + 7) % 7;
  nextSaturday.setDate(date + daysUntilNextSaturday);

  return {
    previousWeekendStart: prevSaturday.toDateString(),

    nextWeekendStart: nextSaturday.toDateString(),
  };
}


