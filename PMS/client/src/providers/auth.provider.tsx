/*
AuthProvider abstracts and manages the authentication logic for the application.

It provides all the functionalities that deal with authentication like sign-in, sign-out,
and making authorized API requests.
*/
import type { AuthContextType, AuthState } from "../lib/types";
import {
  useContext,
  createContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import ky from "ky";
import { baseURL } from "../lib/config";

/*
Refresh Token Request De-duplication:
  When a page load, multiple APIs are triggered, and if the token is invalid, each of them
  will try to refresh the token separately (see authorizedAPI below).

  These separate duplicate ongoing requests to the refresh endpoint will result in the
  server flagging this suspicious behavior as a security breach and invalidate the refresh
  token (stored as an HTTP-only cookie)

  As such, to prevent such race condition, using refreshPromise here ensure that only one
  request ends up trying to refresh the token, and lead to the other requests waiting for
  the result of the iniitial refresh token request instead.
*/
let refreshPromise: Promise<any> | null = null;
const performRefresh = async (): Promise<any> => {
  if (!refreshPromise) {
    refreshPromise = ky.post(`${baseURL}/api/token/refresh`, {
      credentials: "include"
    }).json();
  }

  try {
    const data = await refreshPromise;
    refreshPromise = null;
    return data;
  } catch (err) {
    refreshPromise = null;
    throw err;
  }
};

/* ---------------------------------------------------------------------------------------- */

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  let initialAuthState = JSON.parse(localStorage.getItem("auth") ?? "null") as AuthState | null;

  if (!initialAuthState) {
    initialAuthState = {
      isAuthenticated: false,
      token: null,
      tokenExpiry: null,
      user: null,
    };

    localStorage.setItem("auth", JSON.stringify(initialAuthState));
  }

  /*
    Every component in React is functional in nature, meaning that they are stateless
    and are re-initialized on every render. To maintain state across renders, we use hooks 
    like useState, useMemo or useCallback.

    useMemo and useCallback will be relevant in the sections below
  */
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  /*    
    Authorized API instance abstracts the logic of making authenticated API requests.

    It performs 2 tasks:
    1) Authentication:
        It automatically injects the authentication token in the Authorization header of the
        request.
      
    2) Token Refresh:
        It intercepts 401 unauthorized response and tries to refresh the token.

        Upon success, it will update the authentication state (memory + local storage) with
        the new token values.

        Upon failure, it will reset the authentication state (memory + local storage) to a
        default value. This will cause the layout component to re-render, which will
        subsequently redirect the user to the /sign-in route upon seeing isAuthenticated false
  */
  const authorizedAPI = useMemo(
    () =>
      ky.extend({
        prefixUrl: baseURL,
        credentials: "include",
        hooks: {
          beforeRequest: [
            (request) => {
              const authState: AuthState = JSON.parse(
                localStorage.getItem("auth") ?? "null"
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
              if (error.response?.status === 401) {
                try {
                  const data = await performRefresh();

                  const newAuth = { isAuthenticated: true, ...data };
                  setAuthState(newAuth);
                  localStorage.setItem("auth", JSON.stringify(newAuth));
                } catch (e) {
                  console.log("Token Refresh Failed! Logging User Out");
                  console.error(e);

                  const newAuth = {
                    isAuthenticated: false,
                    token: null,
                    tokenExpiry: null,
                    user: null,
                  };
                  setAuthState(newAuth);
                  localStorage.setItem("auth", JSON.stringify(newAuth));
                }
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
        .post(`${baseURL}/api/users/login`, {
          json: userData,
          credentials: "include",
        })
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
      await authorizedAPI.post(`api/users/${userID}/logout`);

      setAuthState(initialAuthState);
      localStorage.setItem("auth", JSON.stringify(initialAuthState));
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
