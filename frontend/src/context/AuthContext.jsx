
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../services/api";
import {
  connectSocket,
  disconnectSocket,
} from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const [loading, setLoading] = useState(true);

  // Connect Socket when authenticated
  useEffect(() => {
    if (token) {
      connectSocket(token);
    }

    setLoading(false);

    return () => {
      disconnectSocket();
    };
  }, [token]);

  // Save authentication data
  const saveAuth = (userData, authToken) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setToken(authToken);
  };

  // Login
  const login = async (identifier, password) => {
    const response = await API.post("/auth/login", {
      identifier,
      password,
    });

    const { user: userData, token: authToken } = response.data;

    if (!userData || !authToken) {
      throw new Error("Invalid login response from server");
    }

    saveAuth(userData, authToken);

    return userData;
  };

  // Register
  const register = async (formData) => {
    const response = await API.post("/auth/register", formData);

    const { user: userData, token: authToken } = response.data;

    if (!userData || !authToken) {
      throw new Error("Invalid registration response from server");
    }

    saveAuth(userData, authToken);

    return userData;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    disconnectSocket();

    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Auth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
