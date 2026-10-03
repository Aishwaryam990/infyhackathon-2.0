import { useEffect, useMemo, useState } from "react";
import TechNestAI from "./components/TechNestAI";
import AdminLogin from "./AdminLogin";
import "./styles/technest-ui.css";
import "./styles/product-details.css";

const API_URL = "https://infyhackathon-2-0.onrender.com";

// Predefined category -> subcategory mapping for TechNest.
// Existing products with older/custom subcategories are preserved below.
const CATEGORY_SUBCATEGORIES = {
  Laptop: [
    "Gaming Laptop",
    "Business Laptop",
    "Student Laptop",
    "2-in-1 Laptop",
  ],
  Smartphone: [
    "Android Phone",
    "iPhone",
    "Gaming Phone",
  ],
  Headphones: [
    "Wireless Headphones",
    "Wired Headphones",
    "Gaming Headphones",
  ],
  Accessories: [
    "Keyboard",
    "Mouse",
    "Charger",
    "USB Cable",
  ],
  Tablet: [
    "Android Tablet",
    "iPad",
    "Windows Tablet",
  ],
  Other: [
    "Smartwatch",
    "Bluetooth Speaker",
    "Webcam",
    "Printer",
    "Camera",
  ],
};

const CATEGORY_META = {
  Laptop: { icon: "💻", label: "Laptops", description: "Gaming, business & student" },
  Smartphone: { icon: "📱", label: "Mobiles", description: "Android & iPhone" },
  Headphones: { icon: "🎧", label: "Headphones", description: "Wireless & gaming" },
  Accessories: { icon: "⌨️", label: "Accessories", description: "Keyboard, mouse & more" },
  Tablet: { icon: "📲", label: "Tablets", description: "iPad, Android & Windows" },
  Other: { icon: "🖥️", label: "More Tech", description: "Cameras, speakers & more" },
};

const SUBCATEGORY_META = {
  "Gaming Laptop": "🎮",
  "Business Laptop": "💼",
  "Student Laptop": "🎓",
  "2-in-1 Laptop": "🔄",
  "Android Phone": "🤖",
  "iPhone": "",
  "Gaming Phone": "🎮",
  "Wireless Headphones": "🎧",
  "Wired Headphones": "🎵",
  "Gaming Headphones": "🎧",
  "Keyboard": "⌨️",
  "Mouse": "🖱️",
  "Charger": "🔌",
  "USB Cable": "🔗",
  "Android Tablet": "📲",
  "iPad": "📱",
  "Windows Tablet": "🪟",
  "Smartwatch": "⌚",
  "Bluetooth Speaker": "🔊",
  "Webcam": "📷",
  "Printer": "🖨️",
  "Camera": "📸",
};

// One-click starter catalog for the admin. Products are inserted through the
// existing authenticated product API, so they remain real database products
// and continue to work with cart, wishlist, orders and stock.
const STARTER_CATALOG = [
  ["ASUS TUF Gaming F15", "Laptop", "Gaming Laptop", 69990, 10, 12, 4.6, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80"],
  ["HP 15s Intel Core i5", "Laptop", "Student Laptop", 52990, 8, 18, 4.4, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80"],
  ["Dell Inspiron 14", "Laptop", "Business Laptop", 64990, 7, 10, 4.5, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80"],
  ["Lenovo Yoga 7", "Laptop", "2-in-1 Laptop", 79990, 12, 7, 4.5, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80"],
  ["Samsung Galaxy S24", "Smartphone", "Android Phone", 69999, 10, 15, 4.7, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=80"],
  ["Google Pixel 9", "Smartphone", "Android Phone", 74999, 8, 9, 4.6, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"],
  ["Apple iPhone 15", "Smartphone", "iPhone", 69900, 6, 14, 4.8, "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=80"],
  ["ASUS ROG Phone 8", "Smartphone", "Gaming Phone", 94999, 5, 6, 4.7, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"],
  ["Sony WH-1000XM5", "Headphones", "Wireless Headphones", 29990, 15, 12, 4.8, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"],
  ["JBL Tune 770NC", "Headphones", "Wireless Headphones", 6999, 12, 20, 4.4, "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80"],
  ["Logitech G435 Gaming Headset", "Headphones", "Gaming Headphones", 7495, 10, 8, 4.5, "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80"],
  ["HyperX Cloud Stinger 2", "Headphones", "Wired Headphones", 4990, 10, 11, 4.3, "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80"],
  ["Logitech MX Keys Mini", "Accessories", "Keyboard", 8995, 10, 16, 4.6, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80"],
  ["Logitech MX Master 3S", "Accessories", "Mouse", 8995, 12, 14, 4.7, "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80"],
  ["Anker 65W USB-C Charger", "Accessories", "Charger", 3999, 15, 25, 4.5, "https://images.unsplash.com/photo-1609592424430-75a1b1f7d4e2?auto=format&fit=crop&w=900&q=80"],
  ["Apple USB-C Charge Cable", "Accessories", "USB Cable", 1990, 10, 30, 4.4, "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80"],
  ["Samsung Galaxy Tab S9", "Tablet", "Android Tablet", 74999, 8, 10, 4.6, "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=900&q=80"],
  ["Apple iPad Air", "Tablet", "iPad", 59900, 7, 12, 4.7, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80"],
  ["Microsoft Surface Go", "Tablet", "Windows Tablet", 54990, 6, 8, 4.3, "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=900&q=80"],
  ["Apple Watch Series 10", "Other", "Smartwatch", 46900, 8, 10, 4.7, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80"],
  ["JBL Flip 6", "Other", "Bluetooth Speaker", 11999, 10, 14, 4.6, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80"],
  ["Logitech Brio 4K Webcam", "Other", "Webcam", 16995, 10, 7, 4.5, "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80"],
  ["Canon PIXMA Printer", "Other", "Printer", 8999, 8, 10, 4.2, "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80"],
  ["Canon EOS Mirrorless Camera", "Other", "Camera", 74990, 9, 5, 4.7, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80"],
  ["OnePlus 13", "Smartphone", "Android Phone", 69999, 10, 12, 4.6, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"],
  ["Logitech G502 HERO", "Accessories", "Mouse", 4995, 10, 18, 4.5, "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80"],
  ["iPad 10th Generation", "Tablet", "iPad", 34900, 8, 10, 4.6, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80"],
  ["Xiaomi Pad 7", "Tablet", "Android Tablet", 27999, 7, 9, 4.4, "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=900&q=80"],
];

// Existing products that were already in the database before the catalog was
// introduced. These are mapped to their proper category/subcategory instead
// of being duplicated.
const EXISTING_PRODUCT_MATCHES = {
  "Test Headphones": { category: "Headphones", subcategory: "Wireless Headphones" },
  "Logitech MX Master 3S": { category: "Accessories", subcategory: "Mouse" },
  "Sony WH-1000XM5": { category: "Headphones", subcategory: "Wireless Headphones" },
  "Samsung Galaxy S24": { category: "Smartphone", subcategory: "Android Phone" },
  "Acer Aspire 5": { category: "Laptop", subcategory: "Student Laptop" },
};

function App() {
  // =========================
  // AUTH STATE
  // =========================
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("technest_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem("technest_token") || "";
  });

  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // =========================
  // STORE STATE
  // =========================
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);

  // =========================
  // CUSTOMER ORDERS STATE
  // =========================
  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);
  const [myOrdersError, setMyOrdersError] = useState("");
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileName, setProfileName] = useState(() => localStorage.getItem("technest_profile_name") || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  // =========================
  // WISHLIST STATE
  // =========================
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [showWishlist, setShowWishlist] = useState(false);

  // =========================
  // PRODUCT REVIEWS STATE
  // =========================
  const [productReviews, setProductReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // =========================
  // ADMIN STATE
  // =========================
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");

  // =========================
  // ADMIN - PRODUCT MANAGEMENT STATE
  // =========================
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminProductsLoading, setAdminProductsLoading] = useState(false);
  const [adminProductSaving, setAdminProductSaving] = useState(false);
  const [catalogSeeding, setCatalogSeeding] = useState(false);
  const [adminProductError, setAdminProductError] = useState("");
  const [adminProductMessage, setAdminProductMessage] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Laptop",
    description: "",
    price: "",
    discount: "0",
    stock: "0",
    image_url: "",
    rating: "0",
    subcategory: "",
    specifications: "",
  });

  // =========================
  // CHECKOUT STATE
  // =========================
  const [checkoutStep, setCheckoutStep] = useState("cart");

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");

  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const [paymentError, setPaymentError] = useState("");
  const [placedOrderItems, setPlacedOrderItems] = useState([]);
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0);
  const [orderId, setOrderId] = useState("");

  // =========================
  // FAST PRODUCT METADATA HELPERS
  // Specifications/subcategory are stored inside the existing description field
  // so no database migration is required during the hackathon.
  // =========================
  const parseProductMetadata = (description = "") => {
    const text = String(description || "");
    const subMatch = text.match(/__TECHNEST_SUBCATEGORY__=(.*)/);
    const specMatch = text.match(/__TECHNEST_SPECS__\n([\s\S]*?)\n__TECHNEST_END__/);
    const clean = text
      .replace(/\n?__TECHNEST_SUBCATEGORY__=.*?(?=\n|$)/, "")
      .replace(/\n?__TECHNEST_SPECS__\n[\s\S]*?\n__TECHNEST_END__/, "")
      .trim();
    return {
      subcategory: subMatch ? subMatch[1].trim() : "",
      specifications: specMatch ? specMatch[1].trim() : "",
      description: clean,
    };
  };

  const buildProductDescription = (description, subcategory, specifications) => {
    const base = String(description || "").trim();
    const meta = [];
    if (subcategory?.trim()) meta.push(`__TECHNEST_SUBCATEGORY__=${subcategory.trim()}`);
    if (specifications?.trim()) meta.push(`__TECHNEST_SPECS__\n${specifications.trim()}\n__TECHNEST_END__`);
    return meta.length ? `${base}${base ? "\n\n" : ""}${meta.join("\n")}` : base;
  };

  const getProductMeta = (product) => parseProductMetadata(product?.description || "");

  const loadOrderDetails = async (id) => {
    try {
      setOrderDetailsLoading(true);
      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to load order details");
      setSelectedOrderDetails(data.order);
    } catch (error) {
      alert(error.message || "Failed to load order details");
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  // =========================
  // RESTORE FULL USER PROFILE
  // =========================
  useEffect(() => {
    const restoreUserProfile = async () => {
      if (!authToken) return;

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success && data.user) {
          const fullUser = {
            ...data.user,
            id: Number(data.user.id),
            role: data.user.role || "customer",
          };

          setUser(fullUser);
          setProfileName(fullUser.name || localStorage.getItem("technest_profile_name") || "");
          localStorage.setItem("technest_user", JSON.stringify(fullUser));
          if (fullUser.name) {
            localStorage.setItem("technest_profile_name", fullUser.name);
          }
        }
      } catch (error) {
        console.error("Profile restore error:", error);
      }
    };

    restoreUserProfile();
  }, [authToken]);

  const saveProfile = async () => {
    if (!profileName.trim()) {
      setProfileError("Please enter your name.");
      return;
    }

    if (!user?.id || !authToken) {
      setProfileError("Please login again before saving your profile.");
      return;
    }
    try {
      setProfileSaving(true); setProfileError(""); setProfileMessage("");
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ name: profileName.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to update profile");
      const updated = { ...user, name: data.user?.name || profileName.trim() };
      setUser(updated);
      localStorage.setItem("technest_user", JSON.stringify(updated));
      localStorage.setItem("technest_profile_name", updated.name);
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileError(error.message || "Failed to update profile");
    } finally { setProfileSaving(false); }
  };

  // =========================
  // LOGIN
  // =========================
  const loginCustomer = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      const payload = JSON.parse(atob(data.token.split(".")[1]));

      const loggedInUser = {
        id: Number(data.user?.id || payload.id),
        name: data.user?.name || payload.name || "",
        email: data.user?.email || payload.email || email,
        role: data.user?.role || payload.role || "customer",
      };

      localStorage.setItem("technest_token", data.token);
      localStorage.setItem(
        "technest_user",
        JSON.stringify(loggedInUser)
      );

      setAuthToken(data.token);
      setUser(loggedInUser);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  };

  // =========================
  // REGISTER / LOGIN SUBMIT
  // =========================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "register") {
        if (!authName.trim()) {
          throw new Error("Please enter your name.");
        }

        const response = await fetch(
          `${API_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Registration failed"
          );
        }

        const loginResult = await loginCustomer(
          authEmail.trim(),
          authPassword
        );

        if (!loginResult.success) {
          throw new Error(loginResult.message);
        }

        setAuthName("");
        setAuthEmail("");
        setAuthPassword("");

        return;
      }

      const result = await loginCustomer(
        authEmail.trim(),
        authPassword
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      setAuthEmail("");
      setAuthPassword("");
    } catch (error) {
      console.error("Authentication error:", error);

      setAuthError(
        error.message || "Something went wrong."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logoutCustomer = () => {
    localStorage.removeItem("technest_token");
    localStorage.removeItem("technest_user");

    setAuthToken("");
    setUser(null);
    setCart([]);
    setWishlist([]);
    setCheckoutStep("cart");
    setShowCart(false);
    setShowWishlist(false);
    setShowMyOrders(false);
    setSelectedProduct(null);
    setAuthMode("login");
  };

  // =========================
  // CUSTOMER - LOAD ORDERS
  // =========================
  const loadMyOrders = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setMyOrdersLoading(true);
      setMyOrdersError("");

      const response = await fetch(
        `${API_URL}/api/orders/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load your orders"
        );
      }

      setMyOrders(data.orders || []);
    } catch (error) {
      console.error("My orders error:", error);

      setMyOrdersError(
        error.message || "Failed to load your orders."
      );
    } finally {
      setMyOrdersLoading(false);
    }
  };

  // =========================
  // CUSTOMER - LOAD WISHLIST
  // =========================
  const loadWishlist = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setWishlistLoading(true);
      setWishlistError("");

      const response = await fetch(
        `${API_URL}/api/wishlist/${user.id}`,
        {
          headers: {
            ...(authToken
              ? {
                  Authorization: `Bearer ${authToken}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load wishlist"
        );
      }

      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error("Wishlist error:", error);

      setWishlistError(
        error.message || "Failed to load wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // =========================
  // ADD TO WISHLIST
  // =========================
  const addToWishlist = async (product) => {
    if (!user?.id) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/wishlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken
              ? {
                  Authorization: `Bearer ${authToken}`,
                }
              : {}),
          },
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 409) {
          alert("This product is already in your wishlist.");
          return;
        }

        throw new Error(
          data.message || "Failed to add to wishlist"
        );
      }

      await loadWishlist();
    } catch (error) {
      console.error("Add wishlist error:", error);

      alert(
        error.message || "Unable to add product to wishlist."
      );
    }
  };

  // =========================
  // REMOVE FROM WISHLIST
  // =========================
  const removeFromWishlist = async (productId) => {
    if (!user?.id) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/wishlist/${user.id}/${productId}`,
        {
          method: "DELETE",
          headers: {
            ...(authToken
              ? {
                  Authorization: `Bearer ${authToken}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to remove from wishlist"
        );
      }

      setWishlist((currentWishlist) =>
        currentWishlist.filter(
          (item) =>
            Number(item.product_id) !== Number(productId)
        )
      );
    } catch (error) {
      console.error("Remove wishlist error:", error);

      alert(
        error.message ||
          "Unable to remove product from wishlist."
      );
    }
  };

  // =========================
  // CHECK IF PRODUCT IS IN WISHLIST
  // =========================
  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) =>
        Number(item.product_id) === Number(productId)
    );
  };

  // =========================
  // CUSTOMER - LOAD PRODUCT REVIEWS
  // =========================
  const loadProductReviews = async (productId) => {
    if (!productId) return;

    try {
      setReviewsLoading(true);
      setReviewsError("");

      const response = await fetch(
        `${API_URL}/api/reviews/product/${productId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load reviews"
        );
      }

      setProductReviews(data.reviews || []);
    } catch (error) {
      console.error("Reviews loading error:", error);

      setReviewsError(
        error.message || "Failed to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  // =========================
  // CUSTOMER - SUBMIT REVIEW
  // =========================
  const submitReview = async () => {
    if (!user?.id || !selectedProduct?.id) return;

    if (!reviewComment.trim()) {
      setReviewsError("Please write a review.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewsError("");

      const response = await fetch(
        `${API_URL}/api/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken
              ? {
                  Authorization: `Bearer ${authToken}`,
                }
              : {}),
          },
          body: JSON.stringify({
            user_id: user.id,
            product_id: selectedProduct.id,
            rating: reviewRating,
            comment: reviewComment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit review"
        );
      }

      setReviewComment("");
      setReviewRating(5);

      await loadProductReviews(selectedProduct.id);
    } catch (error) {
      console.error("Review submit error:", error);

      setReviewsError(
        error.message || "Failed to submit review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =========================
  // LOAD REVIEWS WHEN PRODUCT OPENS
  // =========================
  useEffect(() => {
    if (selectedProduct?.id) {
      setProductReviews([]);
      setReviewComment("");
      setReviewRating(5);
      loadProductReviews(selectedProduct.id);
    }
  }, [selectedProduct]);

  // =========================
  // LOAD WISHLIST WHEN CUSTOMER LOGS IN
  // =========================
  useEffect(() => {
    if (user?.role === "customer" && user?.id) {
      loadWishlist();
    }
  }, [user, authToken]);

  // =========================
  // ADMIN - LOAD USERS
  // =========================
  const loadAdminUsers = async () => {
    try {
      setAdminUsersLoading(true);
      setAdminUsersError("");

      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load users");
      }

      setAdminUsers(data.users || []);
    } catch (error) {
      console.error("Admin users error:", error);
      setAdminUsersError(error.message || "Failed to load users");
    } finally {
      setAdminUsersLoading(false);
    }
  };

  // =========================
  // ADMIN - PRODUCT MANAGEMENT
  // =========================
  const loadAdminProducts = async () => {
    try {
      setAdminProductsLoading(true);
      setAdminProductError("");

      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products");
      }

      setAdminProducts(data.products || []);
    } catch (error) {
      console.error("Admin products error:", error);
      setAdminProductError(error.message || "Failed to load products");
    } finally {
      setAdminProductsLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      category: "Laptop",
      description: "",
      price: "",
      discount: "0",
      stock: "0",
      image_url: "",
      rating: "0",
      subcategory: "",
      specifications: "",
    });
    setEditingProductId(null);
    setShowProductForm(false);
  };

  const openAddProductForm = () => {
    setAdminProductError("");
    setAdminProductMessage("");
    setProductForm({
      name: "",
      category: "Laptop",
      description: "",
      price: "",
      discount: "0",
      stock: "0",
      image_url: "",
      rating: "0",
      subcategory: "",
      specifications: "",
    });
    setEditingProductId(null);
    setShowProductForm(true);
  };

  const openEditProductForm = (product) => {
    setAdminProductError("");
    setAdminProductMessage("");
    setEditingProductId(product.id);
    const meta = parseProductMetadata(product.description || "");
    setProductForm({
      name: product.name || "",
      category: product.category || "Laptop",
      description: meta.description || "",
      price: product.price ?? "",
      discount: product.discount ?? "0",
      stock: product.stock ?? "0",
      image_url: product.image_url || "",
      rating: product.rating ?? "0",
      subcategory: meta.subcategory || "",
      specifications: meta.specifications || "",
    });
    setShowProductForm(true);
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;

    setProductForm((current) => {
      // Changing category resets the subcategory so an old
      // subcategory cannot accidentally remain attached to a new category.
      if (name === "category") {
        return {
          ...current,
          category: value,
          subcategory: "",
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  };

  const adminSubcategoryOptions = useMemo(() => {
    const predefined = CATEGORY_SUBCATEGORIES[productForm.category] || [];

    // Preserve any existing custom/older subcategory when editing a product.
    const existing = adminProducts
      .filter((product) => product.category === productForm.category)
      .map((product) => getProductMeta(product).subcategory)
      .filter(Boolean);

    const current = productForm.subcategory ? [productForm.subcategory] : [];

    return [...new Set([...predefined, ...existing, ...current])];
  }, [adminProducts, productForm.category, productForm.subcategory]);

  const saveAdminProduct = async (e) => {
    e.preventDefault();
    setAdminProductError("");
    setAdminProductMessage("");

    if (!productForm.name.trim()) {
      setAdminProductError("Product name is required.");
      return;
    }

    if (!productForm.category.trim()) {
      setAdminProductError("Category is required.");
      return;
    }

    if (Number(productForm.price) < 0 || productForm.price === "") {
      setAdminProductError("Enter a valid price.");
      return;
    }

    if (Number(productForm.stock) < 0 || productForm.stock === "") {
      setAdminProductError("Enter a valid stock quantity.");
      return;
    }

    try {
      setAdminProductSaving(true);

      const isEditing = Boolean(editingProductId);
      const url = isEditing
        ? `${API_URL}/api/admin/products/${editingProductId}`
        : `${API_URL}/api/admin/products`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: productForm.name.trim(),
          category: productForm.category.trim(),
          description: buildProductDescription(productForm.description, productForm.subcategory, productForm.specifications),
          price: Number(productForm.price),
          discount: Number(productForm.discount || 0),
          stock: Number(productForm.stock),
          image_url: productForm.image_url.trim(),
          rating: Number(productForm.rating || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save product");
      }

      if (isEditing) {
        setAdminProducts((current) =>
          current.map((product) =>
            Number(product.id) === Number(editingProductId)
              ? data.product
              : product
          )
        );
        setProducts((current) =>
          current.map((product) =>
            Number(product.id) === Number(editingProductId)
              ? data.product
              : product
          )
        );
        setAdminProductMessage("Product updated successfully.");
      } else {
        setAdminProducts((current) => [...current, data.product]);
        setProducts((current) => [...current, data.product]);
        setAdminProductMessage("Product added successfully.");
      }

      setProductForm({
        name: "",
        category: "Laptop",
        description: "",
        price: "",
        discount: "0",
        stock: "0",
        image_url: "",
        rating: "0",
        subcategory: "",
        specifications: "",
      });
      setEditingProductId(null);
      setShowProductForm(false);
    } catch (error) {
      console.error("Save product error:", error);
      setAdminProductError(error.message || "Failed to save product");
    } finally {
      setAdminProductSaving(false);
    }
  };

  const seedStarterCatalog = async () => {
    const existingByName = new Map(
      adminProducts.map((product) => [
        String(product.name || "").trim().toLowerCase(),
        product,
      ])
    );

    const confirmed = window.confirm(
      "Build the complete TechNest catalog with 30 products? Existing products will be matched to the correct category/subcategory and will not be duplicated."
    );

    if (!confirmed) return;

    try {
      setCatalogSeeding(true);
      setAdminProductError("");
      setAdminProductMessage("");

      const updatedProducts = [];
      const addedProducts = [];

      // First, repair/match the five products that were already in the database.
      for (const [name, mapping] of Object.entries(EXISTING_PRODUCT_MATCHES)) {
        const existing = existingByName.get(name.toLowerCase());
        if (!existing) continue;

        const meta = getProductMeta(existing);
        const currentCategory = existing.category || "";
        const currentSubcategory = meta.subcategory || "";

        if (currentCategory === mapping.category && currentSubcategory === mapping.subcategory) {
          updatedProducts.push(existing);
          continue;
        }

        const response = await fetch(`${API_URL}/api/admin/products/${existing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: existing.name,
            category: mapping.category,
            description: buildProductDescription(
              meta.description || `Premium ${mapping.subcategory.toLowerCase()} from TechNest.`,
              mapping.subcategory,
              meta.specifications || `Category: ${mapping.category}\nSubcategory: ${mapping.subcategory}`
            ),
            price: Number(existing.price || 0),
            discount: Number(existing.discount || 0),
            stock: Number(existing.stock || 0),
            image_url: existing.image_url || "",
            rating: Number(existing.rating || 0),
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Failed to match ${name}`);
        }

        if (data.product) updatedProducts.push(data.product);
      }

      // Then add only products that do not already exist by name.
      for (const [name, productCategory, productSubcategory, price, discount, stock, rating, imageUrl] of STARTER_CATALOG) {
        const existing = existingByName.get(name.toLowerCase());
        if (existing) {
          if (!updatedProducts.some((product) => Number(product.id) === Number(existing.id))) {
            updatedProducts.push(existing);
          }
          continue;
        }

        const response = await fetch(`${API_URL}/api/admin/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name,
            category: productCategory,
            description: buildProductDescription(
              `Premium ${productSubcategory.toLowerCase()} from TechNest.`,
              productSubcategory,
              `Category: ${productCategory}\nSubcategory: ${productSubcategory}`
            ),
            price,
            discount,
            stock,
            image_url: imageUrl,
            rating,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Failed to add ${name}`);
        }

        if (data.product) addedProducts.push(data.product);
      }

      // Refresh from the backend so the UI exactly matches the database.
      await loadAdminProducts();
      const refreshResponse = await fetch(`${API_URL}/api/products`);
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok && refreshData.success) {
        setProducts(refreshData.products || []);
      }

      const totalNow = adminProducts.length + addedProducts.length;
      setAdminProductMessage(
        `TechNest catalog updated successfully. ${addedProducts.length} new products added and existing products matched to their categories. Your store now has the full 30-product catalog.`
      );
    } catch (error) {
      console.error("Catalog setup error:", error);
      setAdminProductError(error.message || "Failed to build the TechNest catalog");
    } finally {
      setCatalogSeeding(false);
    }
  };

  const deleteAdminProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete ${product.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setAdminProductError("");
      setAdminProductMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      setAdminProducts((current) =>
        current.filter((item) => Number(item.id) !== Number(product.id))
      );
      setProducts((current) =>
        current.filter((item) => Number(item.id) !== Number(product.id))
      );
      setAdminProductMessage("Product deleted successfully.");
    } catch (error) {
      console.error("Delete product error:", error);
      setAdminProductError(error.message || "Failed to delete product");
    }
  };

  // =========================
  // ADMIN - LOAD ORDERS
  // =========================
  const loadAdminOrders = async () => {
    try {
      setAdminLoading(true);
      setAdminError("");
      setAdminMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load admin orders"
        );
      }

      setAdminOrders(data.orders || []);
    } catch (error) {
      console.error("Admin orders error:", error);

      setAdminError(
        error.message || "Failed to load orders"
      );
    } finally {
      setAdminLoading(false);
    }
  };

  // =========================
  // ADMIN - UPDATE ORDER STATUS
  // =========================
  const updateOrderStatus = async (orderId, status) => {
    try {
      setAdminError("");
      setAdminMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update order status"
        );
      }

      setAdminOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );

      setAdminMessage(
        `Order #${orderId} status updated to ${status}.`
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      setAdminError(
        error.message || "Failed to update status"
      );
    }
  };

  // =========================
  // LOAD PRODUCTS
  // =========================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const response = await fetch(
          `${API_URL}/api/products`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load products"
          );
        }

        setProducts(data.products || []);
      } catch (error) {
        console.error(
          "Product loading error:",
          error
        );

        setProductError(
          "Unable to load products. Please make sure the backend is running."
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // =========================
  // LOAD ADMIN DATA
  // =========================
  useEffect(() => {
    if (user?.role === "admin" && authToken) {
      loadAdminOrders();
      loadAdminProducts();
      loadAdminUsers();
    }
  }, [user, authToken]);

  // =========================
  // PRODUCT HELPERS
  // =========================
  const getDiscountedPrice = (product) => {
    const price = Number(product.price || 0);
    const discount = Number(product.discount || 0);

    return Math.round(
      price - (price * discount) / 100
    );
  };

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [products]);

  const subcategories = useMemo(() => {
    // Show real, predefined subcategories even when the catalog is still small.
    // Also preserve any custom/older subcategories already saved in products.
    const relevantCategories =
      category === "All"
        ? Object.keys(CATEGORY_SUBCATEGORIES)
        : [category];

    const predefined = relevantCategories.flatMap(
      (cat) => CATEGORY_SUBCATEGORIES[cat] || []
    );

    const source =
      category === "All"
        ? products
        : products.filter((product) => product.category === category);

    const existing = source
      .map((product) => getProductMeta(product).subcategory)
      .filter(Boolean);

    return ["All", ...new Set([...predefined, ...existing])];
  }, [products, category]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "All") {
      result = result.filter((product) => product.category === category);
    }
    if (subcategory !== "All") {
      result = result.filter((product) => getProductMeta(product).subcategory === subcategory);
    }

    if (search.trim()) {
      const searchText = search.toLowerCase();

      result = result.filter((product) =>
        [
          product.name,
          product.category,
          product.subcategory,
          product.description,
          getProductMeta(product).subcategory,
          getProductMeta(product).specifications,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchText)
          )
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          getDiscountedPrice(a) -
          getDiscountedPrice(b)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          getDiscountedPrice(b) -
          getDiscountedPrice(a)
      );
    }

    if (sort === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    return result;
  }, [products, category, subcategory, search, sort]);

  // =========================
  // CART FUNCTIONS
  // =========================
  const addToCart = (product) => {
    const stock = Number(product.stock || 0);

    if (stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        if (existing.quantity >= stock) {
          alert(`Only ${stock} item${stock === 1 ? "" : "s"} available in stock.`);
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                stock,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
          stock,
        },
      ];
    });
  };

  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== productId) return item;

        const stock = Number(item.stock || 0);

        if (item.quantity >= stock) {
          alert(
            stock <= 0
              ? "This product is out of stock."
              : `Only ${stock} item${stock === 1 ? "" : "s"} available in stock.`
          );
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== productId
      )
    );
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) =>
      sum +
      getDiscountedPrice(item) * item.quantity,
    0
  );

  // =========================
  // ADDRESS
  // =========================
  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateAddress = () => {
    const requiredFields = [
      "fullName",
      "phone",
      "house",
      "street",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!address[field].trim()) {
        return false;
      }
    }

    if (!/^[0-9]{10}$/.test(address.phone)) {
      return false;
    }

    if (!/^[0-9]{6}$/.test(address.pincode)) {
      return false;
    }

    return true;
  };

  // =========================
  // PAYMENT VALIDATION
  // =========================
  const validatePayment = () => {
    setPaymentError("");

    if (paymentMethod === "UPI") {
      if (
        !upiId.trim() ||
        !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())
      ) {
        setPaymentError(
          "Please enter a valid UPI ID."
        );

        return false;
      }
    }

    if (paymentMethod === "Credit/Debit Card") {
      const cleanNumber =
        cardDetails.number.replace(/\s/g, "");

      if (!cardDetails.name.trim()) {
        setPaymentError(
          "Please enter the card holder name."
        );

        return false;
      }

      if (!/^[0-9]{16}$/.test(cleanNumber)) {
        setPaymentError(
          "Card number must contain 16 digits."
        );

        return false;
      }

      if (
        !/^[0-9]{2}\/[0-9]{2}$/.test(
          cardDetails.expiry
        )
      ) {
        setPaymentError(
          "Expiry must be in MM/YY format."
        );

        return false;
      }

      if (!/^[0-9]{3}$/.test(cardDetails.cvv)) {
        setPaymentError(
          "CVV must contain 3 digits."
        );

        return false;
      }
    }

    return true;
  };

  // =========================
  // PLACE ORDER
  // =========================
  const placeOrder = async () => {
    if (!user?.id) {
      setPaymentError(
        "Please login before placing your order."
      );

      return;
    }

    if (!validateAddress()) {
      setPaymentError(
        "Please enter all delivery details correctly."
      );

      return;
    }

    if (!validatePayment()) {
      return;
    }

    const currentItems = [...cart];

const currentTotal = currentItems.reduce(
  (sum, item) =>
    sum + getDiscountedPrice(item) * Number(item.quantity || 0),
  0
);

    try {
      setPaymentError("");

      const orderData = {
        user_id: user.id,
        total_amount: currentTotal,
        shipping_name: address.fullName,
        shipping_address: `${address.house}, ${address.street}`,
        shipping_city: address.city,
        shipping_state: address.state,
        shipping_pincode: address.pincode,
        payment_method: paymentMethod,

        items: currentItems.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: getDiscountedPrice(item),
        })),
      };

      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken
              ? {
                  Authorization: `Bearer ${authToken}`,
                }
              : {}),
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create order"
        );
      }

      setPlacedOrderItems(currentItems);
      setPlacedOrderTotal(currentTotal);

      setOrderId("TN" + data.order.id);

      setCart([]);
      setCheckoutStep("confirmation");
      setShowCart(false);

      loadMyOrders();
    } catch (error) {
  console.error("Order placement error:", error);

  setPaymentError(
    error.message || "Failed to place order."
  );
  }
  };

  // =========================
  // ADMIN PANEL
  // =========================
  if (user?.role === "admin") {
    const totalOrders = adminOrders.length;

    const pendingOrders = adminOrders.filter(
      (order) => order.status === "Pending"
    ).length;

    const confirmedOrders = adminOrders.filter(
      (order) => order.status === "Confirmed"
    ).length;

    const processingOrders = adminOrders.filter(
      (order) => order.status === "Processing"
    ).length;

    const shippedOrders = adminOrders.filter(
      (order) => order.status === "Shipped"
    ).length;

    const deliveredOrders = adminOrders.filter(
      (order) => order.status === "Delivered"
    ).length;

    const totalSales = adminOrders.reduce(
      (sum, order) =>
        sum + Number(order.total_amount || 0),
      0
    );

    const totalProducts = adminProducts.length;
    const totalUsers = adminUsers.length;
    const lowStockProducts = [...adminProducts]
      .filter((product) => Number(product.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
    const recentOrders = [...adminOrders]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);

    return (
      <div className="min-h-screen bg-slate-100">
        {/* ADMIN HEADER */}
        <header className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  TechNest Admin
                </h1>

                <p className="text-slate-300 text-sm mt-1">
                  Store Management Dashboard
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:block text-sm text-slate-300">
                  {user.email}
                </span>

                <button
                  onClick={logoutCustomer}
                  className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* TITLE */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Dashboard
            </h2>

            <p className="text-slate-500 mt-1">
              Manage TechNest orders and store activity.
            </p>
          </div>

          {/* STAT CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <p className="text-sm text-slate-500">
                Total Orders
              </p>

              <p className="text-3xl font-bold mt-2">
                {totalOrders}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                All customer orders
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <p className="text-sm text-slate-500">
                Pending Orders
              </p>

              <p className="text-3xl font-bold mt-2">
                {pendingOrders}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Waiting for confirmation
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <p className="text-sm text-slate-500">
                Delivered
              </p>

              <p className="text-3xl font-bold mt-2">
                {deliveredOrders}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Completed orders
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <p className="text-sm text-slate-500">
                Total Users
              </p>

              <p className="text-3xl font-bold mt-2">
                {adminUsersLoading ? "…" : totalUsers}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Registered customers and admins
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <p className="text-sm text-slate-500">
                Total Sales
              </p>

              <p className="text-3xl font-bold mt-2">
                ₹
                {totalSales.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Order value
              </p>
            </div>
          </div>

          {/* EXTRA DASHBOARD INSIGHTS */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Low Stock Products</h3>
                  <p className="text-sm text-slate-500 mt-1">Products with 5 or fewer items in stock.</p>
                </div>
                <span className="text-2xl">📦</span>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No low-stock products.</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-3 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                        <p className="text-xs text-slate-500">ID #{product.id}</p>
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${Number(product.stock || 0) === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {Number(product.stock || 0) === 0 ? "Out of Stock" : `${product.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
                  <p className="text-sm text-slate-500 mt-1">Latest customer orders.</p>
                </div>
                <span className="text-2xl">🧾</span>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-3 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">TN{order.id}</p>
                        <p className="text-xs text-slate-500 truncate">{order.shipping_name || `User #${order.user_id}`}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-slate-800">₹{Number(order.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-slate-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ORDER STATUS SUMMARY */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
            <h3 className="text-xl font-bold mb-5">
              Order Status Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-yellow-700">
                  Pending
                </p>

                <p className="text-2xl font-bold text-yellow-800">
                  {pendingOrders}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  Confirmed
                </p>

                <p className="text-2xl font-bold text-blue-800">
                  {confirmedOrders}
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-700">
                  Processing
                </p>

                <p className="text-2xl font-bold text-purple-800">
                  {processingOrders}
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-700">
                  Shipped
                </p>

                <p className="text-2xl font-bold text-orange-800">
                  {shippedOrders}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-700">
                  Delivered
                </p>

                <p className="text-2xl font-bold text-green-800">
                  {deliveredOrders}
                </p>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          {adminError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5">
              {adminError}
            </div>
          )}

          {adminMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-5">
              {adminMessage}
            </div>
          )}

          {/* PRODUCT MANAGEMENT */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8">
            <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Product Management</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Add, edit, update stock and manage TechNest products.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadAdminProducts}
                  className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Refresh Products
                </button>
                <button
                  onClick={seedStarterCatalog}
                  disabled={catalogSeeding}
                  className="border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 disabled:opacity-60"
                >
                  {catalogSeeding ? "Building Catalog..." : "⚡ Build 30-Product Catalog"}
                </button>
                <button
                  onClick={openAddProductForm}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800"
                >
                  + Add Product
                </button>
              </div>
            </div>

            {adminProductError && (
              <div className="mx-6 mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                {adminProductError}
              </div>
            )}

            {adminProductMessage && (
              <div className="mx-6 mt-5 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
                {adminProductMessage}
              </div>
            )}

            {showProductForm && (
              <form onSubmit={saveAdminProduct} className="m-6 p-5 bg-slate-50 border rounded-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h4 className="text-lg font-bold">
                      {editingProductId ? "Edit Product" : "Add New Product"}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Enter the product details below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="text-slate-500 hover:text-slate-900 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name</label>
                    <input
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      placeholder="e.g. ASUS Vivobook 15"
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                    >
                      <option>Laptop</option>
                      <option>Smartphone</option>
                      <option>Headphones</option>
                      <option>Accessories</option>
                      <option>Tablet</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      placeholder="50000"
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Discount (%)</label>
                    <input
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={productForm.discount}
                      onChange={handleProductFormChange}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={productForm.stock}
                      onChange={handleProductFormChange}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <input
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={productForm.rating}
                      onChange={handleProductFormChange}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      name="image_url"
                      value={productForm.image_url}
                      onChange={handleProductFormChange}
                      placeholder="https://..."
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Subcategory</label>
                    <select
                      name="subcategory"
                      value={productForm.subcategory}
                      onChange={handleProductFormChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white"
                    >
                      <option value="">Select Subcategory</option>
                      {adminSubcategoryOptions.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    <textarea
                      name="specifications"
                      value={productForm.specifications}
                      onChange={handleProductFormChange}
                      rows={4}
                      placeholder="Specifications (e.g. Processor: Intel i7\nRAM: 16GB\nStorage: 512GB SSD)"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3"
                    />

                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      rows="4"
                      placeholder="Enter product description and specifications..."
                      className="w-full border rounded-lg px-3 py-2 bg-white resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="border border-slate-300 px-5 py-2 rounded-lg font-medium hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adminProductSaving}
                    className="bg-slate-900 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {adminProductSaving
                      ? "Saving..."
                      : editingProductId
                      ? "Update Product"
                      : "Add Product"}
                  </button>
                </div>
              </form>
            )}

            {adminProductsLoading ? (
              <div className="text-center py-12 text-slate-500">
                Loading products...
              </div>
            ) : adminProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No products found. Add your first product.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-y">
                    <tr>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-left p-4">Stock</th>
                      <th className="text-left p-4">Rating</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProducts.map((product) => (
                      <tr key={product.id} className="border-b last:border-b-0 hover:bg-slate-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3 min-w-[240px]">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover border bg-white"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                                💻
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-400">ID #{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{product.category}</td>
                        <td className="p-4 font-semibold">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                          {Number(product.discount || 0) > 0 && (
                            <span className="block text-xs text-green-600">
                              {product.discount}% off
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            Number(product.stock) <= 5
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="p-4">⭐ {Number(product.rating || 0).toFixed(1)}</td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditProductForm(product)}
                              className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteAdminProduct(product)}
                              className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* USERS */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8">
            <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Registered Users</h3>
                <p className="text-sm text-slate-500 mt-1">View registered customers and administrators.</p>
              </div>
              <button
                onClick={loadAdminUsers}
                className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Refresh Users
              </button>
            </div>

            {adminUsersError && (
              <div className="mx-6 mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                {adminUsersError}
              </div>
            )}

            {adminUsersLoading ? (
              <div className="text-center py-12 text-slate-500">
                Loading users...
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No registered users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4">ID</th>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((adminUser) => (
                      <tr key={adminUser.id} className="border-b last:border-b-0 hover:bg-slate-50">
                        <td className="p-4 font-medium">#{adminUser.id}</td>
                        <td className="p-4 font-semibold text-slate-900">{adminUser.name || "N/A"}</td>
                        <td className="p-4">{adminUser.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${adminUser.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                            {adminUser.role || "customer"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">
                          {adminUser.created_at ? new Date(adminUser.created_at).toLocaleDateString("en-IN") : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ORDERS */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">
                  Customer Orders
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Manage order status and customer orders.
                </p>
              </div>

              <button
                onClick={loadAdminOrders}
                className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Refresh Orders
              </button>
            </div>

            {adminLoading ? (
              <div className="text-center py-16">
                <p className="text-slate-500">
                  Loading orders...
                </p>
              </div>
            ) : adminOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">
                  📦
                </div>

                <p className="text-slate-500">
                  No orders found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4">
                        Order
                      </th>

                      <th className="text-left p-4">
                        Customer
                      </th>

                      <th className="text-left p-4">
                        Amount
                      </th>

                      <th className="text-left p-4">
                        Payment
                      </th>

                      <th className="text-left p-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="p-4">
                          <p className="font-bold">
                            TN{order.id}
                          </p>

                          <p className="text-xs text-slate-500">
                            User #{order.user_id || "N/A"}
                          </p>
                        </td>

                        <td className="p-4">
                          <p className="font-medium">
                            {order.shipping_name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {order.customer_email ||
                              "N/A"}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {order.shipping_city},{" "}
                            {order.shipping_state}
                          </p>
                        </td>

                        <td className="p-4 font-semibold">
                          ₹
                          {Number(
                            order.total_amount
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </td>

                        <td className="p-4">
                          {order.payment_method}
                        </td>

                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                order.id,
                                e.target.value
                              )
                            }
                            className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
                          >
                            <option value="Pending">
                              Pending
                            </option>

                            <option value="Confirmed">
                              Confirmed
                            </option>

                            <option value="Processing">
                              Processing
                            </option>

                            <option value="Shipped">
                              Shipped
                            </option>

                            <option value="Delivered">
                              Delivered
                            </option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // AUTH SCREEN
  // =========================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">
              💻
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              TechNest
            </h1>

            <p className="text-slate-500 mt-2">
              Electronics & Laptop Store
            </p>
          </div>

          <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
              className={`flex-1 py-2 rounded-md font-medium ${
                authMode === "login"
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
              }}
              className={`flex-1 py-2 rounded-md font-medium ${
                authMode === "register"
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500"
              }`}
            >
              Register
            </button>
          </div>

          <form
            onSubmit={handleAuthSubmit}
            className="space-y-4"
          >
            {authMode === "register" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  value={authName}
                  onChange={(e) =>
                    setAuthName(e.target.value)
                  }
                  placeholder="Enter your name"
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>

              <input
                type="email"
                value={authEmail}
                onChange={(e) =>
                  setAuthEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>

              <input
                type="password"
                value={authPassword}
                onChange={(e) =>
                  setAuthPassword(e.target.value)
                }
                placeholder="Enter password"
                required
                minLength={6}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {authError && (
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                ? "Login"
                : "Create Account"}
            </button>
          </form>
          <AdminLogin
  onAdminLogin={(adminUser, token) => {
    setAuthToken(token);
    setUser(adminUser);
  }}
/>


          <p className="text-center text-sm text-slate-500 mt-6">
            Secure customer account for TechNest
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ORDER CONFIRMATION
  // =========================
  if (checkoutStep === "confirmation") {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">
              ✅
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Order Confirmed!
            </h1>

            <p className="text-slate-500 mt-2">
              Thank you for shopping with TechNest.
            </p>

            <div className="mt-6 bg-slate-50 rounded-xl p-5 text-left">
              <p>
                <strong>Order ID:</strong>{" "}
                {orderId}
              </p>

              <p className="mt-2">
                <strong>Customer:</strong>{" "}
                {address.fullName}
              </p>

              <p className="mt-2">
                <strong>Payment:</strong>{" "}
                {paymentMethod}
              </p>

              <p className="mt-2">
                <strong>Total:</strong>{" "}
                ₹{placedOrderTotal.toLocaleString(
                  "en-IN"
                )}
              </p>

              <p className="mt-2">
                <strong>Delivery:</strong>{" "}
                {address.house},{" "}
                {address.street},{" "}
                {address.city},{" "}
                {address.state} -{" "}
                {address.pincode}
              </p>
            </div>

            <div className="mt-6 text-left">
              <h2 className="font-bold text-lg mb-3">
                Ordered Items
              </h2>

              <div className="space-y-3">
                {placedOrderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">
                        {item.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹
                      {(
                        getDiscountedPrice(item) *
                        item.quantity
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => {
                  setCheckoutStep("cart");
                  setPaymentError("");
                }}
                className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Continue Shopping
              </button>

              <button
                onClick={() => {
                  setCheckoutStep("cart");
                  setShowMyOrders(true);
                  loadMyOrders();
                }}
                className="flex-1 border border-slate-300 px-6 py-3 rounded-lg font-semibold"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN STORE
  // =========================
  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                TechNest
              </h1>

              <p className="text-sm text-slate-500">
                Electronics & Laptop Store
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="hidden md:block text-sm text-slate-600">
                Welcome,{" "}
                <strong>{user.email}</strong>
              </span>

              {/* PROFILE */}
              <button
                onClick={() => { setProfileName(user.name || profileName || ""); setProfileError(""); setProfileMessage(""); setShowProfile(true); }}
                className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                👤 Profile
              </button>

              {/* MY ORDERS */}
              <button
                onClick={() => {
                  setShowMyOrders(true);
                  loadMyOrders();
                }}
                className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                📦 My Orders
              </button>

              {/* WISHLIST */}
              <button
                onClick={() => {
                  setShowWishlist(true);
                  loadWishlist();
                }}
                className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 relative"
              >
                ❤️ Wishlist

                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* CART */}
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-slate-900 text-white px-4 py-2 rounded-lg"
              >
                🛒 Cart

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={logoutCustomer}
                className="border border-slate-300 px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* SEARCH / FILTER / SORT */}
        <section className="mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white p-6 md:p-8 shadow-lg">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Explore TechNest
              </p>

              <h2 className="text-3xl md:text-4xl font-bold mt-2">
                Find the right tech for you
              </h2>

              <p className="text-slate-300 mt-2">
                Search products, browse categories, and sort by your preference.
              </p>
            </div>

            <div className="mt-6 bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                    🔍
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search laptops, phones, headphones..."
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory("All");
                  }}
                  className="lg:w-52 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                    >
                      {cat === "All" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>

                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="lg:w-56 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub === "All" ? "All Subcategories" : sub}
                    </option>
                  ))}
                </select>

                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value)
                  }
                  className="lg:w-56 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value="default">
                    Recommended Order
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="name">
                    Name: A to Z
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 px-1">
            <div>
              <p className="font-semibold text-slate-800">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"} found
              </p>

              {(search || category !== "All" || subcategory !== "All" || sort !== "default") && (
                <p className="text-sm text-slate-500 mt-1">
                  Showing filtered results
                </p>
              )}
            </div>

            {(search || category !== "All" || subcategory !== "All" || sort !== "default") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setSubcategory("All");
                  setSort("default");
                }}
                className="self-start sm:self-auto text-sm font-semibold text-slate-700 hover:text-slate-950 border border-slate-300 bg-white px-4 py-2 rounded-xl hover:bg-slate-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* SHOP BY CATEGORY */}
        <section className="mb-10">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Shop by category
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
                What are you looking for?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Browse TechNest the way you shop on a modern marketplace.
              </p>
            </div>
            {category !== "All" && (
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setSubcategory("All");
                }}
                className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                View all categories →
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {Object.entries(CATEGORY_META).map(([cat, meta]) => {
              const count = products.filter((product) => product.category === cat).length;
              const active = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setSubcategory("All");
                    setSearch("");
                  }}
                  className={`group text-left rounded-2xl border p-4 md:p-5 transition-all duration-200 ${
                    active
                      ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 ${
                    active ? "bg-white shadow-sm" : "bg-slate-50 group-hover:bg-blue-50"
                  }`}>
                    {meta.icon}
                  </div>
                  <p className="font-extrabold text-slate-900">{meta.label}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-5">{meta.description}</p>
                  <p className="text-xs font-bold text-blue-600 mt-3">
                    {count} {count === 1 ? "product" : "products"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* SHOP BY SUBCATEGORY */}
        <section className="mb-10">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                {category === "All" ? "Explore by type" : `${CATEGORY_META[category]?.label || category} collection`}
              </p>
              <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                Shop by subcategory
              </h3>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
            {(category === "All"
              ? Object.values(CATEGORY_SUBCATEGORIES).flat()
              : CATEGORY_SUBCATEGORIES[category] || []
            ).map((sub) => {
              const active = subcategory === sub;
              const subCount = products.filter(
                (product) =>
                  (category === "All" || product.category === category) &&
                  getProductMeta(product).subcategory === sub
              ).length;

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setSubcategory(sub);
                    if (category === "All") {
                      const matchingProduct = products.find(
                        (product) => getProductMeta(product).subcategory === sub
                      );
                      if (matchingProduct?.category) {
                        setCategory(matchingProduct.category);
                      }
                    }
                  }}
                  className={`min-w-[170px] snap-start text-left rounded-2xl border p-4 transition-all ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-md"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${
                    active ? "bg-white/10" : "bg-slate-50"
                  }`}>
                    {SUBCATEGORY_META[sub] || "🛍️"}
                  </div>
                  <p className={`font-bold text-sm ${active ? "text-white" : "text-slate-900"}`}>
                    {sub}
                  </p>
                  <p className={`text-xs mt-1 ${active ? "text-slate-300" : "text-slate-500"}`}>
                    {subCount} {subCount === 1 ? "item" : "items"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ERROR */}
        {productError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
            {productError}
          </div>
        )}

        {/* LOADING */}
        {loadingProducts ? (
          <div className="text-center py-16">
            <p className="text-slate-500">
              Loading products...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">
              No products found.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const discountedPrice =
                getDiscountedPrice(product);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200 hover:shadow-lg transition"
                >
                  <div className="h-52 bg-slate-100 flex items-center justify-center relative">
                    {Number(product.discount || 0) > 0 && (
  <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md">
    🔥 {product.discount}% OFF
  </div>
)}
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-6xl">
                        💻
                      </div>
                    )}

                    {/* WISHLIST HEART */}
                    <button
                      onClick={() => {
                        if (isInWishlist(product.id)) {
                          removeFromWishlist(product.id);
                        } else {
                          addToWishlist(product);
                        }
                      }}
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                        isInWishlist(product.id)
                          ? "bg-red-500 text-white"
                          : "bg-white text-slate-600 hover:text-red-500"
                      }`}
                      title={
                        isInWishlist(product.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      {isInWishlist(product.id)
                        ? "♥"
                        : "♡"}
                    </button>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-slate-500 uppercase">
                      {product.category}
                    </p>

                    <h2 className="font-bold text-lg mt-1">
                      {product.name}
                    </h2>

                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {product.description ||
                        "Quality electronics from TechNest."}
                    </p>

                    <div className="mt-4">
                      {Number(product.discount || 0) >
                        0 && (
                        <span className="text-sm text-slate-400 line-through mr-2">
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString("en-IN")}
                        </span>
                      )}

                      <span className="text-xl font-bold text-slate-900">
                        ₹
                        {discountedPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">

  {Number(product.stock || 0) <= 0 ? (
    <span className="text-red-600 font-semibold text-sm">
      🔴 Out of Stock
    </span>
  ) : Number(product.stock || 0) <= 3 ? (
    <span className="text-orange-600 font-semibold text-sm">
      🔥 Only {product.stock} left
    </span>
  ) : Number(product.stock || 0) <= 10 ? (
    <span className="text-orange-600 font-semibold text-sm">
      ⚡ Selling fast
    </span>
  ) : (
    <span className="text-emerald-600 font-semibold text-sm">
      ✓ Available now
    </span>
  )}


</div>
                    

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() =>
                          setSelectedProduct(product)
                        }
                        className="flex-1 border border-slate-300 py-2 rounded-lg text-sm font-medium"
                      >
                        Details
                      </button>

                      <button
                        onClick={() =>
                          addToCart(product)
                        }
                        disabled={Number(product.stock || 0) <= 0}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                          Number(product.stock || 0) <= 0
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {Number(product.stock || 0) <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProfile(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-bold">My Profile</h2>
              <button onClick={() => setShowProfile(false)} className="text-2xl text-slate-500">×</button>
            </div>
            <div className="space-y-4 mt-5">
              <div><label className="text-sm font-medium">Name</label><input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-4 py-3" /></div>
              <div><label className="text-sm font-medium">Email</label><input value={user.email} disabled className="mt-1 w-full border border-slate-200 bg-slate-100 rounded-lg px-4 py-3" /></div>
              <div><label className="text-sm font-medium">Role</label><input value={user.role || "customer"} disabled className="mt-1 w-full border border-slate-200 bg-slate-100 rounded-lg px-4 py-3 capitalize" /></div>
            </div>
            {profileError && <div className="mt-4 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{profileError}</div>}
            {profileMessage && <div className="mt-4 bg-green-50 text-green-700 border border-green-200 rounded-lg p-3">{profileMessage}</div>}
            <button onClick={saveProfile} disabled={profileSaving} className="mt-5 w-full bg-slate-900 text-white py-3 rounded-lg font-semibold disabled:opacity-50">{profileSaving ? "Saving..." : "Save Profile"}</button>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrderDetails(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-center border-b pb-4"><div><h2 className="text-2xl font-bold">Order TN{selectedOrderDetails.id}</h2><p className="text-sm text-slate-500">{new Date(selectedOrderDetails.created_at).toLocaleString("en-IN")}</p></div><button onClick={() => setSelectedOrderDetails(null)} className="text-2xl">×</button></div>
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500">Status</p><p className="font-bold mt-1">{selectedOrderDetails.status}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500">Payment</p><p className="font-bold mt-1">{selectedOrderDetails.payment_method}</p></div>
            </div>
            <div className="mt-5 border rounded-xl p-4"><h3 className="font-bold mb-3">Items</h3>{(selectedOrderDetails.items || []).map((item) => <div key={item.id} className="flex justify-between py-2 border-b last:border-b-0"><div><p className="font-medium">{item.product_name}</p><p className="text-sm text-slate-500">Qty: {item.quantity}</p></div><p className="font-semibold">₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</p></div>)}</div>
            <div className="mt-5 bg-slate-50 rounded-xl p-4"><h3 className="font-bold">Delivery</h3><p className="mt-2">{selectedOrderDetails.shipping_name}</p><p className="text-sm text-slate-600">{selectedOrderDetails.shipping_address}</p><p className="text-sm text-slate-600">{selectedOrderDetails.shipping_city}, {selectedOrderDetails.shipping_state} - {selectedOrderDetails.shipping_pincode}</p></div>
            <div className="text-right mt-5 text-xl font-bold">Total: ₹{Number(selectedOrderDetails.total_amount).toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
          </div>
        </div>
      )}

      {/* =========================
          MY ORDERS MODAL
      ========================= */}
      {showMyOrders && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMyOrders(false)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    My Orders
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    View your TechNest orders and status.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowMyOrders(false)
                  }
                  className="text-2xl text-slate-500"
                >
                  ×
                </button>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={loadMyOrders}
                  disabled={myOrdersLoading}
                  className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  {myOrdersLoading
                    ? "Refreshing..."
                    : "Refresh Orders"}
                </button>
              </div>

              {myOrdersError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-5">
                  {myOrdersError}
                </div>
              )}

              {myOrdersLoading ? (
                <div className="text-center py-16">
                  <p className="text-slate-500">
                    Loading your orders...
                  </p>
                </div>
              ) : myOrders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">
                    📦
                  </div>

                  <p className="font-medium text-slate-700">
                    No orders yet
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Your completed orders will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mt-5">
                  {myOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-slate-200 rounded-2xl p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="font-bold text-lg">
                            TN{order.id}
                          </p>

                          <p className="text-xs text-slate-500">
                            {new Date(
                              order.created_at
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Shipped"
                              ? "bg-orange-100 text-orange-700"
                              : order.status === "Processing"
                              ? "bg-purple-100 text-purple-700"
                              : order.status === "Confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-5">
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-xs text-slate-500">
                            Order Amount
                          </p>

                          <p className="text-xl font-bold mt-1">
                            ₹
                            {Number(
                              order.total_amount
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-xs text-slate-500">
                            Payment
                          </p>

                          <p className="font-semibold mt-1">
                            {order.payment_method}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500">
                          Delivery Address
                        </p>

                        <p className="text-sm mt-1">
                          {order.shipping_name}
                        </p>

                        <p className="text-sm text-slate-600">
                          {order.shipping_address}
                        </p>

                        <p className="text-sm text-slate-600">
                          {order.shipping_city},{" "}
                          {order.shipping_state} -{" "}
                          {order.shipping_pincode}
                        </p>
                      </div>
                      <button
                        onClick={() => loadOrderDetails(order.id)}
                        className="mt-4 w-full border border-slate-300 py-2 rounded-lg font-medium hover:bg-slate-50"
                      >
                        {orderDetailsLoading ? "Loading..." : "View Order Details"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================
          WISHLIST MODAL
      ========================= */}
      {showWishlist && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowWishlist(false)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    ❤️ My Wishlist
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Products you want to save for later.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowWishlist(false)
                  }
                  className="text-2xl text-slate-500"
                >
                  ×
                </button>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={loadWishlist}
                  disabled={wishlistLoading}
                  className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  {wishlistLoading
                    ? "Refreshing..."
                    : "Refresh Wishlist"}
                </button>
              </div>

              {wishlistError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-5">
                  {wishlistError}
                </div>
              )}

              {wishlistLoading ? (
                <div className="text-center py-16">
                  <p className="text-slate-500">
                    Loading wishlist...
                  </p>
                </div>
              ) : wishlist.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">
                    ♡
                  </div>

                  <p className="font-medium text-slate-700">
                    Your wishlist is empty
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Click the heart icon on a product to
                    save it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mt-5">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-2xl p-4"
                    >
                      <div className="flex gap-4">
                        <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-4xl">
                              💻
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 uppercase">
                            {item.category}
                          </p>

                          <h3 className="font-bold text-lg mt-1">
                            {item.name}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {item.description ||
                              "Quality electronics from TechNest."}
                          </p>

                          <div className="mt-2">
                            {Number(item.discount || 0) >
                              0 && (
                              <span className="text-sm text-slate-400 line-through mr-2">
                                ₹
                                {Number(
                                  item.price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}

                            <span className="font-bold text-lg">
                              ₹
                              {getDiscountedPrice(
                                item
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            addToCart(item);
                            setShowWishlist(false);
                          }}
                          className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-medium"
                        >
                          🛒 Add to Cart
                        </button>

                        <button
                          onClick={() =>
                            removeFromWishlist(
                              item.product_id
                            )
                          }
                          className="border border-red-200 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">
                  {selectedProduct.name}
                </h2>

                <button
                  onClick={() =>
                    setSelectedProduct(null)
                  }
                  className="text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedProduct.image_url && (
                <div className="relative">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-contain mt-4 bg-slate-100 rounded-xl"
                  />

                  <button
                    onClick={() => {
                      if (
                        isInWishlist(
                          selectedProduct.id
                        )
                      ) {
                        removeFromWishlist(
                          selectedProduct.id
                        );
                      } else {
                        addToWishlist(selectedProduct);
                      }
                    }}
                    className={`absolute top-7 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                      isInWishlist(
                        selectedProduct.id
                      )
                        ? "bg-red-500 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {isInWishlist(
                      selectedProduct.id
                    )
                      ? "♥"
                      : "♡"}
                  </button>
                </div>
              )}

              <p className="text-slate-500 mt-4">
                {getProductMeta(selectedProduct).description || "No description available."}
              </p>

              {getProductMeta(selectedProduct).specifications && (
                <div className="mt-5 bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-lg mb-2">Specifications</h3>
                  <div className="whitespace-pre-line text-sm text-slate-700">{getProductMeta(selectedProduct).specifications}</div>
                </div>
              )}

              <div className="mt-4">
                <span className="text-2xl font-bold">
                  ₹
                  {getDiscountedPrice(
                    selectedProduct
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <strong>Category</strong>

                  <p>
                    {selectedProduct.category ||
                      "N/A"}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <strong>Stock</strong>

                  <p>
                    {selectedProduct.stock ?? "N/A"}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <strong>Rating</strong>

                  <p>
                    ⭐{" "}
                    {selectedProduct.rating ||
                      "Not rated"}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <strong>Discount</strong>

                  <p>
                    {selectedProduct.discount || 0}%
                  </p>
                </div>
              </div>

              {/* PRODUCT REVIEWS */}
              <div className="mt-7 border-t border-slate-200 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Ratings & Reviews
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      See what customers think about this product.
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-slate-900">
                      ⭐ {selectedProduct.rating || "New"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {productReviews.length}{" "}
                      {productReviews.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mt-5 border border-slate-100">
                  <h4 className="font-semibold text-slate-900">
                    Write a Review
                  </h4>

                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-3xl leading-none transition hover:scale-110 ${
                          star <= reviewRating
                            ? "text-yellow-400"
                            : "text-slate-300"
                        }`}
                        title={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) =>
                      setReviewComment(e.target.value)
                    }
                    placeholder="Share your experience with this product..."
                    rows={3}
                    className="w-full border border-slate-300 bg-white rounded-xl px-4 py-3 mt-3 outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                  />

                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={reviewSubmitting}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold mt-3 hover:bg-slate-800 disabled:opacity-50"
                  >
                    {reviewSubmitting
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>

                {reviewsError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mt-4 text-sm">
                    {reviewsError}
                  </div>
                )}

                <div className="mt-5">
                  {reviewsLoading ? (
                    <div className="text-center py-6">
                      <p className="text-slate-500">
                        Loading reviews...
                      </p>
                    </div>
                  ) : productReviews.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                      <div className="text-3xl mb-2">
                        ⭐
                      </div>

                      <p className="font-medium text-slate-700">
                        No reviews yet
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Be the first customer to review this product.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {productReviews.map((review) => (
                        <div
                          key={review.id}
                          className="border border-slate-200 rounded-2xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {review.user_name || "Customer"}
                              </p>

                              <div className="text-yellow-400 mt-1">
                                {"★".repeat(Number(review.rating))}
                                <span className="text-slate-300">
                                  {"★".repeat(
                                    5 - Number(review.rating)
                                  )}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400">
                              {review.created_at
                                ? new Date(
                                    review.created_at
                                  ).toLocaleDateString("en-IN")
                                : ""}
                            </p>
                          </div>

                          <p className="text-sm text-slate-600 mt-3">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold mt-6"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCart(false)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  Your Cart
                </h2>

                <button
                  onClick={() => setShowCart(false)}
                  className="text-2xl"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">
                    🛒
                  </div>

                  <p className="text-slate-500">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mt-6">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-xl p-4"
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">
                              {item.name}
                            </h3>

                            <p className="text-sm text-slate-500">
                              ₹
                              {getDiscountedPrice(
                                item
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(item.id)
                            }
                            className="text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                              className="w-8 h-8 border rounded-lg"
                            >
                              −
                            </button>

                            <span>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                              className="w-8 h-8 border rounded-lg"
                            >
                              +
                            </button>
                          </div>

                          <strong>
                            ₹
                            {(
                              getDiscountedPrice(
                                item
                              ) * item.quantity
                            ).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-6 pt-5">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>

                      <span>
                        ₹
                        {total.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setPaymentError("");
                        setCheckoutStep("address");
                        setShowCart(false);
                      }}
                      className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold mt-5"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT - ADDRESS */}
      {checkoutStep === "address" && (
        <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Delivery Address
                </h2>

                <button
                  onClick={() =>
                    setCheckoutStep("cart")
                  }
                  className="text-slate-500"
                >
                  Back
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  placeholder="Full Name"
                  className="border rounded-lg px-4 py-3"
                />

                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  placeholder="10-digit Phone Number"
                  maxLength={10}
                  className="border rounded-lg px-4 py-3"
                />

                <input
                  name="house"
                  value={address.house}
                  onChange={handleAddressChange}
                  placeholder="House / Building"
                  className="border rounded-lg px-4 py-3"
                />

                <input
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  placeholder="Street / Area"
                  className="border rounded-lg px-4 py-3"
                />

                <input
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="border rounded-lg px-4 py-3"
                />

                <input
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="State"
                  className="border rounded-lg px-4 py-3"
                />

                <input
                  name="pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  placeholder="6-digit Pincode"
                  maxLength={6}
                  className="border rounded-lg px-4 py-3"
                />
              </div>

              {paymentError && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mt-5">
                  {paymentError}
                </div>
              )}

              <button
                onClick={() => {
                  if (!validateAddress()) {
                    setPaymentError(
                      "Please enter all delivery details correctly."
                    );

                    return;
                  }

                  setPaymentError("");
                  setCheckoutStep("payment");
                }}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold mt-6"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT */}
      {checkoutStep === "payment" && (
        <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Payment
                </h2>

                <button
                  onClick={() =>
                    setCheckoutStep("address")
                  }
                  className="text-slate-500"
                >
                  Back
                </button>
              </div>

              <div className="space-y-3">
                <label className="border rounded-xl p-4 flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="UPI"
                    checked={
                      paymentMethod === "UPI"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <span className="font-medium">
                    UPI
                  </span>
                </label>

                <label className="border rounded-xl p-4 flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="Credit/Debit Card"
                    checked={
                      paymentMethod ===
                      "Credit/Debit Card"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <span className="font-medium">
                    Credit/Debit Card
                  </span>
                </label>

                <label className="border rounded-xl p-4 flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="Cash on Delivery"
                    checked={
                      paymentMethod ===
                      "Cash on Delivery"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <span className="font-medium">
                    Cash on Delivery
                  </span>
                </label>
              </div>

              {paymentMethod === "UPI" && (
                <div className="mt-5">
                  <label className="block font-medium mb-2">
                    UPI ID
                  </label>

                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) =>
                      setUpiId(e.target.value)
                    }
                    placeholder="example@upi"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
              )}

              {paymentMethod ===
                "Credit/Debit Card" && (
                <div className="mt-5 space-y-4">
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        name: e.target.value,
                      })
                    }
                    placeholder="Card Holder Name"
                    className="w-full border rounded-lg px-4 py-3"
                  />

                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        number: e.target.value,
                      })
                    }
                    placeholder="16-digit Card Number"
                    maxLength={16}
                    className="w-full border rounded-lg px-4 py-3"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          expiry: e.target.value,
                        })
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      className="border rounded-lg px-4 py-3"
                    />

                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cvv: e.target.value,
                        })
                      }
                      placeholder="CVV"
                      maxLength={3}
                      className="border rounded-lg px-4 py-3"
                    />
                  </div>
                </div>
              )}

              {paymentMethod ===
                "Cash on Delivery" && (
                <div className="bg-slate-50 rounded-lg p-4 mt-5 text-sm text-slate-600">
                  Payment will be collected when
                  your order is delivered.
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-5 mt-6">
                <div className="flex justify-between">
                  <span>Items</span>

                  <span>{cartCount}</span>
                </div>

                <div className="flex justify-between font-bold text-xl mt-3">
                  <span>Total</span>

                  <span>
                    ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              {paymentError && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mt-5">
                  {paymentError}
                </div>
              )}

              <div className="bg-blue-50 text-blue-700 rounded-lg p-3 mt-5 text-sm">
                This is a simulated payment for
                the hackathon demo. No real money
                will be charged.
              </div>

              <button
                onClick={placeOrder}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold mt-6"
              >
                Pay & Place Order
              </button>
            </div>
          </div>
        </div>
      )}
      <TechNestAI
  products={products}
  addToCart={addToCart}
  getDiscountedPrice={getDiscountedPrice}
  setSelectedProduct={setSelectedProduct}
/>
    </div>


  );
}

export default App;