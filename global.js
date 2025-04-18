console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");
console.log(navLinks);
const currentLink = Array.from(navLinks).find(
(a) => a.host === location.host && a.pathname === location.pathname);
currentLink?.classList.add('current');
