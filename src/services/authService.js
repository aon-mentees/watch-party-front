const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const USE_LOCAL_STORAGE = true; 

// LOCAL STORAGE AUTH (For Testing)
const localStorageAuth = {
  // Sign Up with localStorage
  signUp: async (username, email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email already exists
    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
      throw new Error("Email already exists");
    }

    // Check if username already exists
    const usernameExists = users.some(user => user.username === username);
    if (usernameExists) {
      throw new Error("Username already exists");
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // In real app, this would be hashed on backend
      createdAt: new Date().toISOString(),
    };

    // Save user
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Create session token
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email }));
    
    // Save auth data
    const authData = {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    };
    
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(authData.user));

    return authData;
  },

  // Sign In with localStorage
  signIn: async (emailOrUsername, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Find user by email or username
    const user = users.find(
      u => (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Create session token
    const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
    
    // Save auth data
    const authData = {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
    
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(authData.user));

    return authData;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  },
};

// API AUTH (For Production)
const apiAuth = {
  // Sign Up with API
  signUp: async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Sign up failed");
    }

    const data = await response.json();
    
    // Save auth data
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    return data;
  },

  // Sign In with API
  signIn: async (emailOrUsername, password) => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        emailOrUsername, 
        password 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Sign in failed");
    }

    const data = await response.json();
    
    // Save auth data
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    return data;
  },

  // Logout with API
  logout: async () => {
    const token = localStorage.getItem("authToken");
    
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  },
};

const authService = USE_LOCAL_STORAGE ? localStorageAuth : apiAuth;

export default authService;