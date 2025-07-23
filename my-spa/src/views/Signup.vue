<template>
  <div class="signup-container">
    <div class="signup-box">
      <h2>Signup</h2>
      <input v-model="firstName" placeholder="First Name" /><br />
      <input v-model="lastName" placeholder="Last Name" /><br />
      <input v-model="username" placeholder="Username (optional)" /><br />
      <input v-model="email" placeholder="Email" /><br />
      <input v-model="password" type="password" placeholder="Password" /><br />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" /><br />
      <p v-if="passwordMismatch" class="error-msg">Passwords do not match</p>
      <button :disabled="passwordMismatch" @click="signup">Sign Up</button>
      <p>{{ message }}</p>
      <p>Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      message: ''
    };
  },
  computed: {
    passwordMismatch() {
      return this.password && this.confirmPassword && this.password !== this.confirmPassword;
    }
  },
  methods: {
    async signup() {
      try {
        const payload = {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        };

        if (this.username.trim()) {
          payload.username = this.username;
        }

        const res = await axios.post('http://localhost:5000/api/auth/signup', payload);
        this.message = res.data.message;

        if (res.status === 201) {
          this.$router.push('/login');
        }
      } catch (err) {
        console.error("Signup error:", err.message);

        this.message = err.response?.data?.message || 'Signup failed';
      }
    }
  }
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9f9f9;
}

.signup-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  width: 350px;
}

.signup-box input {
  width: 100%;
  padding: 0.5rem;
  margin: 0.4rem 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.signup-box button {
  width: 100%;
  padding: 0.6rem;
  background-color: #42b883;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
}

.signup-box button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.error-msg {
  color: red;
  font-size: 0.9rem;
  margin-top: -0.3rem;
}
</style>
