/* =========================================================
   Alargy Shifa — Landing Page Behavior
   Scoped to elements inside .as-page. No global variables are
   created outside this IIFE, so it is safe to enqueue alongside
   other WordPress/Elementor scripts.
   ========================================================= */
(function () {
  'use strict';

  var page = document.querySelector('.as-page');
  if (!page) return;

  /* ---------------------------------------------------------
     CONFIG — edit these to match your WooCommerce setup.
     These are the ONLY values that should need to change when
     prices, the product ID, or the order endpoint change.
     --------------------------------------------------------- */
  var CONFIG = {
    wcProductId: 21,
    orderEndpoint: 'https://vesojnetwork.sajerdala.com/wp-json/alargy/v1/order',
    currency: 'BDT',
    countdownMinutes: 45 /* falls back if data-minutes isn't set on #asCountdown */
  };

  /* ---------------------------------------------------------
     STATE
     --------------------------------------------------------- */
  var state = {
    pkg: 2,          /* 1 or 2, matches data-pkg on .as-pkg buttons */
    price: 1400,
    oldPrice: 1800,
    label: '২ ফাইল (সম্পূর্ণ কোর্স)',
    sub: '৬০টি বটিকা × ২ ফাইল | সম্পূর্ণ ২ মাসের কোর্স',
    zone: 'dhaka',   /* 'dhaka' | 'outside' */
    fee: 60
  };

  /* ---------------------------------------------------------
     UTIL
     --------------------------------------------------------- */
  function bn(num) {
    var digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, function (d) { return digits[d]; });
  }
  function money(num) { return '৳ ' + bn(num); }
  function $(sel, ctx) { return (ctx || page).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || page).querySelectorAll(sel)); }

  /* ---------------------------------------------------------
     COUNTDOWN TIMER (urgency bar)
     Free-running visual countdown; resets on page load.
     Does not gate the offer itself — the offer/price logic
     lives in the package selector below.
     --------------------------------------------------------- */
  function initCountdown() {
    var el = $('#asCountdown');
    if (!el) return;
    var minutes = parseInt(el.getAttribute('data-minutes'), 10) || CONFIG.countdownMinutes;
    var end = Date.now() + minutes * 60 * 1000;

    function tick() {
      var remaining = Math.max(0, end - Date.now());
      var m = Math.floor(remaining / 60000);
      var s = Math.floor((remaining % 60000) / 1000);
      el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      if (remaining <= 0) {
        clearInterval(timer);
        end = Date.now() + minutes * 60 * 1000; /* loop the offer window */
      }
    }
    var timer = setInterval(tick, 1000);
    tick();
  }

  /* ---------------------------------------------------------
     GALLERY (thumbnail swap)
     --------------------------------------------------------- */
  function initGallery() {
    var main = $('#asMainImg');
    var thumbs = $all('.as-thumb');
    if (!main || !thumbs.length) return;
    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var full = btn.getAttribute('data-full');
        if (full) main.setAttribute('src', full);
        thumbs.forEach(function (b) { b.classList.remove('as-thumb-active'); });
        btn.classList.add('as-thumb-active');
      });
    });
  }

  /* ---------------------------------------------------------
     PACKAGE + DELIVERY SELECTION -> PRICE CALCULATION
     --------------------------------------------------------- */
  function selectPackage(btn) {
    $all('.as-pkg').forEach(function (b) { b.classList.remove('as-pkg-selected'); });
    btn.classList.add('as-pkg-selected');

    state.pkg = parseInt(btn.getAttribute('data-pkg'), 10);
    state.price = parseInt(btn.getAttribute('data-price'), 10);
    state.oldPrice = parseInt(btn.getAttribute('data-old'), 10);
    state.label = btn.getAttribute('data-label');
    state.sub = btn.getAttribute('data-sub');

    recalc();
  }

  function selectDelivery(btn) {
    $all('.as-delivery-btn').forEach(function (b) { b.classList.remove('as-delivery-selected'); });
    btn.classList.add('as-delivery-selected');
    state.zone = btn.getAttribute('data-zone');
    state.fee = parseInt(btn.getAttribute('data-fee'), 10);
    recalc();
  }

  function recalc() {
    var freeDelivery = state.pkg === 2; /* full 2-file course always ships free */
    var deliveryCharge = freeDelivery ? 0 : state.fee;
    var total = state.price + deliveryCharge;

    /* Hero price */
    var heroPrice = $('#asHeroPrice');
    var heroOld = $('#asHeroOldPrice');
    if (heroPrice) heroPrice.textContent = bn(state.price);
    if (heroOld) heroOld.textContent = bn(state.oldPrice);

    /* Summary card */
    var sumSub = $('#asSummarySub');
    var sumProduct = $('#asSumProduct');
    var sumDelivery = $('#asSumDelivery');
    var sumTotal = $('#asSumTotal');
    var submitTotal = $('#asSubmitTotal');
    var deliveryNote = $('#asDeliveryNote');

    if (sumSub) sumSub.textContent = state.sub;
    if (sumProduct) sumProduct.textContent = money(state.price);
    if (sumDelivery) {
      sumDelivery.textContent = freeDelivery ? 'ফ্রি 🎁' : money(deliveryCharge);
      sumDelivery.style.color = freeDelivery ? 'var(--as-g3)' : 'inherit';
    }
    if (sumTotal) sumTotal.textContent = money(total);
    if (submitTotal) submitTotal.textContent = bn(total);

    if (deliveryNote) {
      deliveryNote.textContent = freeDelivery
        ? '🎉 ২ ফাইলের সম্পূর্ণ কোর্স অর্ডারে ডেলিভারি সম্পূর্ণ বিনামূল্যে!'
        : ('🚚 ' + (state.zone === 'dhaka'
            ? 'ঢাকার ভেতরে ডেলিভারি চার্জ ৳৬০ — পণ্য পাওয়ার সময় পরিশোধ করুন।'
            : 'ঢাকার বাইরে ডেলিভারি চার্জ ৳১২০ — পণ্য পাওয়ার সময় পরিশোধ করুন।'));
    }

    return total;
  }

  function initPricing() {
    $all('.as-pkg').forEach(function (btn) {
      btn.addEventListener('click', function () { selectPackage(btn); });
    });
    $all('.as-delivery-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { selectDelivery(btn); });
    });
    recalc();
  }

  /* ---------------------------------------------------------
     ORDER SUBMISSION
     Creates a WooCommerce Cash-on-Delivery order via the same
     REST endpoint and tracking events as the existing site:
     - GTM dataLayer 'purchase' event (GA4 schema)
     - Meta Pixel 'Purchase' event
     Neither the GTM container ID nor the Pixel ID are touched
     here — they are set once, in the <head> of index.html.
     --------------------------------------------------------- */
  function resetSubmitButton(btn, label) {
    btn.disabled = false;
    var labelEl = $('#asSubmitLabel');
    if (labelEl) labelEl.innerHTML = label;
  }

  function trackPurchase(orderId, total) {
    /* Meta Pixel */
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        value: total,
        currency: CONFIG.currency,
        content_name: state.pkg === 2 ? 'Alargy Shifa 2 File' : 'Alargy Shifa 1 File',
        content_type: 'product',
        order_id: String(orderId)
      });
    }
    /* GTM / GA4 dataLayer */
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      order_id: orderId,
      value: total,
      currency: CONFIG.currency,
      package: state.pkg === 2 ? '2_file' : '1_file'
    });
  }

  function showSuccessModal(name, orderId, total, phone) {
    var modal = $('#asModal');
    var msg = $('#asModalMsg');
    if (msg) {
      msg.textContent = 'ধন্যবাদ ' + name + '! আপনার অর্ডার #' + orderId + ' সফলভাবে গ্রহণ হয়েছে। ' +
        (state.pkg === 2 ? '২ ফাইল' : '১ ফাইল') + ' Alargy Shifa, মোট: ৳' + total + '। ' +
        phone + ' নম্বরে শীঘ্রই কনফার্মেশন কল পাবেন।';
    }
    if (modal) {
      modal.classList.add('as-show');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function hideModal() {
    var modal = $('#asModal');
    if (modal) {
      modal.classList.remove('as-show');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function initOrderForm() {
    var form = $('#asOrderForm');
    var submitBtn = $('#asSubmitBtn');
    var closeBtn = $('#asModalClose');
    if (!form || !submitBtn) return;

    if (closeBtn) closeBtn.addEventListener('click', hideModal);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = $('#asName').value.trim();
      var phone = $('#asPhone').value.trim();
      var address = $('#asAddress').value.trim();

      if (!name || !phone || !address) {
        alert('অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।');
        return;
      }

      var freeDelivery = state.pkg === 2;
      var deliveryCharge = freeDelivery ? 0 : state.fee;
      var total = state.price + deliveryCharge;

      var originalLabel = $('#asSubmitLabel') ? $('#asSubmitLabel').innerHTML : '';
      submitBtn.disabled = true;
      var labelEl = $('#asSubmitLabel');
      if (labelEl) labelEl.textContent = '⏳ অর্ডার পাঠানো হচ্ছে...';

      var nameParts = name.split(' ');
      var firstName = nameParts[0] || name;
      var lastName = nameParts.slice(1).join(' ') || '.';

      var body = {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: false,
        status: 'processing',
        billing: {
          first_name: firstName, last_name: lastName,
          address_1: address, city: state.zone === 'dhaka' ? 'ঢাকা' : '',
          country: 'BD', phone: phone,
          email: phone.replace(/\D/g, '') + '@alargyshifa.order'
        },
        shipping: {
          first_name: firstName, last_name: lastName,
          address_1: address, country: 'BD'
        },
        line_items: [{
          product_id: CONFIG.wcProductId,
          quantity: state.pkg,
          subtotal: String(state.price.toFixed ? state.price.toFixed(2) : state.price),
          total: String(state.price)
        }],
        fee_lines: deliveryCharge > 0
          ? [{ name: 'ডেলিভারি চার্জ (' + (state.zone === 'dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে') + ')', total: String(deliveryCharge) }]
          : [],
        meta_data: [
          { key: '_order_source', value: 'Landing Page' },
          { key: '_customer_phone', value: phone },
          { key: '_package', value: state.pkg === 2 ? '2 file' : '1 file' },
          { key: '_delivery_charge', value: String(deliveryCharge) }
        ]
      };

      fetch(CONFIG.orderEndpoint, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (r) {
          if (!r.ok && r.status !== 201) {
            return r.json().then(function (d) { throw new Error(d.message || ('HTTP ' + r.status)); });
          }
          return r.json();
        })
        .then(function (d) {
          resetSubmitButton(submitBtn, originalLabel);
          if (d && d.id) {
            trackPurchase(d.id, total);
            showSuccessModal(name, d.id, total, phone);
            form.reset();
            selectPackage($('#asPkg2'));
            selectDelivery($('.as-delivery-btn[data-zone="dhaka"]'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            throw new Error((d && d.message) || 'Unexpected response');
          }
        })
        .catch(function (err) {
          console.warn('Alargy Shifa order error:', err.message);
          resetSubmitButton(submitBtn, originalLabel);
          alert('⚠️ নেটওয়ার্ক সমস্যা। পেজ রিলোড করে আবার চেষ্টা করুন।');
        });
    });
  }

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initCountdown();
    initGallery();
    initPricing();
    initOrderForm();
  });
})();
