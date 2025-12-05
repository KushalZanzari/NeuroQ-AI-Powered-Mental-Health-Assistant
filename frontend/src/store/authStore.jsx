import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ---------------------
      // LOGIN (JSON FIXED)
      // ---------------------
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/login", {
            email: email,
            password: password,
          });

          const { access_token } = response.data;

          // Fetch user details
          const userResponse = await api.get("/auth/me", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          set({
            user: {
            id: userResponse.data.id,
            email: userResponse.data.email,
            full_name: userResponse.data.full_name,
            username: userResponse.data.username,
          },
          token: access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          });


          // Set axios default header
          api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.detail || "Login failed";

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      // ---------------------
      // SIGNUP (REGISTER)
      // ---------------------
      signup: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/register", userData);

          set({
            isLoading: false,
            error: null,
          });

          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.detail || "Signup failed";

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      // ---------------------
      // LOGOUT
      // ---------------------
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });

        delete api.defaults.headers.common["Authorization"];
      },

      // ---------------------
      // UPDATE USER
      // ---------------------
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // ---------------------
      // INITIALIZE AUTH
      // ---------------------
      initializeAuth: async () => {
        const { token } = get();

        if (token) {
          set({ isLoading: true });

          try {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const response = await api.get("/auth/me");

            set({
              user: {
               id: response.data.id,
               email: response.data.email,
               full_name: response.data.full_name,
               username: response.data.username,
              },
              isAuthenticated: true,
              isLoading: false,
            });

          } catch (error) {
            get().logout();
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
export { useAuthStore };
