/*
    AuthProvider abstracts and manages the authentication logic for the application.
    It provides all the functionalities that deal with authentication like sign-in, sign-out,
    and making authorized API requests.
*/
import type { User } from "../types";
import {
  useContext,
  createContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import ky from "ky";

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  tokenExpiry: number | null;
};

interface AuthUtils {
  authorizedAPI: typeof ky;
  signIn: (userData: Record<string, any>) => Promise<AuthState>;
  signOut: () => Promise<void>;
}

export type AuthContextType = {
  authState: AuthState;
} & AuthUtils;

const initialAuthState: string = JSON.stringify({
  isAuthenticated: false,
  user: null,
  token: null,
  tokenExpiry: null,
});

const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize authentication state from localStorage or default values.
  const [authState, setAuthState] = useState<AuthState>(
    JSON.parse(localStorage.getItem("auth") ?? initialAuthState)
  );

  /*  Every component in React is functional in nature, meaning that they are stateless
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
        prefixUrl: window.location.origin,
        hooks: {
          beforeRequest: [
            (request) => {
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
              // User is unauthenticated, try to refresh the token
              if (error.response?.status === 401) {
                // Attempt to refresh the token
                const response = await ky.post(
                  `${window.location.origin}/api/auth/refresh-token`
                );

                if (!response.ok) {
                  // Refresh token failed, sign out the user.
                  await signOut();
                }

                const data = await response.json<
                  Omit<AuthState, "isAuthenticated">
                >();

                const newAuthState = { isAuthenticated: true, ...data };
                setAuthState(newAuthState);
                localStorage.setItem("auth", JSON.stringify(newAuthState));
              }
              return error;
            },
          ],
          afterResponse: [
            async (_request, _options, response) => {
              const data = await response.json<any>().catch(() => null);

              // If the response contains a new token, update the auth state
              if (data?.token) {
                const newAuthState: AuthState = {
                  isAuthenticated: true,
                  user: data.user,
                  token: data.token,
                  tokenExpiry: data.tokenExpiry,
                };
                setAuthState(newAuthState);
                localStorage.setItem("auth", JSON.stringify(newAuthState));
              }

              return response;
            },
          ],
        },
        retry: {
          limit: 1,
        },
      }),
    [authState.token]
  );

  // Sign-in function will be re-rendered only when setAuthState changes
  // (only once during initialization if application is designed properly).
  const signIn = useCallback(
    async (userData: Record<string, any>): Promise<AuthState> => {
      const response: Omit<AuthState, "isAuthenticated"> = await ky
        .post(`${window.location.origin}/api/auth/signin`, { json: userData })
        .json();

      const newAuthState: AuthState = { isAuthenticated: true, ...response };
      setAuthState(newAuthState);
      localStorage.setItem("auth", JSON.stringify(newAuthState));

      return newAuthState;
    },
    [setAuthState]
  );

  // Sign-out function will be re-rendered only when setAuthState changes.
  const signOut = useCallback(async (): Promise<void> => {
    await ky.post(`${window.location.origin}/api/auth/signout`);

    const newAuthState = JSON.parse(initialAuthState) as AuthState;
    setAuthState(newAuthState);
    localStorage.setItem("auth", JSON.stringify(newAuthState));
  }, [setAuthState]);

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
