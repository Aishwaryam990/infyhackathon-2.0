const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "technest-hackathon-secret-change-this";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});
async function ensureAdminAccount() {
  const adminEmail = "admin@technest.com";
  const adminPassword = "Admin@123";

  try {
    const existing = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1`,
      [adminEmail.toLowerCase()]
    );

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existing.rows.length > 0) {
      await pool.query(
        `
        UPDATE users
        SET role = 'admin',
            password_hash = $1
        WHERE id = $2
        `,
        [passwordHash, existing.rows[0].id]
      );

      console.log("TECHNEST ADMIN ACCOUNT READY");
    } else {
      await pool.query(
        `
        INSERT INTO users
          (name, email, password_hash, role)
        VALUES
          ($1, $2, $3, 'admin')
        `,
        [
          "TechNest Admin",
          adminEmail,
          passwordHash,
        ]
      );

      console.log("TECHNEST ADMIN ACCOUNT CREATED");
    }

    console.log("Email: admin@technest.com");
    console.log("Password: Admin@123");
    console.log("Role: admin");
  } catch (error) {
    console.error("ADMIN SETUP ERROR:", error.message);
  }
}

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// ============================================================
// HELPERS
// ============================================================

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function getTokenFromRequest(req) {
  const auth = req.headers.authorization;

  if (!auth) return null;

  if (!auth.startsWith("Bearer ")) return null;

  return auth.substring(7);
}

function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

function calculateFinalPrice(price, discount) {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;

  return Math.round(
    Math.max(0, p - (p * d) / 100)
  );
}

// ============================================================
// BASIC ROUTES
// ============================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TechNest Backend is running",
    version: "2.0.0",
    database: "PostgreSQL",
    status: "online",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "TechNest API healthy",
      database: "PostgreSQL",
      status: "online",
    });
  } catch (error) {
    console.error("HEALTH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ============================================================
// PRODUCTS
// ============================================================

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        price,
        discount,
        stock,
        image_url,
        rating,
        created_at
      FROM products
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error("PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// ============================================================
// AUTH - REGISTER
// ============================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const existing = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
        (name, email, password_hash, role)
      VALUES
        ($1, $2, $3, 'customer')
      RETURNING id, name, email, role, created_at
      `,
      [String(name).trim(), cleanEmail, passwordHash]
    );

    const user = result.rows[0];

    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// ============================================================
// AUTH - LOGIN
// ============================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN ATTEMPT:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        created_at
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      console.log("LOGIN FAILED: USER NOT FOUND");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // IMPORTANT:
    // Database column is password_hash, NOT password.
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      console.log("LOGIN FAILED: WRONG PASSWORD");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    const token = createToken(safeUser);

    console.log("LOGIN SUCCESS:", user.email, user.role);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// ============================================================
// AUTH - CURRENT USER
// ============================================================

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

// ============================================================
// USER PROFILE
// ============================================================

app.put("/api/users/:id", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { name } = req.body;

    if (Number(req.user.id) !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own profile",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET name = $1
      WHERE id = $2
      RETURNING id, name, email, role, created_at
      `,
      [String(name).trim(), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

// ============================================================
// ORDERS - CREATE
// ============================================================

app.post("/api/orders", requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      user_id,
      shipping_name,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      payment_method,
      items,
      total_amount,
    } = req.body;

    const authenticatedUserId = Number(req.user.id);

    if (Number(user_id) !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: "Invalid user",
      });
    }

    if (
      !shipping_name ||
      !shipping_address ||
      !shipping_city ||
      !shipping_state ||
      !shipping_pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping information is required",
      });
    }

    if (!/^\d{6}$/.test(String(shipping_pincode).trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Merge duplicate product IDs.
    const mergedItems = {};

    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item",
        });
      }

      mergedItems[productId] =
        (mergedItems[productId] || 0) + quantity;
    }

    await client.query("BEGIN");

    let serverTotal = 0;
    const validatedItems = [];

    for (const [productIdString, quantity] of Object.entries(
      mergedItems
    )) {
      const productId = Number(productIdString);

      const productResult = await client.query(
        `
        SELECT
          id,
          name,
          price,
          discount,
          stock,
          image_url
        FROM products
        WHERE id = $1
        FOR UPDATE
        `,
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product ${productId} not found`);
      }

      const product = productResult.rows[0];

      if (Number(product.stock) < quantity) {
        throw new Error(
          `${product.name} has only ${product.stock} item(s) available`
        );
      }

      const finalPrice = calculateFinalPrice(
        product.price,
        product.discount
      );

      const lineTotal = finalPrice * quantity;

      serverTotal += lineTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        price: finalPrice,
        image_url: product.image_url,
      });
    }

    serverTotal = Number(serverTotal.toFixed(2));

    const clientTotal = Number(total_amount);

    if (
      Number.isFinite(clientTotal) &&
      Math.abs(clientTotal - serverTotal) > 0.05
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Cart total changed. Please refresh your cart.",
      });
    }

    const orderResult = await client.query(
      `
      INSERT INTO orders
      (
        user_id,
        total_amount,
        status,
        shipping_name,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_pincode,
        payment_method
      )
      VALUES
      (
        $1,
        $2,
        'Pending',
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING *
      `,
      [
        authenticatedUserId,
        serverTotal,
        String(shipping_name).trim(),
        String(shipping_address).trim(),
        String(shipping_city).trim(),
        String(shipping_state).trim(),
        String(shipping_pincode).trim(),
        payment_method || "Cash on Delivery",
      ]
    );

    const order = orderResult.rows[0];

    for (const item of validatedItems) {
      await client.query(
        `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          product_name,
          quantity,
          price
        )
        VALUES
        ($1, $2, $3, $4, $5)
        `,
        [
          order.id,
          item.product_id,
          item.product_name,
          item.quantity,
          item.price,
        ]
      );

      await client.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      items: validatedItems,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("CREATE ORDER ERROR:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  } finally {
    client.release();
  }
});

// ============================================================
// USER ORDERS
// ============================================================

app.get(
  "/api/orders/user/:userId",
  requireAuth,
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (Number(req.user.id) !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
      );

      res.json({
        success: true,
        orders: result.rows,
      });
    } catch (error) {
      console.error("USER ORDERS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  }
);

// ============================================================
// ORDER DETAILS
// ============================================================

app.get("/api/orders/:id", requireAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
      `,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    if (
      req.user.role !== "admin" &&
      Number(order.user_id) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        oi.*,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id
      `,
      [orderId]
    );

    res.json({
      success: true,
      order,
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("ORDER DETAILS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
});
// ============================================================
// WISHLIST
// ============================================================

app.get(
  "/api/wishlist/:userId",
  requireAuth,
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (Number(req.user.id) !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const result = await pool.query(
        `
        SELECT
          w.id,
          w.user_id,
          w.product_id,
          p.name,
          p.description,
          p.price,
          p.discount,
          p.stock,
          p.image_url,
          p.rating
        FROM wishlist_items w
        JOIN products p
          ON p.id = w.product_id
        WHERE w.user_id = $1
        ORDER BY w.id DESC
        `,
        [userId]
      );

      res.json({
        success: true,
        wishlist: result.rows,
      });
    } catch (error) {
      console.error("WISHLIST GET ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch wishlist",
      });
    }
  }
);

// ============================================================
// ADD TO WISHLIST
// ============================================================

app.post("/api/wishlist", requireAuth, async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const userId = Number(user_id);
    const productId = Number(product_id);

    if (Number(req.user.id) !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product",
      });
    }

    const product = await pool.query(
      `
      SELECT id
      FROM products
      WHERE id = $1
      `,
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existing = await pool.query(
      `
      SELECT id
      FROM wishlist_items
      WHERE user_id = $1
        AND product_id = $2
      `,
      [userId, productId]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        message: "Product already in wishlist",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO wishlist_items
      (user_id, product_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [userId, productId]
    );

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      wishlistItem: result.rows[0],
    });
  } catch (error) {
    console.error("WISHLIST ADD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
    });
  }
});

// ============================================================
// REMOVE FROM WISHLIST
// ============================================================

app.delete(
  "/api/wishlist/:userId/:productId",
  requireAuth,
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const productId = Number(req.params.productId);

      if (Number(req.user.id) !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await pool.query(
        `
        DELETE FROM wishlist_items
        WHERE user_id = $1
          AND product_id = $2
        `,
        [userId, productId]
      );

      res.json({
        success: true,
        message: "Removed from wishlist",
      });
    } catch (error) {
      console.error("WISHLIST DELETE ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to remove from wishlist",
      });
    }
  }
);

// ============================================================
// REVIEWS - GET PRODUCT REVIEWS
// ============================================================

app.get(
  "/api/reviews/product/:productId",
  async (req, res) => {
    try {
      const productId = Number(req.params.productId);

      const result = await pool.query(
        `
        SELECT
          r.*,
          u.name AS user_name
        FROM reviews r
        LEFT JOIN users u
          ON u.id = r.user_id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
        `,
        [productId]
      );

      res.json({
        success: true,
        reviews: result.rows,
      });
    } catch (error) {
      console.error("REVIEWS GET ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch reviews",
      });
    }
  }
);

// ============================================================
// REVIEWS - ADD REVIEW
// ============================================================

app.post("/api/reviews", requireAuth, async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      rating,
      comment,
    } = req.body;

    const userId = Number(user_id);
    const productId = Number(product_id);
    const reviewRating = Number(rating);

    if (Number(req.user.id) !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product",
      });
    }

    if (
      !Number.isInteger(reviewRating) ||
      reviewRating < 1 ||
      reviewRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    const product = await pool.query(
      `
      SELECT id
      FROM products
      WHERE id = $1
      `,
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO reviews
      (
        user_id,
        product_id,
        rating,
        comment
      )
      VALUES
      ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        userId,
        productId,
        reviewRating,
        String(comment).trim(),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: result.rows[0],
    });
  } catch (error) {
    console.error("REVIEW ADD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
});

// ============================================================
// ADMIN - USERS
// ============================================================

app.get(
  "/api/admin/users",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          role,
          created_at
        FROM users
        ORDER BY created_at DESC
        `
      );

      res.json({
        success: true,
        users: result.rows,
      });
    } catch (error) {
      console.error("ADMIN USERS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  }
);

// ============================================================
// ADMIN - ORDERS
// ============================================================

app.get(
  "/api/admin/orders",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          o.*,
          u.name AS user_name,
          u.email AS user_email
        FROM orders o
        LEFT JOIN users u
          ON u.id = o.user_id
        ORDER BY o.created_at DESC
        `
      );

      res.json({
        success: true,
        orders: result.rows,
      });
    } catch (error) {
      console.error("ADMIN ORDERS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  }
);

// ============================================================
// ADMIN - ORDER STATUS
// ============================================================

app.patch(
  "/api/admin/orders/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const result = await pool.query(
        `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, orderId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Order status updated",
        order: result.rows[0],
      });
    } catch (error) {
      console.error("ORDER STATUS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  }
);


// ============================================================
// ADMIN - PRODUCTS
// ============================================================

app.get(
  "/api/admin/products",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          category,
          description,
          price,
          discount,
          stock,
          image_url,
          rating,
          created_at
        FROM products
        ORDER BY id DESC
        `
      );

      res.json({
        success: true,
        products: result.rows,
      });
    } catch (error) {
      console.error("ADMIN PRODUCTS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  }
);

// ============================================================
// ADMIN - ADD PRODUCT
// ============================================================

app.post(
  "/api/admin/products",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        category,
        description,
        price,
        discount,
        stock,
        image_url,
        rating,
      } = req.body;

      if (!name || !String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      if (!category || !String(category).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product category is required",
        });
      }

      const productPrice = Number(price);
      const productDiscount = Number(discount || 0);
      const productStock = Number(stock || 0);
      const productRating = Number(rating || 0);

      if (
        !Number.isFinite(productPrice) ||
        productPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      if (
        !Number.isFinite(productDiscount) ||
        productDiscount < 0 ||
        productDiscount > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100",
        });
      }

      if (
        !Number.isInteger(productStock) ||
        productStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock",
        });
      }

      if (
        !Number.isFinite(productRating) ||
        productRating < 0 ||
        productRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 0 and 5",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO products
        (
          name,
          category,
          description,
          price,
          discount,
          stock,
          image_url,
          rating
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          String(name).trim(),
          String(category).trim(),
          description || "",
          productPrice,
          productDiscount,
          productStock,
          image_url || "",
          productRating,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Product added successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("ADMIN ADD PRODUCT ERROR:", error);

      res.status(500).json({
        success: false,
        message:
          error.message || "Failed to add product",
      });
    }
  }
);

// ============================================================
// ADMIN - UPDATE PRODUCT
// ============================================================

app.put(
  "/api/admin/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      const {
        name,
        category,
        description,
        price,
        discount,
        stock,
        image_url,
        rating,
      } = req.body;

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      if (!name || !String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      if (!category || !String(category).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product category is required",
        });
      }

      const productPrice = Number(price);
      const productDiscount = Number(discount || 0);
      const productStock = Number(stock || 0);
      const productRating = Number(rating || 0);

      if (
        !Number.isFinite(productPrice) ||
        productPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      if (
        !Number.isFinite(productDiscount) ||
        productDiscount < 0 ||
        productDiscount > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100",
        });
      }

      if (
        !Number.isInteger(productStock) ||
        productStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock",
        });
      }

      if (
        !Number.isFinite(productRating) ||
        productRating < 0 ||
        productRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 0 and 5",
        });
      }

      const result = await pool.query(
        `
        UPDATE products
        SET
          name = $1,
          category = $2,
          description = $3,
          price = $4,
          discount = $5,
          stock = $6,
          image_url = $7,
          rating = $8
        WHERE id = $9
        RETURNING *
        `,
        [
          String(name).trim(),
          String(category).trim(),
          description || "",
          productPrice,
          productDiscount,
          productStock,
          image_url || "",
          productRating,
          productId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product updated successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("ADMIN UPDATE PRODUCT ERROR:", error);

      res.status(500).json({
        success: false,
        message:
          error.message || "Failed to update product",
      });
    }
  }
);

// ============================================================
// ADMIN - DELETE PRODUCT
// ============================================================

app.delete(
  "/api/admin/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM products
        WHERE id = $1
        RETURNING *
        `,
        [productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("ADMIN DELETE PRODUCT ERROR:", error);

      res.status(500).json({
        success: false,
        message:
          "Unable to delete product. It may be referenced by existing orders.",
      });
    }
  }
);

// ============================================================
// ADMIN - ADD PRODUCT
// ============================================================

app.post(
  "/api/admin/products",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        discount,
        stock,
        image_url,
        rating,
      } = req.body;

      if (!name || !String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      const productPrice = Number(price);
      const productDiscount = Number(discount || 0);
      const productStock = Number(stock || 0);
      const productRating = Number(rating || 0);

      if (
        !Number.isFinite(productPrice) ||
        productPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      if (
        !Number.isFinite(productDiscount) ||
        productDiscount < 0 ||
        productDiscount > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100",
        });
      }

      if (
        !Number.isInteger(productStock) ||
        productStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO products
        (
          name,
          description,
          price,
          discount,
          stock,
          image_url,
          rating
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          String(name).trim(),
          description || "",
          productPrice,
          productDiscount,
          productStock,
          image_url || "",
          productRating,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Product added successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("ADMIN ADD PRODUCT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to add product",
      });
    }
  }
);

// ============================================================
// ADMIN - UPDATE PRODUCT
// ============================================================

app.put(
  "/api/admin/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      const {
        name,
        description,
        price,
        discount,
        stock,
        image_url,
        rating,
      } = req.body;

      if (!name || !String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      const productPrice = Number(price);
      const productDiscount = Number(discount || 0);
      const productStock = Number(stock || 0);
      const productRating = Number(rating || 0);

      if (
        !Number.isFinite(productPrice) ||
        productPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      if (
        !Number.isFinite(productDiscount) ||
        productDiscount < 0 ||
        productDiscount > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100",
        });
      }

      if (
        !Number.isInteger(productStock) ||
        productStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock",
        });
      }

      const result = await pool.query(
        `
        UPDATE products
        SET
          name = $1,
          description = $2,
          price = $3,
          discount = $4,
          stock = $5,
          image_url = $6,
          rating = $7
        WHERE id = $8
        RETURNING *
        `,
        [
          String(name).trim(),
          description || "",
          productPrice,
          productDiscount,
          productStock,
          image_url || "",
          productRating,
          productId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product updated successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("ADMIN UPDATE PRODUCT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  }
);

// ============================================================
// ADMIN - DELETE PRODUCT
// ============================================================

app.delete(
  "/api/admin/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      const result = await pool.query(
        `
        DELETE FROM products
        WHERE id = $1
        RETURNING *
        `,
        [productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("ADMIN DELETE PRODUCT ERROR:", error);

      res.status(500).json({
        success: false,
        message:
          "Unable to delete product. It may be referenced by existing orders.",
      });
    }
  }
);

// ============================================================
// ADMIN DASHBOARD STATS
// ============================================================

app.get(
  "/api/admin/dashboard",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const [
        productsResult,
        usersResult,
        ordersResult,
        revenueResult,
        lowStockResult,
      ] = await Promise.all([
        pool.query(`SELECT COUNT(*)::int AS count FROM products`),

        pool.query(`
          SELECT COUNT(*)::int AS count
          FROM users
          WHERE role <> 'admin'
        `),

        pool.query(`SELECT COUNT(*)::int AS count FROM orders`),

        pool.query(`
          SELECT COALESCE(SUM(total_amount), 0) AS revenue
          FROM orders
          WHERE status <> 'Cancelled'
        `),

        pool.query(`
          SELECT COUNT(*)::int AS count
          FROM products
          WHERE stock <= 5
        `),
      ]);

      res.json({
        success: true,
        stats: {
          products: productsResult.rows[0].count,
          users: usersResult.rows[0].count,
          orders: ordersResult.rows[0].count,
          revenue: Number(revenueResult.rows[0].revenue || 0),
          lowStock: lowStockResult.rows[0].count,
        },
      });
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
      });
    }
  }
);

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {
  console.error("GLOBAL ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ============================================================
// START SERVER
// ============================================================

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("PostgreSQL connected successfully.");

    await ensureAdminAccount();

    app.listen(PORT, () => {
      console.log("----------------------------------------");
      console.log("TechNest Backend");
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      console.log("----------------------------------------");
    });
  } catch (error) {
    console.error("DATABASE CONNECTION ERROR:");
    console.error(error);
    process.exit(1);
  }
}

startServer();

startServer();