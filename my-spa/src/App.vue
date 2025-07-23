<template>
  <div>
    <header v-if="showNavbar" class="navbar">
      <div class="navbar-content">
        <h1 class="brand">My E-Commerce</h1>
        <div class="nav-links">
          <router-link to="/dashboard" class="nav-btn">Home</router-link>
          <router-link to="/profile" class="nav-btn">Profile</router-link>
          <router-link to="/cart" class="nav-btn">Cart</router-link>

          <template v-if="isAdmin">
            <router-link to="/addcategory" class="nav-btn">Add Category</router-link>
            <router-link to="/addproduct" class="nav-btn">Add Product</router-link>
            <router-link to="/manageusers" class="nav-btn">Manage Users</router-link>
          </template>

          <button @click="logout" class="nav-btn">Logout</button>
        </div>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: "App",
  computed: {
    showNavbar() {
      const hiddenOn = ["/login", "/signup"];
      return !hiddenOn.includes(this.$route.path);
    },
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.role === "admin";
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
.navbar {
  background-color: #333;
  padding: 12px 24px;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-btn {
  color: #fff;
  background-color: #555;
  border: none;
  padding: 6px 12px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.nav-btn:hover {
  background-color: #666;
}

.nav-btn.router-link-active {
  background-color: #777;
}
</style>
