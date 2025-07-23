<template>
  <div class="form-container">
    <h2>{{ isEditMode ? 'Edit Product' : 'Add Product' }}</h2>

    <form @submit.prevent="handleSubmit">
      <label>Product Name</label>
      <input v-model="form.name" required />

      <label>Category</label>
      <select v-model="form.category" @change="loadSubcategories" required>
        <option disabled value="">Select a category</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat.name">{{ cat.name }}</option>
      </select>

      <label>Subcategory</label>
      <select v-model="form.subcategory" required>
        <option disabled value="">Select subcategory</option>
        <option v-for="sub in subcategories" :key="sub" :value="sub">{{ sub }}</option>
      </select>

      <label>Price</label>
      <input type="number" v-model="form.price" required />

      <label>Quantity</label>
      <input type="number" v-model="form.quantity" required />

      <label>Details</label>
      <textarea v-model="form.details"></textarea>

      <label>Image</label>
      <input type="file" @change="handleImage" :required="!isEditMode" />

      <button type="submit">{{ isEditMode ? 'Update' : 'Add' }} Product</button>
      <p class="message">{{ message }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "AddProduct",
  data() {
    return {
      categories: [],
      subcategories: [],
      form: {
        name: '',
        category: '',
        subcategory: '',
        price: '',
        quantity: '',
        details: '',
        image: null
      },
      message: '',
      isEditMode: false,
      productId: null
    };
  },
  async mounted() {
    this.productId = this.$route.params.id || null;
    const token = localStorage.getItem('token');

    try {
      // Load categories first
      const res = await axios.get('http://localhost:5000/api/auth/categories', {
        headers: { Authorization: token }
      });
      this.categories = res.data;

      // If editing, load product AFTER categories
      if (this.productId) {
        this.isEditMode = true;
        const prod = await axios.get(`http://localhost:5000/api/auth/products/${this.productId}`, {
          headers: { Authorization: token }
        });

        this.form = {
          ...this.form,
          name: prod.data.name,
          category: prod.data.category,
          subcategory: prod.data.subcategory,
          price: prod.data.price,
          quantity: prod.data.quantity,
          details: prod.data.details,
          image: null // don't preload image
        };

        this.loadSubcategories();
      }
    } catch (err) {
      this.message = "Failed to load product or categories.";
    }
  },
  methods: {
    loadSubcategories() {
      const category = this.categories.find(c => c.name === this.form.category);
      this.subcategories = category ? category.subcategories : [];
    },
    handleImage(e) {
      this.form.image = e.target.files[0];
    },
    async handleSubmit() {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.entries(this.form).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value);
      });

      try {
        if (this.isEditMode) {
          await axios.put(`http://localhost:5000/api/auth/products/${this.productId}`, formData, {
            headers: { Authorization: token }
          });
          this.message = "Product updated successfully";
        } else {
          await axios.post("http://localhost:5000/api/auth/products", formData, {
            headers: { Authorization: token }
          });
          this.message = "Product added successfully";
        }

        this.$router.push("/dashboard");
      } catch (err) {
        this.message = err.response?.data?.message || "Failed to submit product";
      }
    }
  }
};
</script>

<style scoped>
.form-container {
  width: 500px;
  margin: 2rem auto;
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
}
input, select, textarea {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
}
button {
  padding: 0.6rem 1.2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.message {
  margin-top: 1rem;
  color: #555;
}
</style>
