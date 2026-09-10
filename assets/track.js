/* Shop preview hits → CountAPI (no cookies). Once per browser session. */
(function () {
  try {
    var path = location.pathname.replace(/\/+$/, "") || "/";
    if (path.indexOf("/shops/") !== 0) return;

    var key = "pp_v1_" + path.replace(/^\//, "").replace(/\//g, "_");
    var seen = "pp_hit_" + key;
    if (sessionStorage.getItem(seen)) return;
    sessionStorage.setItem(seen, "1");

    var img = new Image();
    img.referrerPolicy = "no-referrer";
    img.src =
      "https://countapi.mileshilliard.com/api/v1/hit/" +
      encodeURIComponent(key) +
      "?t=" +
      Date.now();
  } catch (e) {}
})();
