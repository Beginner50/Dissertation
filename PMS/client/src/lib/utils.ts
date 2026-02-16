// Returns YYYY-MM-DD in Local Time (Safe for <input type="date">)
export const toLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Returns HH:mm in Local Time (Safe for <input type="time">)
export const toLocalTimeString = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const mergeDateTime = (
  baseDate: Date,
  newValue: string,
  type: "date" | "time",
) => {
  const updated = new Date(baseDate);
  if (type === "date") {
    const [y, m, d] = newValue.split("-").map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d))
      throw Error("Year, Month and Day should be numeric!");

    updated.setFullYear(y, m - 1, d);
  } else {
    const [h, min] = newValue.split(":").map(Number);
    if (isNaN(h) || isNaN(min))
      throw Error("Hour and Min should be numeric!");

    updated.setHours(h, min, 0, 0);
  }
  return updated;
};
