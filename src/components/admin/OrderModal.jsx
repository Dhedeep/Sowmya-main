import React, { useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { X, Printer } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

// Path to your peacock logo image (the same one used in the site header).
// If the file can't be loaded the label prints fine without it.
const LOGO_SRC = '/logo.png';

// Label font. Change this one line to try another font installed on your PC.
const LABEL_FONT = "'Segoe UI', 'Trebuchet MS', Tahoma, Arial, sans-serif";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

// Picks a layout tier from the number of distinct products.
const getTier = (count) => {
  if (count <= 1) return '1';
  if (count === 2) return '2';
  if (count === 3) return '3';
  if (count === 4) return '4';
  if (count <= 6) return '6';
  return 'many'; // 7+ : compact grid, flows onto another page if needed
};

// Resolves once every <img> inside `root` has loaded (or failed / timed out).
const waitForImages = async (root, timeout = 8000) => {
  if (!root) return;
  const imgs = Array.from(root.querySelectorAll('img'));

  const loaders = imgs.map((img) => {
    const ready = img.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
    return ready.then(() =>
      typeof img.decode === 'function' ? img.decode().catch(() => {}) : undefined
    );
  });

  await Promise.race([
    Promise.all(loaders),
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]);

  // let the browser lay out / paint once more before the print dialog opens
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
};

/* ------------------------------------------------------------------ */
/*  Styles (self-contained: no Tailwind / dark-mode dependency)        */
/* ------------------------------------------------------------------ */

const LABEL_CSS = `
.sl-label {
  --purple: #6f3a80;
  --crimson: #c2305a;
  --grey: #777;

  position: relative;
  width: 4in;
  box-sizing: border-box;
  padding: 0.18in 0.2in 0.16in 0.46in;
  margin: 0 auto;
  background: #fff;
  color: #1a1a1a;
  font-family: ${LABEL_FONT};
  line-height: 1.3;
  display: flex;
  flex-direction: column;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sl-label * { box-sizing: border-box; }
.sl-label p, .sl-label h1, .sl-label h3 { line-height: 1.22; }

/* purple vertical bar on the left */
.sl-bar {
  position: absolute;
  left: 0.17in;
  top: 0.18in;
  bottom: 0.16in;
  width: 0.12in;
  background: var(--purple);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ---------- Header: logo + wordmark ---------- */
.sl-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}
.sl-logo { height: var(--logo, 54px); width: auto; max-width: 90px; object-fit: contain; flex: 0 0 auto; }
.sl-wordmark { display: flex; flex-direction: column; line-height: 1.1; }
.sl-wm-top {
  font-size: 19pt;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--crimson);
  margin: 0;
}
.sl-wm-bottom {
  font-size: 12pt;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #222;
  margin: 0;
}

/* ---------- Sections ---------- */
.sl-section {
  border-top: 1px dotted #bbb;
  padding-top: var(--sec-pad);
  margin-top: var(--sec-gap);
}

.sl-lbl {
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: var(--grey);
  margin: 0 0 3px 0;
  text-transform: uppercase;
}

.sl-name {
  font-size: 15pt;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.15;
  margin: 0 0 4px 0;
  overflow-wrap: anywhere;
}
.sl-addr {
  font-size: 10.5pt;
  text-transform: uppercase;
  margin: 0;
  overflow-wrap: anywhere;
}
.sl-email {
  font-size: 9.5pt;
  margin: 2px 0 0 0;
  color: #222;
  overflow-wrap: anywhere;
}
.sl-phone {
  font-size: 12pt;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--purple);
  margin: 5px 0 0 0;
}

/* ---------- Products (fabric details) ---------- */
.sl-products {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: var(--pgap) 8px;
}
.sl-item {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  break-inside: avoid;
  page-break-inside: avoid;
}
.sl-img, .sl-img-empty {
  width: var(--img);
  height: var(--img);
  flex: 0 0 var(--img);
  object-fit: cover;
  border: 1px solid #999;
  border-radius: 3px;
  background: #eee;
}
.sl-item-text { min-width: 0; flex: 1 1 auto; line-height: 1.2; }
.sl-item-name {
  font-size: var(--name);
  font-weight: 700;
  text-transform: uppercase;
  margin: 0 0 2px 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.sl-item-meta {
  font-size: var(--meta);
  color: #222;
  margin: 0;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}
.sl-sep { color: #888; }

/* ---------- Order line (small) ---------- */
.sl-orderline {
  font-size: 8.5pt;
  color: var(--grey);
  margin: var(--sec-gap) 0 0 0;
  overflow-wrap: anywhere;
}
.sl-orderline b { color: #333; font-weight: 700; }
.sl-orderline .sl-hl {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  background: #d9cce0;
  color: #2a1033;
  font-weight: 800;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ---------- From ---------- */
.sl-from {
  margin-top: auto;               /* pins FROM to the bottom when content is short */
  border-top: 2px solid var(--purple);
  padding-top: 6px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.sl-from-name { font-size: 13pt; font-weight: 700; margin: var(--from-gap, 12px) 0 0 0; }
.sl-from-phone { font-size: 11pt; font-weight: 700; margin: 1px 0 0 0; }
.sl-from-gap { height: 4px; }

/* ---------- Tiers: spacing + product sizing by number of items ---------- */
.sl-t-1    { --sec-pad: 6px; --sec-gap: 8px;  --cols: 1; --img: 84px;  --name: 11pt;   --meta: 9.5pt; --pgap: 6px; --logo: 50px; }
.sl-t-2    { --sec-pad: 5px; --sec-gap: 7px;  --cols: 1; --img: 58px;  --name: 10pt;   --meta: 9pt;   --pgap: 5px; --logo: 48px; }
.sl-t-3    { --sec-pad: 5px; --sec-gap: 6px;  --cols: 1; --img: 48px;  --name: 9.5pt;  --meta: 8.5pt; --pgap: 4px; --logo: 46px; }
.sl-t-4    { --sec-pad: 4px; --sec-gap: 5px;  --cols: 2; --img: 44px;  --name: 8.5pt;  --meta: 8pt;   --pgap: 5px; --logo: 44px; --from-gap: 6px; }
.sl-t-6    { --sec-pad: 4px; --sec-gap: 4px;  --cols: 2; --img: 38px;  --name: 8pt;    --meta: 8pt;   --pgap: 3px; --logo: 40px; --from-gap: 4px; }
.sl-t-many { --sec-pad: 4px; --sec-gap: 4px;  --cols: 2; --img: 34px;  --name: 8pt;    --meta: 8pt;   --pgap: 3px; --logo: 38px; --from-gap: 4px; }

/* ---------- Print root lives outside the React tree ---------- */
.sl-print-root { display: none; }

@media print {
  @page {
    size: 4in 6in;
    margin: 0;
  }

  html, body {
    width: 4in !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    overflow: visible !important;
  }

  /* Remove the whole app (dashboard, modal, toasts...) from layout —
     display:none, not visibility:hidden, so it takes no space / pages. */
  body > *:not(.sl-print-root) {
    display: none !important;
  }

  .sl-print-root {
    display: block !important;
    position: static !important;
    width: 4in !important;
    margin: 0 !important;
    padding: 0 !important;
    opacity: 1 !important;
    transform: none !important;
  }

  /* Beat any global print rule elsewhere in the app (e.g. a
     "body * { visibility: hidden }" in index.css) that would blank the label. */
  .sl-print-root,
  .sl-print-root * {
    visibility: visible !important;
  }

  /* --fit (set from JS right before printing) shrinks the whole label
     if its content is taller than one 4x6 sheet, so it never spills over. */
  .sl-print-root .sl-label {
    width: calc(4in / var(--fit, 1)) !important;
    min-height: calc(5.8in / var(--fit, 1));
    zoom: var(--fit, 1);
    margin: 0 !important;
  }
}
`;

/* ------------------------------------------------------------------ */
/*  Label                                                              */
/* ------------------------------------------------------------------ */

const ShippingLabel = ({ order, numberOfItems, totalQuantity }) => {
  const addr = order.shippingAddress;
  const tier = getTier(numberOfItems);
  const email =
    addr?.email ||
    order.email ||
    order.userEmail ||
    order.customerEmail ||
    order.user?.email ||
    '';
  const cityLine = addr
    ? [addr.city, addr.state].filter(Boolean).join(', ') +
      (addr.pincode ? ` - ${addr.pincode}` : '')
    : '';

  return (
    <div className={`sl-label sl-t-${tier}`} data-item-count={numberOfItems}>
      <div className="sl-bar" />

      {/* Brand */}
      <div className="sl-header">
        <img
          className="sl-logo"
          src={LOGO_SRC}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="sl-wordmark">
          <p className="sl-wm-top">SOWMYA</p>
          <p className="sl-wm-bottom">SELECTIONS</p>
        </div>
      </div>

      {/* Ship To */}
      <div className="sl-section">
        <p className="sl-lbl">Ship To</p>
        {addr ? (
          <>
            <p className="sl-name">{addr.fullName}</p>
            <p className="sl-addr">{addr.address}</p>
            <p className="sl-addr">{cityLine}</p>
            <p className="sl-phone">PHONE: {addr.phone}</p>
            {email && <p className="sl-email">Email: {email}</p>}
          </>
        ) : (
          <p className="sl-addr">No shipping address available</p>
        )}
      </div>

      {/* Fabric details (products with photos) */}
      <div className="sl-section">
        <p className="sl-lbl">Fabric Details</p>
        <div className="sl-products">
          {order.items?.map((item, index) => (
            <div className="sl-item" key={index}>
              {item.image ? (
                <img
                  className="sl-img"
                  src={item.image}
                  alt={item.name || 'Product'}
                  loading="eager"
                />
              ) : (
                <div className="sl-img-empty" />
              )}
              <div className="sl-item-text">
                <p className="sl-item-name">{item.name}</p>
                <p className="sl-item-meta">
                  Colour: {item.color || 'Not specified'}
                  <span className="sl-sep"> | </span>
                  Qty : {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order details — one compact line */}
      <p className="sl-orderline">
        Order ID: <b>{order.id}</b>
        <br />
        <span className="sl-hl">Items: {numberOfItems}</span>
        &nbsp;&nbsp;
        <span className="sl-hl">Total Qty: {totalQuantity}</span>
      </p>

      {/* From — always visible, pinned to the bottom of the label */}
      <div className="sl-from">
        <div className="sl-from-gap" />
        <p className="sl-from-name">FROM: SOWMYA SELECTIONS</p>
        <p className="sl-from-phone">PH: 9121006787</p>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

const OrderModal = ({ isOpen, onClose, order }) => {
  const printRootRef = useRef(null);
  const previewRef = useRef(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [fit, setFit] = useState(1);

  if (!isOpen || !order) return null;

  const numberOfItems = order.items?.length || 0;
  const totalQuantity =
    order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;

  const handlePrint = async () => {
    if (isPreparing) return;
    setIsPreparing(true);
    try {
      // make sure every product image is loaded and decoded before printing
      await waitForImages(printRootRef.current);

      // If the label is taller than one 4x6 sheet (5.8in usable), shrink it
      // to fit instead of spilling onto a second sheet.
      const el = previewRef.current;
      const maxH = 5.8 * 96;
      const h = el ? el.scrollHeight : 0;
      const next = h > maxH ? Math.max(0.55, (maxH / h) * 0.97) : 1;
      flushSync(() => setFit(next)); // apply the shrink before the print dialog opens
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    } finally {
      setIsPreparing(false);
    }
    window.print();
  };

  const label = (
    <ShippingLabel
      order={order}
      numberOfItems={numberOfItems}
      totalQuantity={totalQuantity}
    />
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style>{LABEL_CSS}</style>

      {/* On-screen modal: shows an exact-size (4in wide) preview of the label */}
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
        <div className="px-4 pt-3 pb-4">
          <div className="flex justify-end items-center mb-3 gap-4">
            <button
              onClick={handlePrint}
              disabled={isPreparing}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-60"
            >
              <Printer size={18} />
              <span className="text-sm font-medium">
                {isPreparing ? 'Preparing…' : 'Print'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <div ref={previewRef} style={{ border: '1px dashed #9ca3af', width: 'fit-content', margin: '0 auto' }}>
              {label}
            </div>
          </div>
        </div>
      </div>

      {/* Print-only copy, mounted directly under <body> so no modal / flex /
          overflow / max-width ancestor can restrict it. Hidden on screen. */}
      {createPortal(
        <div className="sl-print-root" ref={printRootRef} style={{ '--fit': fit }}>
          {label}
        </div>,
        document.body
      )}
    </div>
  );
};

export default OrderModal;
