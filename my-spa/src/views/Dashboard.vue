<template>
  <div class="dashboard">
    <h2>Welcome, {{ user.firstName }} {{ user.lastName }}</h2>

    <div class="category-section">
      <h3>Shop by Category</h3>
      <ul>
        <li v-for="category in categories" :key="category._id">
          <router-link
            :to="`/category/${encodeURIComponent(category.name)}`"
            class="category-link"
          >
            <strong>{{ category.name }}</strong>
          </router-link>

          <!-- Admin controls -->
          <div v-if="user.role === 'admin'" class="admin-buttons">
            <button @click="editCategory(category)">Edit</button>
            <button @click="deleteCategory(category._id)">Delete</button>
          </div>
        </li>
      </ul>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DashboardView",
  data() {
    return {
      user: {},
      categories: [],
      message: "",
    };
  },
  mounted() {
    const token = localStorage.getItem("token");
    if (!token) {
      return this.$router.push("/login");
    }

    // Set user from localStorage
    this.user = JSON.parse(localStorage.getItem("user") || "{}");

    // Fetch categories
    axios
      .get("http://localhost:5000/api/auth/categories", {
        headers: { Authorization: token },
      })
      .then((res) => {
        this.categories = res.data;
      })
      .catch((err) => {
        console.error("Error fetching categories", err);
      });
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
    editCategory(category) {
      this.$router.push(`/addcategory/${category._id}`);
    },
    async deleteCategory(id) {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.delete(
          `http://localhost:5000/api/auth/categories/${id}`,
          {
            headers: { Authorization: token },
          }
        );
        this.message = res.data.message || "Category deleted";
        this.categories = this.categories.filter((c) => c._id !== id);
      } catch (err) {
        this.message =
          err.response?.data?.message || "Error deleting category";
      }
    },
  },
};
</script>

<style scoped>
.dashboard {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.category-section h3 {
  margin-bottom: 1rem;
  color: #42b983;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #fff;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

li:hover {
  background-color: #e6f7f1;
}

.category-link {
  text-decoration: none;
  color: inherit;
}

.admin-buttons {
  margin-top: 0.5rem;
}

.admin-buttons button {
  margin-right: 10px;
  background: #42b983;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.message {
  margin-top: 1rem;
  color: crimson;
}
</style>
