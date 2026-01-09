import { useState } from "react";
import { Container, Typography, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../providers/auth.provider";
import type { User, UserFormData } from "../../lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserTable from "../../components/user.components/user-table.component";
import UserModal from "../../components/user.components/user-modal.component";
import type { ModalState as UserModalState } from "../../components/user.components/user-modal.component";

export default function DashboardUsersRoute() {
  const { authorizedAPI } = useAuth();

  const [userModalState, setUserModalState] = useState<UserModalState>({
    mode: "create",
    open: false,
  });
  const [userModalData, setUserModalData] = useState<UserFormData>({
    userID: 0,
    name: "",
    email: "",
    role: "",
  });

  const [page, setPage] = useState(0);

  /* ---------------------------------------------------------------------------------- */

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      method,
      url,
      data,
    }: {
      method: string;
      url: string;
      data?: any;
      invalidateQueryKeys: any[][];
    }) => await authorizedAPI(url, { method, json: data }),
    onSuccess: (_data, variables) =>
      variables.invalidateQueryKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      ),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => await authorizedAPI.get(`api/users`).json(),
    retry: 1,
  });

  /* ---------------------------------------------------------------------------------- */

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleAddUserClick = () => {
    setUserModalData({ userID: 0, name: "", email: "", role: "" });
    setUserModalState({ mode: "create", open: true });
  };

  const handleCancelClick = () => {
    setUserModalState({ ...userModalState, open: false });
  };

  const handleDeleteUserClick = (userFormData: UserFormData) => {
    setUserModalData(userFormData);
    setUserModalState({ mode: "delete", open: true });
  };

  /* ---------------------------------------------------------------------------------- */

  const handleNameChange = (name: string) => {
    setUserModalData({ ...userModalData, name });
  };

  const handleEmailChange = (email: string) => {
    setUserModalData({ ...userModalData, email });
  };

  const handleRoleChange = (role: string) => {
    setUserModalData({ ...userModalData, role });
  };

  /* ---------------------------------------------------------------------------------- */

  const handleCreateUser = () => {
    setUserModalState({ ...userModalState, open: false });
  };

  const handleDeleteUser = () => {
    setUserModalState({ ...userModalState, open: false });
  };

  /* ---------------------------------------------------------------------------------- */

  const offset = page * 10;
  const limit = 10;
  const displayedUsers = users?.slice(offset, offset + limit);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Table Actions */}
        <Stack spacing={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="700">
              Users
            </Typography>
            <Button
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
              sx={{ textTransform: "none", borderRadius: "8px" }}
              onClick={handleAddUserClick}>
              Add User
            </Button>
          </Stack>

          {/* Users */}
          <UserTable
            users={displayedUsers ?? []}
            isLoading={usersLoading}
            totalCount={users?.length ?? 0}
            page={page}
            onPageChange={handlePageChange}
            handleDeleteUserClick={handleDeleteUserClick}
          />
        </Stack>
      </Container>

      <UserModal open={userModalState.open}>
        <UserModal.Header mode={userModalState.mode} />
        <UserModal.Fields>
          {userModalState.mode === "create" ? (
            <>
              <UserModal.Name
                name={userModalData.name}
                handleNameChange={handleNameChange}
              />
              <UserModal.Email
                email={userModalData.email}
                handleEmailChange={handleEmailChange}
              />
              <UserModal.Role
                role={userModalData.role}
                handleRoleChange={handleRoleChange}
              />
            </>
          ) : (
            <UserModal.DeleteWarning userName={userModalData.name} />
          )}
        </UserModal.Fields>
        <UserModal.Actions
          mode={userModalState.mode}
          isValid={
            userModalState.mode === "delete"
              ? true
              : !!(userModalData.name && userModalData.email)
          }
          handleCancelClick={handleCancelClick}
          handleCreateUser={handleCreateUser}
          handleDeleteUser={handleDeleteUser}
        />
      </UserModal>
    </>
  );
}
