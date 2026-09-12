(function () {
  const layer = document.querySelector("[data-zoom-layer]");
  if (!layer) return;

  const img = layer.querySelector("img");
  const back = layer.querySelector(".zoom-back");
  const ease = "cubic-bezier(.2,.82,.2,1)";
  let last = null;
  let closing = false;

  function fit(nw, nh) {
    const maxW = Math.min(window.innerWidth * 0.92, nw);
    const maxH = window.innerHeight * 0.88;
    const ratio = nw / nh;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    return {
      left: (window.innerWidth - w) / 2,
      top: (window.innerHeight - h) / 2,
      width: w,
      height: h
    };
  }

  function place(el, box, animate) {
    img.style.transition = animate
      ? "left .5s " + ease + ", top .5s " + ease + ", width .5s " + ease + ", height .5s " + ease
      : "none";
    img.style.left = box.left + "px";
    img.style.top = box.top + "px";
    img.style.width = box.width + "px";
    img.style.height = box.height + "px";
  }

  function openFrom(btn) {
    const srcImg = btn.querySelector("img");
    const src = btn.getAttribute("data-zoom") || (srcImg && (srcImg.currentSrc || srcImg.src));
    const startEl = srcImg || btn;
    const start = startEl.getBoundingClientRect();
    last = startEl;
    closing = false;
    img.alt = (srcImg && srcImg.alt) || btn.getAttribute("data-zoom-alt") || "";
    img.src = src;
    layer.hidden = false;
    document.body.classList.add("zoom-lock");
    place(img, start, false);
    back.style.opacity = "0";

    function reveal(nw, nh) {
      if (closing) return;
      place(img, fit(nw || start.width * 2, nh || start.height * 2), true);
      back.style.transition = "opacity .35s ease";
      back.style.opacity = "1";
      layer.classList.add("is-open");
    }

    requestAnimationFrame(function () {
      if (srcImg && srcImg.naturalWidth) {
        reveal(srcImg.naturalWidth, srcImg.naturalHeight);
        return;
      }
      if (img.complete && img.naturalWidth) {
        reveal(img.naturalWidth, img.naturalHeight);
        return;
      }
      img.addEventListener("load", function () {
        reveal(img.naturalWidth, img.naturalHeight);
      }, { once: true });
    });
  }

  function close() {
    if (layer.hidden || closing) return;
    closing = true;
    const end = last
      ? last.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 24, height: 24 };
    place(img, end, true);
    back.style.opacity = "0";
    layer.classList.remove("is-open");
    window.setTimeout(function () {
      layer.hidden = true;
      document.body.classList.remove("zoom-lock");
      closing = false;
    }, 500);
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-zoom]");
    if (btn) {
      e.preventDefault();
      openFrom(btn);
      return;
    }
    if (e.target.closest("[data-zoom-close]")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
