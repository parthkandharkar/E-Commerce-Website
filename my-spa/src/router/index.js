import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";
import Dashboard from "../views/Dashboard.vue";
import Profile from "../views/Profile.vue";
import Cart from "../views/Cart.vue";
import AddCategory from "../views/AddCategory.vue";
import AddProduct from "../views/AddProduct.vue";
import ManageUsers from "../views/ManageUsers.vue";
import CategoryProducts from "../views/CategoryProducts.vue";


const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/dashboard", component: Dashboard },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/cart", component: Cart, meta: { requiresAuth: true } },
  { path: "/addcategory", component: AddCategory, meta: { requiresAuth: true } },
  { path: "/addproduct", component: AddProduct, meta: { requiresAuth: true } },
  { path: "/manageusers", component: ManageUsers, meta: { requiresAuth: true } },
  { path: "/category/:name", component: CategoryProducts, meta: { requiresAuth: true } },
  { path: "/addcategory/:id", component: AddCategory, meta: { requiresAuth: true } },
  { path: '/edit-product/:id', component: AddProduct, meta: { requiresAuth: true } }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Protect routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) next("/login");
  else next();
});

export default router;
