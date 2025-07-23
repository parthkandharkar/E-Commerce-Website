const { createApp, ref } = Vue;

createApp({
  setup() {
    const name = ref('');
    const email = ref('');
    const message = ref('');

    const handleSubmit = () => {
      if (!name.value || !email.value) {
        message.value = 'Please enter both name and email.';
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value)) {
        message.value = 'Please enter a valid email address.';
        return;
      }

      message.value = `Signed up successfully as ${name.value}!`;
      console.log({ name: name.value, email: email.value });
    };

    return { name, email, message, handleSubmit };
  },
  template: `
    <div style="max-width: 400px; margin: 80px auto; font-family: sans-serif;">
      <h2>Sign Up</h2>
      <form @submit.prevent="handleSubmit">
        <div style="margin-bottom: 1rem;">
          <label>Name:</label><br />
          <input v-model="name" type="text" placeholder="Your Name" style="width: 100%;" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label>Email:</label><br />
          <input v-model="email" type="email" placeholder="you@example.com" style="width: 100%;" />
        </div>
        <button type="submit" style="padding: 0.5rem 1rem;">Sign Up</button>
      </form>
      <p style="margin-top: 1rem; color: green;">{{ message }}</p>
    </div>
  `
}).mount('#app');
