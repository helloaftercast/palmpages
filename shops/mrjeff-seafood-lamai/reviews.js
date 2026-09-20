(function () {
  var board = document.querySelector("[data-reviews]");
  if (!board) return;
  var track = board.querySelector(".g-track");
  var prev = board.querySelector("[data-rev-prev]");
  var next = board.querySelector("[data-rev-next]");

  function step() {
    var card = track && track.querySelector(".g-card");
    return card ? card.getBoundingClientRect().width + 16 : 280;
  }

  if (prev && next && track) {
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: "smooth" });
    });
  }

  board.querySelectorAll(".g-card").forEach(function (card) {
    var text = card.querySelector(".g-text");
    var more = card.querySelector(".g-more");
    if (!text || !more) return;
    if (text.scrollHeight > text.clientHeight + 4) more.hidden = false;
    more.addEventListener("click", function () {
      var open = card.classList.toggle("is-open");
      more.hidden = open;
    });
  });
})();
