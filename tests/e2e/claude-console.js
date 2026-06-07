// 找侧栏内的所有按钮，按位置排序
var nav = document.querySelector("nav");
if (!nav) { console.log("NO NAV"); } else {
  var rect = nav.getBoundingClientRect();
  console.log("NAV rect: left=" + rect.left + " top=" + rect.top + " w=" + rect.width + " h=" + rect.height);

  // 找 nav 内最顶部的几个可点击元素
  var topBtns = Array.from(nav.querySelectorAll("button, a"))
    .map(function(el) {
      var r = el.getBoundingClientRect();
      var cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        text: (el.textContent || "").trim().slice(0, 40),
        title: el.getAttribute("title") || el.getAttribute("aria-label") || "",
        left: r.left,
        top: r.top,
        w: Math.round(r.width),
        h: Math.round(r.height),
        bg: cs.backgroundColor,
        borderRadius: cs.borderRadius,
        color: cs.color,
        position: cs.position,
      };
    })
    .filter(function(b) { return b.top < rect.top + 80; }) // 只取顶部80px内的
    .sort(function(a, b) { return a.top - b.top || a.left - b.left; });

  console.log("=== TOP BUTTONS (within 80px of nav top) ===");
  console.log(JSON.stringify(topBtns, null, 2));

  // 也检查 nav 外面的，可能在 main 或 header 里
  console.log("\n=== OUTSIDE NAV (header area) ===");
  var headerEls = Array.from(document.querySelectorAll("header button, header a, [class*=topbar] button"));
  if (headerEls.length === 0) {
    // try finding buttons close to the top-left of the page
    var allBtns = Array.from(document.querySelectorAll("button"))
      .filter(function(b) {
        var r = b.getBoundingClientRect();
        return r.top < 60 && r.left < 350;
      })
      .map(function(b) {
        var r = b.getBoundingClientRect();
        return { text: b.textContent.trim().slice(0,40), title: b.title || b.getAttribute("aria-label") || "", left: r.left, top: r.top, w: Math.round(r.width), h: Math.round(r.height) };
      });
    console.log("Top-left buttons:", JSON.stringify(allBtns, null, 2));
  }
}
