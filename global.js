console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// const navLinks = $$("nav a");
// console.log(navLinks);
// const currentLink = Array.from(navLinks).find(
// (a) => a.host === location.host && a.pathname === location.pathname);
// currentLink?.classList.add('current');


// Define your site's pages (internal = relative, external = full URL)
let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume/", title: "Resume" },
  { url: "https://github.com/haechristine", title: "GitHub" }
];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/portfolio/"                  
  : "/portfolio/";  // ← replace with your actual repo name

// Create and prepend <nav> to the body
let nav = document.createElement("nav");
document.body.prepend(nav);

// Loop through each page and build the nav links
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Add base path to internal links
  url = !url.startsWith("http") ? BASE_PATH + url : url;

  // Create the <a> element
  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = "_blank";
  }

  // Add the link to the nav
  nav.append(a);
}

