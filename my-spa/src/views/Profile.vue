<template>
  <div class="profile-container">
    <div class="profile-box">
      <h2>User Profile</h2>

      <input v-model="firstName" placeholder="First Name" /><br />
      <input v-model="lastName" placeholder="Last Name" /><br />
      <input v-model="username" placeholder="Username" /><br />
      <input v-model="email" placeholder="Email" /><br />
      <input v-model="password" type="password" placeholder="New Password (leave blank to keep current)" /><br />
      <input v-model="confirmPassword" type="password" placeholder="Confirm New Password" /><br />

      <button @click="updateProfile">Update Profile</button>
      <p class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      message: ""
    };
  },
  async mounted() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: token }
      });

      this.firstName = res.data.firstName;
      this.lastName = res.data.lastName;
      this.username = res.data.username;
      this.email = res.data.email;
    } catch (err) {
      this.message = "Failed to load profile.";
    }
  },
  methods: {
  async updateProfile() {
    if (this.password && this.password !== this.confirmPassword) {
      this.message = "Passwords do not match.";
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        email: this.email,
        password: this.password || undefined
      };

      const res = await axios.put("http://localhost:5000/api/auth/profile", payload, {
        headers: { Authorization: token }
      });

      this.message = res.data.message || "Profile updated successfully";

      // ✅ redirect to dashboard after 1.5s with message
      setTimeout(() => {
        this.$router.push({ path: "/dashboard", query: { msg: this.message } });
      }, 1500);

    } catch (err) {
      this.message = err.response?.data?.message || "Update failed";
    }
  }
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9f9f9;
}

.profile-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  width: 350px;
}

.profile-box input {
  width: 100%;
  padding: 0.5rem;
  margin: 0.4rem 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.profile-box button {
  width: 100%;
  padding: 0.6rem;
  background-color: #42b883;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
}

.profile-box button:hover {
  background-color: #369b6e;
}

.message {
  margin-top: 10px;
  font-size: 0.95rem;
  color: #333;
}
</style>
