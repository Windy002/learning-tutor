// Get main content layout
var main = document.querySelector("main, [class*=chat], [class*=conversation]");
if (main) {
  var s = getComputedStyle(main);
  console.log("MAIN BG:", s.backgroundColor);
  console.log("MAIN MAX-W:", s.maxWidth);
  console.log("MAIN FLEX:", s.flex);
}

// Get the input/textarea area
var ta = document.querySelector("textarea");
if (!ta) ta = document.querySelector("[contenteditable]");
if (!ta) ta = document.querySelector("[role=textbox]");
if (!ta) {
  // try finding the input container
  var bottom = document.querySelector("[class*=bottom], [class*=input-area], [class*=composer]");
  if (bottom) {
    console.log("INPUT CONTAINER:", bottom.className?.slice(0, 200));
    console.log("INPUT TEXT:", bottom.innerText?.substring(0, 500));
  }
}
if (ta) {
  var s = getComputedStyle(ta);
  console.log("INPUT TAG:", ta.tagName);
  console.log("INPUT PLACEHOLDER:", ta.placeholder || ta.getAttribute("data-placeholder"));
  console.log("INPUT BG:", s.backgroundColor);
  console.log("INPUT BORDER:", s.border);
  console.log("INPUT RADIUS:", s.borderRadius);
  console.log("INPUT FONT:", s.fontSize);
  // get parent container
  var p = ta.closest("div");
  if (p) {
    var sp = getComputedStyle(p);
    console.log("INPUT PARENT BG:", sp.backgroundColor);
    console.log("INPUT PARENT BORDER:", sp.border);
    console.log("INPUT PARENT RADIUS:", sp.borderRadius);
    console.log("INPUT PARENT CLASS:", p.className?.slice(0, 300));
  }
}

// Get the page layout structure
console.log("\n=== PAGE LAYOUT ===");
var body = document.body;
var kids = Array.from(body.children).map(function(c) {
  var cs = getComputedStyle(c);
  return {tag: c.tagName, cls: c.className?.slice(0, 80), display: cs.display, w: cs.width, pos: cs.position};
});
console.log(JSON.stringify(kids, null, 2));
