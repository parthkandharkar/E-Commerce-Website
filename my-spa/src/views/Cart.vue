<template>
  <div class="cart-view">
    <h2>🛒 Your Cart</h2>

    <div v-if="cartItems.length">
      <ul>
        <li v-for="item in cartItems" :key="item._id" class="cart-item">
          <img :src="`http://localhost:5000${item.imageUrl}`" :alt="item.name" />
          <div>
            <strong>{{ item.name }}</strong><br />
            ₹{{ item.price }} x {{ item.quantity }} = ₹{{ item.price * item.quantity }}
          </div>
        </li>
      </ul>

      <h3>Total: ₹{{ cartTotal }}</h3>
      <button class="checkout-btn" @click="checkout">✅ Checkout</button>
    </div>

    <p v-else>Your cart is empty.</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CartView",
  data() {
    return {
      cartItems: []
    };
  },
  computed: {
    cartTotal() {
      return this.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }
  },
  mounted() {
    this.cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
  },
  methods: {
    async checkout() {
      if (!this.cartItems.length) {
        alert("Your cart is empty.");
        return;
      }

      const token = localStorage.getItem("token");

      try {
        // Reduce product quantities one by one
        for (const item of this.cartItems) {
          await axios.put(
            `http://localhost:5000/api/auth/products/${item._id}/decrease`,
            { quantity: item.quantity },
            { headers: { Authorization: token } }
          );
        }

        alert("✅ Order placed! Your items will be delivered.");
        localStorage.removeItem("cart");
        this.$router.push("/dashboard"); // Or replace with homepage route
      } catch (error) {
        alert("❌ Checkout failed. Please try again.");
        console.error(error);
      }
    }
  }
};
</script>

<style scoped>
.cart-view {
  max-width: 800px;
  margin: 2rem auto;
}
.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
}
.cart-item img {
  width: 80px;
  margin-right: 1rem;
  border-radius: 6px;
}
.checkout-btn {
  margin-top: 1rem;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.checkout-btn:hover {
  background-color: #369f75;
}
</style>
