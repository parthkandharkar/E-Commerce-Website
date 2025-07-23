<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Login</h2>
      <input v-model="email" placeholder="Email" /><br />
      <input v-model="password" type="password" placeholder="Password" /><br />
      <button @click="login">Login</button>
      <p class="error-msg">{{ message }}</p>
      <p>Don't have an account? <router-link to="/signup">Sign up</router-link></p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      message: ''
    };
  },
  methods: {
    async login() {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: this.email,
          password: this.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = "/dashboard";
      } catch (err) {
        this.message = err.response?.data?.message || 'Login failed';
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9f9f9;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  width: 350px;
}

.login-box input {
  width: 100%;
  padding: 0.5rem;
  margin: 0.4rem 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.login-box button {
  width: 100%;
  padding: 0.6rem;
  background-color: #42b883;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
}

.login-box button:hover {
  background-color: #369b6e;
}

.error-msg {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
