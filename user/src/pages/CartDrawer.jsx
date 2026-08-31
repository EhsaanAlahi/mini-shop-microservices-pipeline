// src/pages/CartDrawer.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  closeCart,
  increaseQty,
  decreaseQty,
  removeItem,
  checkout,
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

function getStockOf(products, productId) {
  const live = products.find((p) => p._id === productId);
  return Number(live?.stock ?? live?.quantity ?? 0);
}

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, isOpen, checkingOut } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.products.items);
  const total = useSelector(selectCartTotal);

  const handleCheckout = async () => {
    const result = await dispatch(checkout());
    if (checkout.fulfilled.match(result)) {
      toast.success("Order placed — thanks for shopping with us!");
    } else {
      toast.error(result.payload || "Checkout failed, please try again");
    }
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
            {items.map((item) => {
              const maxStock = getStockOf(products, item._id);
              const atMax = item.qty >= maxStock;
              return (
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
                        onClick={() => dispatch(decreaseQty(item._id))}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        disabled={atMax}
                        onClick={() =>
                          dispatch(increaseQty({ id: item._id, maxStock }))
                        }
                        aria-label={`Increase quantity of ${item.name}`}
                        title={atMax ? "No more stock available" : undefined}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() => dispatch(removeItem(item._id))}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
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
              disabled={checkingOut}
              onClick={handleCheckout}
            >
              {checkingOut ? "Placing order…" : "Checkout"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}