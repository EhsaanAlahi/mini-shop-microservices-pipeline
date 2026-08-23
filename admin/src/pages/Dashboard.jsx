import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleAddProduct = () => {
    navigate("/products/add");
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${process.env.REACT_APP_API_URL_PRODUCT}`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(data.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);

      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-info">
          <h1>Admin Dashboard</h1>

          <p>Welcome back, {user?.name || "Admin"}</p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      
        {/* Products Header */}
        <div className="dashboard-card-header">
          <div>
            <h2>Products</h2>
            <p>Manage your store products</p>
          </div>

          <button className="add-product-button" onClick={handleAddProduct}>
            + Add Product
          </button>
        </div>
      {/* </div> */}
      {/* Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-card">
          {/* Loading */}
          {loading && (
            <div className="products-message">
              <p>Loading products...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="products-message error-message">
              <p>{error}</p>

              <button onClick={fetchProducts} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && products.length === 0 && (
            <div className="products-message">
              <p>No products found.</p>

              <button className="add-product-button" onClick={handleAddProduct}>
                + Add Your First Product
              </button>
            </div>
          )}

          {/* Products */}
          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => (
                <div className="product-card" key={product._id}>
                  {/* Image */}
                  <div className="product-image-container">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>{product.name}</h3>

                      <span
                        className={
                          product.isActive ? "status active" : "status inactive"
                        }
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="product-description">
                      {product.description || "No description available."}
                    </p>

                    <div className="product-details">
                      <div>
                        <span>Category</span>

                        <strong>{product.category || "Uncategorized"}</strong>
                      </div>

                      <div>
                        <span>Stock</span>

                        <strong>{product.stock}</strong>
                      </div>

                      <div>
                        <span>Price</span>

                        <strong>${Number(product.price).toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="product-actions">
                      <button
                        className="edit-product-button"
                        onClick={() =>
                          navigate(`/products/edit/${product._id}`)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="view-product-button"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
