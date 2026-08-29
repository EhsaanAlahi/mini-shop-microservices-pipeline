// src/pages/CartDrawer.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  closeCart,
  increaseCartQty,
  decreaseCartQty,
  removeFromCart,
  clearCart,
  selectCartTotal,
} from "../features/cart/cartSlice";
import "./CartDrawer.css";

// Same image-base convention as ShowProducts.jsx — change if your backend
// serves uploads from a different path.
const IMAGE_BASE_URL = "http://localhost:3002/uploads/";

function resolveImage(raw) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${IMAGE_BASE_URL}${raw}`;
}

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);
  const total = useSelector(selectCartTotal);

  const handleCheckout = () => {
    if (items.length === 0) return;
    // No payment/order backend here — this just simulates placing the
    // order and empties the cart. Wire this to a real orders API later.
    toast.success("Order placed — thanks for shopping with us!");
    dispatch(clearCart());
    dispatch(closeCart());
  };

  return (
    <>
      <div
        className={`cart-overlay${isOpen ? " cart-overlay--visible" : ""}`}
        onClick={() => dispatch(closeCart())}
        aria-hidden={!isOpen}
      />
      <aside
        className={`cart-drawer${isOpen ? " cart-drawer--open" : ""}`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <div className="cart-drawer__header">
          <h2>Your Cart</h2>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={() => dispatch(closeCart())}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <ul className="cart-drawer__list">
            {items.map((item) => (
              <li className="cart-item" key={item._id}>
                <div className="cart-item__image-wrap">
                  {resolveImage(item.image) ? (
                    <img src={resolveImage(item.image)} alt={item.name} />
                  ) : (
                    <div className="cart-item__placeholder">No image</div>
                  )}
                </div>
                <div className="cart-item__body">
                  <p className="cart-item__name">{item.name}</p>
                  <p className="cart-item__price">${item.price.toFixed(2)}</p>
                  <div className="cart-item__qty">
                    <button
                      type="button"
                      onClick={() => dispatch(decreaseCartQty(item._id))}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(increaseCartQty(item._id))}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="cart-item__remove"
                  onClick={() => dispatch(removeFromCart(item._id))}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              className="cart-drawer__checkout"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}