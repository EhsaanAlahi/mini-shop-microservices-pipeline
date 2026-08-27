import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    fetchProductById,
    editProduct,
    clearSelectedProduct,
} from "../features/products/productSlice";
import "./AddProduct.css"; // same styles reused

function EditProduct() {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { selected, selectedLoading } = useSelector((state) => state.products);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: null, // naya image agar select kiya
        isActive: true,
    });

    const [preview, setPreview] = useState(null); // naya image preview
    const [existingImageUrl, setExistingImageUrl] = useState(null); // purani image (Cloudinary)
    const [saving, setSaving] = useState(false);


    // =========================
    // LOAD EXISTING PRODUCT
    // =========================

    useEffect(() => {
        dispatch(fetchProductById(id));

        return () => {
            dispatch(clearSelectedProduct());
        };
    }, [dispatch, id]);


    useEffect(() => {
        if (selected && selected._id === id) {
            setFormData({
                name: selected.name || "",
                description: selected.description || "",
                price: selected.price ?? "",
                category: selected.category || "",
                stock: selected.stock ?? "",
                image: null,
                isActive: selected.isActive ?? true,
            });

            setExistingImageUrl(selected.imageUrl || null);
        }
    }, [selected, id]);


    // =========================
    // HANDLE INPUT CHANGE
    // =========================

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    // =========================
    // HANDLE IMAGE
    // =========================

    const handleImageChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG or WEBP images are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB.");
            e.target.value = "";
            return;
        }

        setFormData((prev) => ({ ...prev, image: file }));

        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
    };


    const handleRemoveImage = () => {

        setFormData((prev) => ({ ...prev, image: null }));

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview(null);

        const input = document.getElementById("product-image");
        if (input) input.value = "";
    };


    // =========================
    // SUBMIT UPDATE
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (saving) return;

        if (!formData.name.trim()) {
            toast.error("Product name is required.");
            return;
        }

        if (formData.price === "" || Number(formData.price) < 0) {
            toast.error("Please enter a valid price.");
            return;
        }

        if (formData.stock === "" || Number(formData.stock) < 0) {
            toast.error("Please enter a valid stock.");
            return;
        }

        try {

            setSaving(true);

            const data = new FormData();
            data.append("name", formData.name.trim());
            data.append("description", formData.description.trim());
            data.append("price", formData.price);
            data.append("category", formData.category.trim());
            data.append("stock", formData.stock);
            data.append("isActive", String(formData.isActive));

            // sirf tab bhejein agar naya image select kiya ho
            if (formData.image) {
                data.append("image", formData.image);
            }

            await dispatch(editProduct({ id, updates: data })).unwrap();

            toast.success("Product updated successfully!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 800);

        } catch (error) {

            console.error("Update product error:", error);

            if (error?.status === 401 || error?.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("isAuthenticated");
                localStorage.removeItem("user");
                toast.error("Your session has expired.");
                navigate("/login");
                return;
            }

            toast.error(error?.message || "Something went wrong.");

        } finally {
            setSaving(false);
        }
    };


    if (selectedLoading) {
        return (
            <div className="add-product-page">
                <div className="add-product-container">
                    <p>Loading product...</p>
                </div>
            </div>
        );
    }


    return (

        <div className="add-product-page">

            <div className="add-product-container">

                {/* PAGE HEADER */}

                <div className="page-header">
                    <div>
                        <h1>Edit Product</h1>
                        <p>Update this product's details</p>
                    </div>
                </div>


                {/* FORM */}

                <form className="product-form" onSubmit={handleSubmit}>

                    {/* PRODUCT INFORMATION */}

                    <div className="form-section">

                        <h2>Product Information</h2>

                        <div className="form-grid">

                            <div className="form-group full-width">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    rows="5"
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label>Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label>Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="e.g. Electronics"
                                    disabled={saving}
                                />
                            </div>

                        </div>

                    </div>


                    {/* PRODUCT IMAGE */}

                    <div className="form-section">

                        <h2>Product Image</h2>

                        <div className="image-upload">

                            {preview ? (
                                <div className="image-preview">
                                    <img src={preview} alt="New product preview" />
                                    <button type="button" onClick={handleRemoveImage} disabled={saving}>
                                        Remove
                                    </button>
                                </div>
                            ) : existingImageUrl ? (
                                <div className="image-preview">
                                    <img src={existingImageUrl} alt="Current product" />
                                    <label htmlFor="product-image" className="upload-box" style={{ marginTop: 8 }}>
                                        <span>Click to change image</span>
                                    </label>
                                </div>
                            ) : (
                                <label htmlFor="product-image" className="upload-box">
                                    <div className="upload-icon">📷</div>
                                    <span>Click to upload image</span>
                                    <small>JPG, PNG or WEBP (Max 5MB)</small>
                                </label>
                            )}

                            <input
                                id="product-image"
                                type="file"
                                name="image"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleImageChange}
                                hidden
                                disabled={saving}
                            />

                        </div>

                    </div>


                    {/* PRODUCT STATUS */}

                    <div className="form-section">

                        <h2>Product Status</h2>

                        <label className="status-checkbox">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                disabled={saving}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="status-text">
                                <strong>Active Product</strong>
                                <small>Product will be visible in the store</small>
                            </span>
                        </label>

                    </div>


                    {/* ACTIONS */}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/dashboard")}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="submit-button" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditProduct;