/*
    AuthProvider abstracts and manages the authentication logic for the application.
    It provides all the functionalities that deal with authentication like sign-in, sign-out,
    and making authorized API requests.
*/
import type { User } from "../lib/types";
import {
  useContext,
  createContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import ky from "ky";

/* ---------------------------------------------------------------------------------------- */

const url = new URL(window.location.origin);
url.port = "5081";
export const baseURL = url.origin;

/* ---------------------------------------------------------------------------------------- */

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  tokenExpiry: number | null;
};

export type AuthContextType = {
  authState: AuthState;
  authorizedAPI: typeof ky;
  signIn: (userData: Record<string, any>) => Promise<AuthState>;
  signOut: (userID: number | string | undefined) => Promise<void>;
};

const initialAuthState: string = JSON.stringify({
  isAuthenticated: false,
  user: null,
  token: null,
  tokenExpiry: null,
});

const AuthContext = createContext<AuthContextType | null>(null);

/* ---------------------------------------------------------------------------------------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(
    JSON.parse(localStorage.getItem("auth") ?? initialAuthState)
  );

  /*    
  Every component in React is functional in nature, meaning that they are stateless
  and are re-initialized on every render. To maintain state across renders, we use hooks 
  like useState, useMemo or useCallback.

  Authorized API instance abstracts the logic of making authenticated API requests.

  It automatically attaches the authentication token to each request and handles token
  refresh when a 401 Unauthorized response is received. It also updates the authentication
  state if a new token is received in the response.
  */
  const authorizedAPI = useMemo(
    () =>
      ky.extend({
        prefixUrl: baseURL,
        hooks: {
          beforeRequest: [
            (request) => {
              const authState: AuthState = JSON.parse(
                localStorage.getItem("auth") ?? ""
              );

              if (authState.token) {
                request.headers.set(
                  "Authorization",
                  `Bearer ${authState.token}`
                );
              }
            },
          ],
          beforeError: [
            async (error) => {
              const authState: AuthState = JSON.parse(
                localStorage.getItem("auth") ?? ""
              );

              if (error.response?.status === 401) {
                const response = await ky.post(
                  `${baseURL}/api/users/${authState.user?.userID}/token/refresh`
                );

                if (!response.ok) {
                  await signOut(authState.user?.userID);
                }

                const data = (await response.json()) as Omit<
                  AuthState,
                  "isAuthenticated"
                >;

                const newAuthState = { isAuthenticated: true, ...data };
                setAuthState(newAuthState);
                localStorage.setItem("auth", JSON.stringify(newAuthState));
              }
              return error;
            },
          ],
        },
        retry: {
          limit: 1,
        },
      }),
    []
  );

  const signIn = useCallback(
    async (userData: Record<string, any>): Promise<AuthState> => {
      const response: Omit<AuthState, "isAuthenticated"> = await ky
        .post(`${baseURL}/api/users/login`, { json: userData })
        .json();

      const newAuthState: AuthState = { isAuthenticated: true, ...response };
      setAuthState(newAuthState);
      localStorage.setItem("auth", JSON.stringify(newAuthState));

      return newAuthState;
    },
    [setAuthState]
  );

  const signOut = useCallback(
    async (userID: number | string | undefined): Promise<void> => {
      await ky.post(`${baseURL}/api/users/${userID}/logout`);

      const newAuthState = JSON.parse(initialAuthState) as AuthState;
      setAuthState(newAuthState);
      localStorage.setItem("auth", JSON.stringify(newAuthState));
    },
    [setAuthState]
  );

  return (
    <AuthContext.Provider value={{ authState, authorizedAPI, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
