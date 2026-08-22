import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AddProduct.css";

function AddProduct() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: null,
        isActive: true,
    });

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);


    // =========================
    // HANDLE INPUT CHANGE
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    // =========================
    // HANDLE IMAGE
    // =========================

    const handleImageChange = (e) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }


        // Validate file type

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {

            toast.error(
                "Only JPG, PNG or WEBP images are allowed."
            );

            e.target.value = "";

            return;
        }


        // Validate file size - 5MB

        if (file.size > 5 * 1024 * 1024) {

            toast.error(
                "Image size must be less than 5MB."
            );

            e.target.value = "";

            return;
        }


        setFormData((prev) => ({
            ...prev,
            image: file,
        }));


        // Create preview

        const imageUrl =
            URL.createObjectURL(file);

        setPreview(imageUrl);
    };


    // =========================
    // REMOVE IMAGE
    // =========================

    const handleRemoveImage = () => {

        setFormData((prev) => ({
            ...prev,
            image: null,
        }));


        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview(null);


        const input =
            document.getElementById(
                "product-image"
            );

        if (input) {
            input.value = "";
        }
    };


    // =========================
    // SUBMIT PRODUCT
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (loading) {
            return;
        }


        // Validate name

        if (!formData.name.trim()) {

            toast.error(
                "Product name is required."
            );

            return;
        }


        // Validate price

        if (
            formData.price === "" ||
            Number(formData.price) < 0
        ) {

            toast.error(
                "Please enter a valid price."
            );

            return;
        }


        // Validate stock

        if (
            formData.stock === "" ||
            Number(formData.stock) < 0
        ) {

            toast.error(
                "Please enter a valid stock."
            );

            return;
        }


        try {

            setLoading(true);


            // =========================
            // FORM DATA
            // =========================

            const data = new FormData();


            data.append(
                "name",
                formData.name.trim()
            );


            data.append(
                "description",
                formData.description.trim()
            );


            data.append(
                "price",
                formData.price
            );


            data.append(
                "category",
                formData.category.trim()
            );


            data.append(
                "stock",
                formData.stock
            );


            data.append(
                "isActive",
                String(formData.isActive)
            );


            // Image

            if (formData.image) {

                data.append(
                    "image",
                    formData.image
                );
            }


            // =========================
            // JWT
            // =========================

            const token =
                localStorage.getItem("token");


            if (!token) {

                toast.error(
                    "You are not authenticated."
                );

                navigate("/login");

                return;
            }


            // =========================
            // API REQUEST
            // =========================

            const response = await fetch(
                `${process.env.REACT_APP_API_URL_PRODUCT}signup`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: data,
                }
            );


            const result =
                await response.json();


            // =========================
            // API ERROR
            // =========================

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "isAuthenticated"
                    );

                    localStorage.removeItem(
                        "user"
                    );


                    toast.error(
                        "Your session has expired."
                    );


                    navigate("/login");

                    return;
                }


                throw new Error(
                    result.message ||
                    "Failed to create product"
                );
            }


            // =========================
            // SUCCESS
            // =========================

            toast.success(
                "Product added successfully!"
            );


            console.log(
                "Created product:",
                result.product
            );


            // Reset form

            setFormData({
                name: "",
                description: "",
                price: "",
                category: "",
                stock: "",
                image: null,
                isActive: true,
            });


            handleRemoveImage();


            // Dashboard

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);


        } catch (error) {

            console.error(
                "Add product error:",
                error
            );


            toast.error(
                error.message ||
                "Something went wrong."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================
    // JSX
    // =========================

    return (

        <div className="add-product-page">

            <div className="add-product-container">


                {/* PAGE HEADER */}

                <div className="page-header">

                    <div>

                        <h1>
                            Add Product
                        </h1>

                        <p>
                            Add a new product to your store
                        </p>

                    </div>

                </div>


                {/* FORM */}

                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >


                    {/* PRODUCT INFORMATION */}

                    <div className="form-section">

                        <h2>
                            Product Information
                        </h2>


                        <div className="form-grid">


                            {/* NAME */}

                            <div className="form-group full-width">

                                <label>
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                    required
                                    disabled={loading}
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group full-width">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    rows="5"
                                    disabled={loading}
                                />

                            </div>


                            {/* PRICE */}

                            <div className="form-group">

                                <label>
                                    Price
                                </label>

                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                    disabled={loading}
                                />

                            </div>


                            {/* STOCK */}

                            <div className="form-group">

                                <label>
                                    Stock
                                </label>

                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    required
                                    disabled={loading}
                                />

                            </div>


                            {/* CATEGORY */}

                            <div className="form-group full-width">

                                <label>
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="e.g. Electronics"
                                    disabled={loading}
                                />

                            </div>

                        </div>

                    </div>


                    {/* PRODUCT IMAGE */}

                    <div className="form-section">

                        <h2>
                            Product Image
                        </h2>


                        <div className="image-upload">


                            {preview ? (

                                <div className="image-preview">

                                    <img
                                        src={preview}
                                        alt="Product preview"
                                    />


                                    <button
                                        type="button"
                                        onClick={
                                            handleRemoveImage
                                        }
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>

                                </div>

                            ) : (

                                <label
                                    htmlFor="product-image"
                                    className="upload-box"
                                >

                                    <div className="upload-icon">
                                        📷
                                    </div>


                                    <span>
                                        Click to upload image
                                    </span>


                                    <small>
                                        JPG, PNG or WEBP
                                        (Max 5MB)
                                    </small>

                                </label>

                            )}


                            <input
                                id="product-image"
                                type="file"
                                name="image"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={
                                    handleImageChange
                                }
                                hidden
                                disabled={loading}
                            />

                        </div>

                    </div>


                    {/* PRODUCT STATUS */}

                    <div className="form-section">

                        <h2>
                            Product Status
                        </h2>


                        <label className="status-checkbox">

                            <input
                                type="checkbox"
                                name="isActive"
                                checked={
                                    formData.isActive
                                }
                                onChange={handleChange}
                                disabled={loading}
                            />


                            <span className="checkbox-custom"></span>


                            <span className="status-text">

                                <strong>
                                    Active Product
                                </strong>

                                <small>
                                    Product will be visible
                                    in the store
                                </small>

                            </span>

                        </label>

                    </div>


                    {/* ACTIONS */}

                    <div className="form-actions">


                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Adding Product..."
                                : "Add Product"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddProduct;