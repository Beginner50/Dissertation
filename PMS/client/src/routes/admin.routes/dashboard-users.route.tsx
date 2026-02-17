import { useState } from "react";
import { Container, Typography, Button, Stack, Box, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../providers/auth.provider";
import type { User, UserFormData } from "../../lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserTable from "../../components/user.components/user-table.component";
import UserModal from "../../components/user.components/user-modal.component";
import type { ModalState as UserModalState } from "../../components/user.components/user-modal.component";
import { theme } from "../../lib/theme";
import TableLayout from "../../components/base.components/table-layout.component";

export default function DashboardUsersRoute() {
  const { authorizedAPI } = useAuth();

  const [userLimit, setUserLimit] = useState(6);
  const [userOffset, setUserOffset] = useState(0);

  const [userModalState, setUserModalState] = useState<UserModalState>({
    mode: "create",
    open: false,
  });
  const [userModalData, setUserModalData] = useState<UserFormData>({
    userID: 0,
    name: "",
    email: "",
    password: "",
    role: "student",
  });

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
        queryClient.invalidateQueries({ queryKey: key }),
      ),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => await authorizedAPI.get(`api/users`).json(),
    retry: 1,
  });

  /* ---------------------------------------------------------------------------------- */

  const handlePageChange = (newOffset: number) => {
    setUserOffset(newOffset);
  };

  const handleAddUserClick = () => {
    setUserModalData({ userID: 0, name: "", email: "", password: "", role: "student" });
    setUserModalState({ mode: "create", open: true });
  };

  const handleCancelClick = () => {
    setUserModalState({ ...userModalState, open: false });
  };

  const handleEditUserClick = (selectedUser: User) => {
    setUserModalData({ ...selectedUser, password: "" });
    setUserModalState({ mode: "edit", open: true });
  };

  const handleDeleteUserClick = (selectedUser: User) => {
    setUserModalData({ ...selectedUser, password: "" });
    setUserModalState({ mode: "delete", open: true });
  };

  /* ---------------------------------------------------------------------------------- */

  const handleNameChange = (name: string) => {
    setUserModalData({ ...userModalData, name });
  };

  const handleEmailChange = (email: string) => {
    setUserModalData({ ...userModalData, email });
  };

  const handlePasswordChange = (password: string) => {
    setUserModalData({ ...userModalData, password });
  };

  const handleRoleChange = (role: User["role"]) => {
    setUserModalData({ ...userModalData, role });
  };

  /* ---------------------------------------------------------------------------------- */

  const handleCreateUser = () => {
    mutation.mutate(
      {
        method: "post",
        url: `api/users`,
        data: userModalData,
        invalidateQueryKeys: [["users"]],
      },
      {
        onSettled: () => setUserModalState({ ...userModalState, open: false }),
      },
    );
  };

  const handleEditUser = () => {
    mutation.mutate(
      {
        method: "put",
        url: `api/users/${userModalData.userID}`,
        data: userModalData,
        invalidateQueryKeys: [["users"]],
      },
      {
        onSettled: () => setUserModalState({ ...userModalState, open: false }),
      },
    );
  };

  const handleDeleteUser = () => {
    mutation.mutate(
      {
        method: "delete",
        url: `api/users/${userModalData.userID}`,
        data: {},
        invalidateQueryKeys: [["users"]],
      },
      {
        onSettled: () => setUserModalState({ ...userModalState, open: false }),
      },
    );
  };

  /* ---------------------------------------------------------------------------------- */

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: "12px",
          border: `1px solid ${theme.borderSoft}`,
          bgcolor: "white",
        }}>
        <TableLayout>
          <TableLayout.Header title="Users">
            <TableLayout.AddButton text={"Add User"} onClick={handleAddUserClick} />
          </TableLayout.Header>

          <TableLayout.Content>
            <UserTable
              users={users ?? []}
              isLoading={usersLoading}
              totalCount={users?.length ?? 0}
              limit={userLimit}
              offset={userOffset}
              onPageChange={handlePageChange}
              handleEditUserClick={handleEditUserClick}
              handleDeleteUserClick={handleDeleteUserClick}
            />
          </TableLayout.Content>
        </TableLayout>
      </Paper>

      <UserModal open={userModalState.open}>
        <UserModal.Header mode={userModalState.mode} />
        {userModalState.mode != "delete" ? (
          <UserModal.Fields>
            {userModalState.mode == "edit" && (
              <UserModal.UserID userID={userModalData.userID} />
            )}
            <UserModal.Name
              name={userModalData.name}
              handleNameChange={handleNameChange}
            />
            <UserModal.Email
              email={userModalData.email}
              handleEmailChange={handleEmailChange}
            />
            {userModalState.mode == "create" && (
              <UserModal.Password
                password={userModalData.password}
                handlePasswordChange={handlePasswordChange}
              />
            )}
            <UserModal.Role
              role={userModalData.role}
              handleRoleChange={handleRoleChange}
            />
          </UserModal.Fields>
        ) : (
          <UserModal.DeleteWarning />
        )}
        <UserModal.Actions
          mode={userModalState.mode}
          isValid={!!(userModalData.name && userModalData.email)}
          handleCancelClick={handleCancelClick}
          handleCreateUser={handleCreateUser}
          handleEditUser={handleEditUser}
          handleDeleteUser={handleDeleteUser}
        />
      </UserModal>
    </>
  );
}
