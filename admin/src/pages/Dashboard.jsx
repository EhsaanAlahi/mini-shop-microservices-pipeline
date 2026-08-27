import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchProducts,
  editProduct,
  removeProduct,
} from "../features/products/productSlice";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: products, loading, error } = useSelector(
    (state) => state.products
  );

  // track which product id is currently being deleted/updated (for button spinners)
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // session expire hone par sab clear karke login pe bhej dein
  const handleSessionExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    toast.error("Your session has expired.");
    navigate("/login");
  };

  // ---- Derived stats (hamesha SAARE products par, filter se independent) ----
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce(
      (sum, p) => sum + (Number(p.stock) || 0),
      0
    );
    const categories = new Set(products.map((p) => p.category).filter(Boolean));
    const lowStock = products.filter((p) => Number(p.stock) <= 5).length;

    return {
      totalProducts,
      totalStock,
      totalCategories: categories.size,
      lowStock,
    };
  }, [products]);

  // ---- Search + recent list ----
  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? products.filter(
          (p) =>
            p.name?.toLowerCase().includes(term) ||
            p.category?.toLowerCase().includes(term)
        )
      : products;

    return filtered.slice(0, 8);
  }, [products, search]);

  // ---- Actions ----
  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  const handleQuickUpdate = async (product) => {
    const newStock = window.prompt(
      `"${product.name}" ka naya stock enter karein:`,
      product.stock
    );
    if (newStock === null) return; // cancelled
    if (isNaN(newStock) || Number(newStock) < 0) {
      toast.error("Sahi number likhein.");
      return;
    }

    setActionId(product._id);
    try {
      await dispatch(
        editProduct({ id: product._id, updates: { stock: Number(newStock) } })
      ).unwrap();
      toast.success(`"${product.name}" ka stock update ho gaya.`);
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        handleSessionExpired();
        return;
      }
      toast.error(err?.message || "Stock update fail ho gaya.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `"${product.name}" ko delete karna hai? Ye action wapis nahi ho sakta.`
    );
    if (!confirmed) return;

    setActionId(product._id);
    try {
      await dispatch(removeProduct(product._id)).unwrap();
      toast.success(`"${product.name}" delete ho gaya.`);
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        handleSessionExpired();
        return;
      }
      toast.error(err?.message || "Delete fail ho gaya.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="dashboard">
      {/* Top bar */}
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="welcome-text">
            Welcome back{user?.name ? `, ${user.name}` : ""} 👋
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate("/add-product")}>
            + Add Product
          </button>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats grid */}
      <section className="stats-grid">
        <StatCard
          label="Total Products"
          value={loading ? "…" : stats.totalProducts}
          icon="📦"
          color="blue"
        />
        <StatCard
          label="Total Stock"
          value={loading ? "…" : stats.totalStock}
          icon="🧮"
          color="green"
        />
        <StatCard
          label="Categories"
          value={loading ? "…" : stats.totalCategories}
          icon="🏷️"
          color="purple"
        />
        <StatCard
          label="Low Stock Alerts"
          value={loading ? "…" : stats.lowStock}
          icon="⚠️"
          color="orange"
        />
        <StatCard
          label="Orders"
          value="Soon"
          icon="🛒"
          color="gray"
          comingSoon
          tooltip="Order-service ready hote hi yahan live orders dikhengay"
        />
      </section>

      {/* Recent products */}
      <section className="recent-section">
        <div className="section-header">
          <h2>Recent Products</h2>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="link-btn" onClick={() => navigate("/products")}>
            View all →
          </button>
        </div>

        {loading ? (
          <div className="card-grid">
            {[...Array(4)].map((_, i) => (
              <div className="product-card skeleton-card" key={i}>
                <div className="skeleton-thumb" />
                <div className="skeleton-line" style={{ width: "70%" }} />
                <div className="skeleton-line" style={{ width: "40%" }} />
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="empty-state">
            {products.length === 0 ? (
              <>
                <p>Abhi tak koi product add nahi hua.</p>
                <button className="btn btn-primary" onClick={() => navigate("/add-product")}>
                  First product add karein
                </button>
              </>
            ) : (
              <p>"{search}" se match karta koi product nahi mila.</p>
            )}
          </div>
        ) : (
          <div className="card-grid">
            {visibleProducts.map((p) => (
              <div className="product-card" key={p._id}>
                <div className="product-card-image">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="product-thumb placeholder large">
                      {p.name?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                  )}
                  <span
                    className={`stock-badge floating ${
                      Number(p.stock) <= 5 ? "low" : "ok"
                    }`}
                  >
                    Stock: {p.stock}
                  </span>
                  {p.isActive === false && (
                    <span className="inactive-badge">Inactive</span>
                  )}
                </div>

                <div className="product-card-body">
                  <h4 title={p.name}>{p.name}</h4>
                  <p className="muted">{p.category || "Uncategorized"}</p>
                  <p className="price">Rs {p.price}</p>
                </div>

                <div className="action-buttons full">
                  <button
                    className="btn-icon btn-edit"
                    disabled={actionId === p._id}
                    onClick={() => handleEdit(p._id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-icon btn-update"
                    disabled={actionId === p._id}
                    onClick={() => handleQuickUpdate(p)}
                  >
                    {actionId === p._id ? "…" : "🔄 Update"}
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    disabled={actionId === p._id}
                    onClick={() => handleDelete(p)}
                  >
                    {actionId === p._id ? "…" : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, color, comingSoon, tooltip }) {
  return (
    <div className={`stat-card stat-${color} ${comingSoon ? "coming-soon" : ""}`} title={tooltip}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
}

export default Dashboard;