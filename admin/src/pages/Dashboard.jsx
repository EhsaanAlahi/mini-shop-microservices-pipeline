import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ---- Derived stats ----
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

  const recentProducts = useMemo(() => products.slice(0, 8), [products]);

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
      alert("Sahi number likhein.");
      return;
    }
    setActionId(product._id);
    await dispatch(
      editProduct({ id: product._id, updates: { stock: Number(newStock) } })
    );
    setActionId(null);
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `"${product.name}" ko delete karna hai? Ye action wapis nahi ho sakta.`
    );
    if (!confirmed) return;
    setActionId(product._id);
    await dispatch(removeProduct(product._id));
    setActionId(null);
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
        ) : recentProducts.length === 0 ? (
          <div className="empty-state">
            <p>Abhi tak koi product add nahi hua.</p>
            <button className="btn btn-primary" onClick={() => navigate("/add-product")}>
              First product add karein
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {recentProducts.map((p) => (
              <div className="product-card" key={p._id}>
                <div className="product-card-image">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} />
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
                    🗑️ Delete
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