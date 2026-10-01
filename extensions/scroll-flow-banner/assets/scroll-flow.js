// extensions/scroll-flow-banner/assets/scroll-flow.js
(function () {
  function initScrollFlow() {
    const banners = document.querySelectorAll(".scrollflow-banner-container");
    banners.forEach((container) => {
      const shop = container.getAttribute("data-shop") || window.Shopify?.shop || "";
      const bannerId = container.getAttribute("data-banner-id") || "";

      const query = `shop=${encodeURIComponent(shop)}` + (bannerId ? `&bannerId=${encodeURIComponent(bannerId)}` : "") + `&t=${Date.now()}`;
      
      const endpoints = [
        `/apps/scrollflow?${query}`,
        `/apps/scrollflow/api/storefront/banner?${query}`,
        `/api/storefront/banner?${query}`
      ];

      tryFetchEndpoints(endpoints, 0)
        .then((data) => {
          if (data && data.active && data.settings) {
            container.style.display = "flex";
            applyBannerSettings(container, data.settings);
          } else if (data && data.active === false) {
            container.style.display = "none";
          }
        })
        .catch((err) => {
          console.warn("ScrollFlow banner API fetch notice:", err);
          container.style.display = "flex";
        });
    });
  }

  function tryFetchEndpoints(endpoints, index) {
    if (index >= endpoints.length) {
      return Promise.reject(new Error("All storefront banner endpoints failed"));
    }
    return fetchBannerData(endpoints[index]).catch(() => {
      return tryFetchEndpoints(endpoints, index + 1);
    });
  }

  function fetchBannerData(url) {
    return fetch(url, { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error("HTTP error " + res.status);
      return res.json();
    });
  }

  function applyBannerSettings(container, s) {
    if (s.backgroundColor) container.style.background = s.backgroundColor;
    if (s.textColor) container.style.color = s.textColor;
    if (typeof s.topPadding !== "undefined") container.style.paddingTop = `${s.topPadding}px`;
    if (typeof s.bottomPadding !== "undefined") container.style.paddingBottom = `${s.bottomPadding}px`;

    const track = container.querySelector(".scrollflow-banner-track");
    if (!track) return;

    if (s.messages && Array.isArray(s.messages) && s.messages.length > 0) {
      const doubledMessages = [...s.messages, ...s.messages, ...s.messages, ...s.messages];
      const divider = s.dividerIcon && s.dividerIcon !== "NONE" ? s.dividerIcon : "";
      const ctaHtml = s.hasCta && s.ctaText
        ? `<a href="${s.ctaUrl || '#'}" class="scrollflow-cta-btn" style="background:${s.ctaBg || '#FFFFFF'}; color:${s.ctaColor || '#111827'}; border-radius:${s.ctaRadius || 6}px; display:inline-block; margin-left:8px; padding:3px 10px; font-size:11px; font-weight:700; text-decoration:none;">${s.ctaText} →</a>`
        : "";

      track.innerHTML = doubledMessages
        .map(
          (msg) => `
          <span class="scrollflow-item" style="font-family:${s.fontFamily || 'Inter'}; font-size:${s.fontSize || 14}px; font-weight:${s.fontWeight || '700'}; text-transform:${s.textTransform || 'uppercase'}; letter-spacing:${s.letterSpacing || '1px'}; color:${s.textColor || 'inherit'}; flex-shrink:0; display:inline-flex; align-items:center;">
            <span>${msg}</span>
            ${divider ? `<span class="scrollflow-divider" style="color:${s.dividerColor || s.textColor || 'inherit'}; opacity:0.8; margin:0 6px;">${divider}</span>` : ""}
            ${ctaHtml}
          </span>
        `
        )
        .join("");
    }

    if (s.direction === "Left to Right") {
      track.classList.add("reverse");
    } else {
      track.classList.remove("reverse");
    }

    if (s.speed) {
      const speedMap = { Slow: "25s", Normal: "15s", Fast: "10s", "Very Fast": "6s" };
      track.style.animationDuration = speedMap[s.speed] || "15s";
    }

    if (s.pauseOnHover) track.classList.add("pause-on-hover");
    if (s.pauseOnFocus) track.classList.add("pause-on-focus");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollFlow);
  } else {
    initScrollFlow();
  }
})();

