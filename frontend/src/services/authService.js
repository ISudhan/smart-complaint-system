const API_URL = "http://localhost:5000/api/auth";

export const authService = {
  async adminLogin(email, password) {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || "Login failed" };
    }

    // Store JWT and user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userRole", "admin");

    return { success: true, user: data.user };
  },

  async staffLogin(email, password) {
    const res = await fetch(`${API_URL}/staff/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || "Login failed" };
    }

    // Store JWT and user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userRole", "staff");

    return { success: true, user: data.user };
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUserRole() {
    return localStorage.getItem("userRole");
  },

  async getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Legacy support for admin
  async getCurrentAdmin() {
    const role = this.getUserRole();
    if (role === "admin") {
      return this.getCurrentUser();
    }
    return null;
  },
};
