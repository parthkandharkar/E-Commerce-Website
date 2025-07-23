<template>
  <div class="container">
    <div class="form-box">
      <h2>Manage Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button v-if="user.role === 'user'" @click="changeRole(user._id, 'admin')">Make Admin</button>
              <button v-else @click="changeRole(user._id, 'user')">Revoke Admin</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [],
      message: ""
    };
  },
  async mounted() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: token }
      });
      this.users = res.data;
    } catch {
      this.message = "Failed to load users";
    }
  },
  methods: {
    async changeRole(userId, role) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`http://localhost:5000/api/auth/users/${userId}`, { role }, {
          headers: { Authorization: token }
        });
        this.message = res.data.message || "Role updated";
        this.$forceUpdate(); // reload users list
        const updated = await axios.get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: token }
        });
        this.users = updated.data;
      } catch {
        this.message = "Failed to update role";
      }
    }
  }
};
</script>

<style scoped>

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ccc;
}
button {
  padding: 5px 10px;
  margin: 0 2px;
  cursor: pointer;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 5px;
}
</style>
