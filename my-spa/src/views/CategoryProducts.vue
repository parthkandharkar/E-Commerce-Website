<template>
  <div class="category-details">
    <h2>{{ category.name }}</h2>

    <div v-if="category.subcategories.length">
      <h3>Subcategories:</h3>
      <ul>
        <li
          v-for="sub in category.subcategories"
          :key="sub"
          class="clickable-sub"
          @click="fetchProductsBySubcategory(sub)"
        >
          {{ sub }}
        </li>
        <li class="clickable-sub reset" @click="fetchAllProducts">
          🔄 Show all products
        </li>
      </ul>
    </div>

    <div class="products">
      <h3>
        Products in {{ category.name }}
        <span v-if="activeSubcategory"> > {{ activeSubcategory }}</span>
      </h3>

      <ul v-if="products.length">
        <li v-for="product in products" :key="product._id" class="product-item">
          <div class="product-image" v-if="product.imageUrl">
            <img :src="`http://localhost:5000${product.imageUrl}`" :alt="product.name" />
          </div>

          <div class="product-info">
            <strong>{{ product.name }}</strong> — ₹{{ product.price }}
            <p>{{ product.details }}</p>
            <small>Subcategory: {{ product.subcategory }}</small><br />
            <small>Available: {{ product.quantity }}</small>

            <div v-if="isAdmin" class="product-actions">
              <button @click="editProduct(product)">✏️ Edit</button>
              <button @click="deleteProduct(product)">🗑️ Delete</button>
            </div>

            <div v-if="product.quantity > 0" class="add-to-cart">
              <input
                type="number"
                min="1"
                :max="product.quantity"
                v-model.number="product.cartQuantity"
                placeholder="Qty"
              />
              <button @click="addToCart(product)">🛒 Add to Cart</button>
            </div>
          </div>
        </li>
      </ul>

      <p v-else>No products found in this category.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CategoryDetails",
  data() {
    return {
      category: {
        name: this.$route.params.name,
        subcategories: []
      },
      products: [],
      message: "",
      activeSubcategory: "",
      isAdmin: false
    };
  },
  async mounted() {
    const token = localStorage.getItem("token");
    try {
      const profile = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: token }
      });
      this.isAdmin = profile.data.role === "admin";

      const res = await axios.get(
        `http://localhost:5000/api/auth/categories/by-name/${this.category.name}`,
        { headers: { Authorization: token } }
      );
      this.category = res.data;

      await this.fetchAllProducts();
    } catch (err) {
      this.message = "Failed to load category details.";
    }
  },
  methods: {
    async fetchAllProducts() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/products?category=${this.category.name}`,
          { headers: { Authorization: token } }
        );
        this.products = res.data
          .filter(p => {
            if (p.quantity === 0) {
              this.deleteZeroQtyProduct(p._id);
              return false;
            }
            return true;
          })
          .map(p => ({ ...p, cartQuantity: 1 }));
        this.activeSubcategory = "";
      } catch (err) {
        this.message = "Failed to load products.";
      }
    },
    async fetchProductsBySubcategory(sub) {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/products/by-subcategory?category=${this.category.name}&subcategory=${sub}`,
          { headers: { Authorization: token } }
        );
        this.products = res.data
          .filter(p => {
            if (p.quantity === 0) {
              this.deleteZeroQtyProduct(p._id);
              return false;
            }
            return true;
          })
          .map(p => ({ ...p, cartQuantity: 1 }));
        this.activeSubcategory = sub;
      } catch (err) {
        this.message = "Failed to load subcategory products.";
      }
    },
    async deleteZeroQtyProduct(productId) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(`http://localhost:5000/api/auth/products/${productId}`, {
          headers: { Authorization: token }
        });
        console.log(`Deleted product ${productId} with 0 quantity`);
      } catch (err) {
        console.error(`Failed to delete product ${productId}`, err);
      }
    },
    editProduct(product) {
      this.$router.push(`/edit-product/${product._id}`);
    },
    async deleteProduct(product) {
      const quantityToDelete = parseInt(
        prompt(`Enter quantity to delete (max ${product.quantity}):`),
        10
      );
      if (isNaN(quantityToDelete) || quantityToDelete <= 0) return;
      if (quantityToDelete > product.quantity) {
        alert("Quantity exceeds available stock.");
        return;
      }

      const token = localStorage.getItem("token");
      try {
        const res = await axios.delete(
          `http://localhost:5000/api/auth/products/${product._id}/quantity`,
          {
            headers: { Authorization: token },
            data: { quantity: quantityToDelete }
          }
        );

        if (quantityToDelete === product.quantity) {
          this.products = this.products.filter(p => p._id !== product._id);
          this.deleteZeroQtyProduct(product._id);
        } else {
          product.quantity -= quantityToDelete;
        }

        alert(res.data.message);
      } catch (err) {
        alert("Failed to delete product quantity.");
      }
    },
    addToCart(product) {
      const qty = product.cartQuantity || 1;

      if (qty <= 0 || isNaN(qty)) {
        alert("Enter a valid quantity.");
        return;
      }

      if (qty > product.quantity) {
        alert(`Cannot add more than ${product.quantity} items in stock.`);
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existing = cart.find(item => item._id === product._id);
      const currentQtyInCart = existing ? existing.quantity : 0;
      const totalRequested = currentQtyInCart + qty;

      if (totalRequested > product.quantity) {
        alert(
          `Only ${product.quantity} item(s) in stock. You already have ${currentQtyInCart} in cart.`
        );
        return;
      }

      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: qty,
          subcategory: product.subcategory,
          category: this.category.name
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`Added ${qty} item(s) to cart.`);
    }
  }
};
</script>

<style scoped>
.category-details {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
h2 {
  color: #333;
}
ul {
  list-style: none;
  padding-left: 0;
}
li {
  padding: 10px;
  margin-bottom: 10px;
  background: #f5f5f5;
  border-radius: 6px;
}
.products {
  margin-top: 2rem;
}
.product-item {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.product-image img {
  max-width: 100px;
  height: auto;
  border-radius: 6px;
}
.clickable-sub {
  cursor: pointer;
  color: #42b983;
  font-weight: 500;
  margin: 5px 0;
}
.clickable-sub:hover {
  text-decoration: underline;
}
.reset {
  font-style: italic;
  color: #666;
}
.product-actions {
  margin-top: 10px;
}
.product-actions button {
  margin-right: 0.5rem;
  padding: 4px 10px;
  font-size: 0.85rem;
  background-color: #eee;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.product-actions button:hover {
  background-color: #ccc;
}
.add-to-cart {
  margin-top: 10px;
}
.add-to-cart input {
  width: 60px;
  margin-right: 8px;
  padding: 4px;
}
.add-to-cart button {
  padding: 4px 10px;
  font-size: 0.85rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-to-cart button:hover {
  background-color: #369f75;
}
</style>
