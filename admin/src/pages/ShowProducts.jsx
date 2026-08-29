// src/pages/ShowProducts.jsx
//
// Public storefront page. Shows every product from the catalog (fetched via
// the existing productSlice/fetchProducts thunk) in an e-commerce style grid.
// Meant to live at the "/" route so visitors land on the shop, with an
// "Admin Login" button top-right that sends store staff to /login.
//
// NOTE ON FIELD NAMES: I don't have your product schema (AddProduct.jsx /
// backend model) in front of me, so the getters below try a couple of common
// field-name variants (name/title, price/cost, stock/quantity, image/imageUrl).
// If your product objects use different keys, just adjust the getters at the
// top of this file — everything else works off them.

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../features/products/productSlice";
import { addToCart, toggleCart, selectCartCount } from "../features/cart/cartSlice";
import CartDrawer from "./CartDrawer";
import "./ShowProducts.css";

// If your backend serves uploaded images from a different path/port,
// change this one line.
const IMAGE_BASE_URL = "http://localhost:3002/uploads/";

function resolveImage(product) {
  const raw =
    product?.image || product?.imageUrl || product?.img || product?.photo || "";
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${IMAGE_BASE_URL}${raw}`;
}

function getName(p) {
  return p?.name || p?.title || "Untitled product";
}
function getPrice(p) {
  const v = p?.price ?? p?.cost ?? 0;
  return Number(v) || 0;
}
function getStock(p) {
  const v = p?.stock ?? p?.quantity ?? p?.qty;
  return v === undefined || v === null ? null : Number(v);
}
function getDescription(p) {
  return p?.description || p?.desc || "";
}

export default function ShowProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.products);
  const cartCount = useSelector(selectCartCount);
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const filtered = useMemo(() => {
    const list = items || [];
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((p) => getName(p).toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="shop">
      <header className="shop-header">
        <div className="shop-header__inner">
          <div className="shop-brand">
            <span className="shop-brand__mark" aria-hidden="true">
              ◆
            </span>
            <span className="shop-brand__name">Mini Shop</span>
          </div>

          <div className="shop-search">
            <svg
              className="shop-search__icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>

          <div className="shop-header__actions">
            <button
              type="button"
              className="cart-icon-btn"
              onClick={() => dispatch(toggleCart())}
              aria-label="Open cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="20.5" r="1.5" fill="currentColor" />
                <circle cx="17.5" cy="20.5" r="1.5" fill="currentColor" />
              </svg>
              {cartCount > 0 && <span className="cart-icon-btn__badge">{cartCount}</span>}
            </button>

            <button
              type="button"
              className="admin-login-btn"
              onClick={() => navigate("/login")}
            >
              Admin Login
            </button>
          </div>
        </div>
      </header>

      <section className="shop-hero">
        <p className="shop-hero__eyebrow">Welcome to the store</p>
        <h1 className="shop-hero__title">Fresh picks, honestly priced.</h1>
        <p className="shop-hero__meta">
          {loading
            ? "Loading catalog…"
            : `${(items || []).length} product${
                (items || []).length === 1 ? "" : "s"
              } on the shelf`}
        </p>
      </section>

      <main className="shop-main">
        {error && (
          <div className="shop-state shop-state--error">
            Couldn't load products: {error}
          </div>
        )}

        {!error && loading && (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="product-card product-card--skeleton" key={i} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="shop-state shop-state--empty">
            <p>
              {query
                ? `No products match "${query}".`
                : "No products yet — check back soon."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="product-grid">
            {filtered.map((p) => {
              const stock = getStock(p);
              const outOfStock = stock !== null && stock <= 0;
              const img = resolveImage(p);
              return (
                <article
                  className={`product-card${outOfStock ? " product-card--out" : ""}`}
                  key={p._id || getName(p)}
                >
                  <div className="product-card__image-wrap">
                    {img ? (
                      <img
                        src={img}
                        alt={getName(p)}
                        className="product-card__image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-card__placeholder">No image</div>
                    )}
                    <span className="product-card__tag">
                      ${getPrice(p).toFixed(2)}
                    </span>
                    {outOfStock && (
                      <span className="product-card__badge">Sold out</span>
                    )}
                  </div>
                  <div className="product-card__body">
                    <h3 className="product-card__name">{getName(p)}</h3>
                    {getDescription(p) && (
                      <p className="product-card__desc">{getDescription(p)}</p>
                    )}
                    {stock !== null && !outOfStock && (
                      <p className="product-card__stock">{stock} in stock</p>
                    )}
                    <button
                      type="button"
                      className="product-card__add-btn"
                      disabled={outOfStock}
                      onClick={() => handleAddToCart(p)}
                    >
                      {outOfStock ? "Out of stock" : "Add to Cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="shop-footer">
        <p>Mini Shop — a small catalog, carefully kept.</p>
      </footer>

      <CartDrawer />
    </div>
  );
}