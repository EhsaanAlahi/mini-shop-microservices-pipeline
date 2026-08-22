import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {

        const response = await fetch(
            `${process.env.REACT_APP_API_URL}login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );


        const data = await response.json();


        // API error

        if (!response.ok) {

            setError(
                data.message || "Invalid email or password"
            );

            toast.error(
                data.message || "Invalid email or password"
            );

            return;
        }


        // Save JWT

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        localStorage.setItem(
            "isAuthenticated",
            "true"
        );

        toast.success(
            "Login successful! Welcome back."
        );

        navigate("/dashboard");

    } catch (error) {

        console.log(
            "Login error:",
            error
        );

        setError(
            "Unable to connect to server"
        );

        toast.error(
            "Unable to connect to server"
        );
    }
};
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Login</h1>

        <p className="login-subtitle">
          Login to access your dashboard
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">
            Login
          </button>
        </form>

        <p className="dummy-credentials">
          Demo: admin@gmail.com / admin123
        </p>
      </div>
    </div>
  );
}

export default Login;