export const displayISODate = (ISODate: string) => {
  const date = new Date(ISODate);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
