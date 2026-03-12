import { useContext, useState, type Dispatch, type SetStateAction } from "react";
import { Container, Typography, Button, Stack, Box, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../providers/auth.provider";
import type { DeliverableFile, OutletContext, User, UserFormData } from "../../lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserTable from "../../components/user.components/user-table.component";
import UserModal from "../../components/user.components/user-modal.component";
import type { ModalState as UserModalState } from "../../components/user.components/user-modal.component";
import { theme } from "../../lib/theme";
import base64js from "base64-js";
import TableLayout from "../../components/base.components/table-layout.component";
import { GlobalError } from "../../components/base.components/global-error.component";
import { useOutletContext } from "react-router";
import { extractErrorMessage } from "../../lib/utils";

export default function DashboardUsersRoute() {
  const { authorizedAPI } = useAuth();
  const { setErrorMessage } = useOutletContext<OutletContext>();

  const [userLimit, setUserLimit] = useState(5);
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
    queryKey: ["users", userLimit, userOffset],
    queryFn: async (): Promise<{ items: User[]; totalCount: number }> =>
      await authorizedAPI
        .get(`api/users`, {
          searchParams: {
            limit: userLimit,
            offset: userOffset,
          },
        })
        .json(),
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
        onSuccess: () => setUserModalState({ ...userModalState, open: false }),
        onError: async (err: any) => {
          const msg = await err?.response?.text();
          setErrorMessage(msg || "Failed to create user.");
          setUserModalState({ ...userModalState, open: false });
        },
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
        onSuccess: () => setUserModalState({ ...userModalState, open: false }),
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to update user details.");
          setUserModalState({ ...userModalState, open: false });
        },
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
        onSuccess: () => setUserModalState({ ...userModalState, open: false }),
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to delete user.");
          setUserModalState({ ...userModalState, open: false });
        },
      },
    );
  };

  const handleUserListIngest = async (file: File) => {
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const base64File = base64js.fromByteArray(fileBytes);

    const deliverableFile: DeliverableFile = {
      filename: file.name,
      file: base64File,
      contentType: file.type,
    };

    mutation.mutate(
      {
        method: "post",
        url: `api/users/ingest-list`,
        data: deliverableFile,
        invalidateQueryKeys: [["users"]],
      },
      {
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to ingest user list.");
        },
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
            <TableLayout.IngestButton
              text="Ingest User List"
              handleIngest={handleUserListIngest}
              requiredColumns={["Name", "Email", "Password", "Role"]}
              isPending={mutation.status == "pending"}
            />
          </TableLayout.Header>

          <TableLayout.Content>
            <UserTable
              users={users?.items?.sort((u1, u2) => u1.userID - u2.userID) ?? []}
              isLoading={usersLoading}
              totalCount={users?.totalCount ?? 0}
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
