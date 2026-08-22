import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const handleAddProduct = () => {
        navigate("/products/add");
    };

    return (
        <div className="dashboard">

            {/* Header */}
            <header className="dashboard-header">

                <div className="dashboard-header-info">

                    <h1>Admin Dashboard</h1>

                    <p>
                        Welcome back, {user?.name || "Admin"}
                    </p>

                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </header>


            {/* Main Content */}
            <main className="dashboard-content">

                {/* <div className="dashboard-card"> */}

                    <div className="dashboard-card-header">

                        <div>
                            <h2>Products</h2>

                            <p>
                                Manage your store products
                            </p>
                        </div>

                        <button
                            className="add-product-button"
                            onClick={handleAddProduct}
                        >
                            + Add Product
                        </button>

                    </div>

                {/* </div> */}

            </main>

        </div>
    );
}

export default Dashboard;