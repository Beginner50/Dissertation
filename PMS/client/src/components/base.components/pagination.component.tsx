import { Stack } from "@mui/material";
import { Pagination as MuiPagination } from "@mui/material";

export default function Pagination({
  totalCount,
  limit,
  offset,
  onPageChange,
}: {
  totalCount: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
}) {
  const pageCount = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handleChange = (_: any, value: number) => {
    const newOffset = (value - 1) * limit;
    onPageChange(newOffset);
  };

  if (pageCount <= 1) return null;

  return (
    <Stack direction="row" justifyContent="center" sx={{ mt: "auto", mb: 0.2 }}>
      <MuiPagination
        count={pageCount}
        page={currentPage}
        onChange={handleChange}
        color="primary"
        variant="outlined"
        shape="rounded"
        size="medium"
      />
    </Stack>
  );
}
