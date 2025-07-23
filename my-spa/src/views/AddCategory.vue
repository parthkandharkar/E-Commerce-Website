<template>
  <div class="form-container">
    <h2>Category Management</h2>

    <!-- Category Dropdown -->
    <label>Select Existing Category</label>
    <select v-model="selectedCategoryId" @change="loadSubcategories">
      <option value="">-- Select a Category --</option>
      <option v-for="cat in categories" :key="cat._id" :value="cat._id">
        {{ cat.name }}
      </option>
    </select>

    <!-- Subcategory List with Delete Buttons -->
    <div v-if="selectedCategorySubcategories.length">
      <label>Subcategories</label>
      <ul>
        <li
          v-for="sub in selectedCategorySubcategories"
          :key="sub"
          style="display: flex; justify-content: space-between; align-items: center;"
        >
          {{ sub }}
          <button
            v-if="isAdmin"
            @click="deleteSubcategory(sub)"
            style="background: crimson; color: white; border: none; padding: 2px 8px; cursor: pointer;"
          >
            X
          </button>
        </li>
      </ul>
    </div>

    <hr />

    <!-- Add Category Section -->
    <label>New Category Name</label>
    <input type="text" v-model="name" placeholder="e.g., Electronics" />
    <button @click="addCategory">Add Category</button>

    <hr />

    <!-- Add Subcategory Section -->
    <label>New Subcategory Name</label>
    <input type="text" v-model="newSubcategory" placeholder="e.g., Smartphones" />
    <button @click="addSubcategory" :disabled="!selectedCategoryId">Add Subcategory</button>

    <p>{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddCategory',
  data() {
    return {
      categories: [],
      selectedCategoryId: '',
      selectedCategorySubcategories: [],
      name: '',
      newSubcategory: '',
      message: '',
      isAdmin: false
    };
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    this.isAdmin = user?.role === "admin";
    await this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.message = "Unauthorized. Please log in.";
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/auth/categories", {
          headers: { Authorization: token }
        });
        this.categories = res.data;
      } catch (err) {
        this.message = "Error fetching categories.";
      }
    },

    loadSubcategories() {
      const category = this.categories.find(c => c._id === this.selectedCategoryId);
      this.selectedCategorySubcategories = category ? category.subcategories : [];
    },

    async addCategory() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.message = "Unauthorized.";
        return;
      }

      if (!this.name.trim()) {
        this.message = "Category name is required.";
        return;
      }

      try {
        const res = await axios.post("http://localhost:5000/api/auth/categories", {
          name: this.name.trim(),
          subcategories: []
        }, {
          headers: { Authorization: token }
        });

        this.message = res.data.message;
        this.name = '';
        await this.fetchCategories();
      } catch (err) {
        this.message = err.response?.data?.message || "Error adding category.";
      }
    },

    async addSubcategory() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.message = "Unauthorized.";
        return;
      }

      if (!this.selectedCategoryId || !this.newSubcategory.trim()) {
        this.message = "Select a category and enter a subcategory name.";
        return;
      }

      const category = this.categories.find(c => c._id === this.selectedCategoryId);
      if (!category) {
        this.message = "Invalid category.";
        return;
      }

      const updatedSubcategories = [...category.subcategories, this.newSubcategory.trim()];

      try {
        const res = await axios.put(`http://localhost:5000/api/auth/categories/${this.selectedCategoryId}`, {
          name: category.name,
          subcategories: updatedSubcategories
        }, {
          headers: { Authorization: token }
        });

        this.message = "Subcategory added successfully.";
        this.newSubcategory = '';
        await this.fetchCategories();
        this.loadSubcategories();
      } catch (err) {
        this.message = err.response?.data?.message || "Error adding subcategory.";
      }
    },

    async deleteSubcategory(sub) {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.delete(`http://localhost:5000/api/auth/categories/${this.selectedCategoryId}/subcategory`, {
          headers: { Authorization: token },
          data: { subcategory: sub }
        });

        this.message = res.data.message;
        await this.fetchCategories();
        this.loadSubcategories();
      } catch (err) {
        this.message = err.response?.data?.message || "Error deleting subcategory.";
      }
    }
  }
};
</script>

<style scoped>
.form-container {
  width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  background: #f8f8f8;
  border-radius: 8px;
}
input, select {
  display: block;
  width: 100%;
  margin: 0.5rem 0 1rem 0;
  padding: 0.5rem;
  font-size: 1rem;
}
button {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background: #999;
  cursor: not-allowed;
}
p {
  margin-top: 1rem;
  color: #333;
}
</style>
