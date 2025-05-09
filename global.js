console.log('IT’S ALIVE!');

// Define your site's pages (internal = relative, external = full URL)
let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume/", title: "Resume" },
  { url: "meta/", title: "Meta" },
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

// Insert the color scheme toggle at the top of the body
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="color-scheme-toggle">
        <option value="automatic">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );
  
  // Get the toggle element
  const colorSchemeToggle = document.getElementById('color-scheme-toggle');
  const root = document.documentElement;
  
  // Helper function to update color-scheme on the root
  function applyColorScheme(scheme) {
    if (scheme === 'automatic') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const actualScheme = prefersDark ? 'dark' : 'light';
      root.style.colorScheme = actualScheme;
      root.setAttribute('data-theme', actualScheme);
    //   root.style.colorScheme = prefersDark ? 'dark' : 'light';
    //   root.removeAttribute('data-theme'); 
    } else {
      root.style.colorScheme = scheme;
      root.setAttribute('data-theme', scheme); // trigger your CSS
    }
  }
  
  // Load saved preference or fall back to automatic
  const savedScheme = localStorage.getItem('color-scheme') || 'automatic';
  colorSchemeToggle.value = savedScheme;
  applyColorScheme(savedScheme);
  
  // Listen for changes
  colorSchemeToggle.addEventListener('change', (event) => {
    const selected = event.target.value;
    localStorage.setItem('color-scheme', selected);
    applyColorScheme(selected);
  });

// Detect if OS prefers dark mode
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Optional: make the "Automatic" option label reflect the current system setting
const automaticOption = document.querySelector('#color-scheme-toggle option[value="automatic"]');
if (automaticOption) {
  automaticOption.textContent = `Automatic (${prefersDark ? 'Dark' : 'Light'})`;
}

const form = document.getElementById('contact-form');

form?.addEventListener('submit', function(event) {
  event.preventDefault(); // prevent the default form behavior

  const data = new FormData(form);
  const params = [];

  for (let [name, value] of data) {
    // Encode both key and value
    const encoded = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    params.push(encoded);
  }

  // Build the mailto URL
  const queryString = params.join('&');
  const url = `${form.action}?${queryString}`;

  // Navigate to the mailto link
  location.href = url;
});

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    return null;
  }
}

window.fetchJSON = fetchJSON;

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Check if the container element is valid
  if (!containerElement || !(containerElement instanceof HTMLElement)) {
    console.error("Invalid container element provided.");
    return;
  }

  // Clear the container before appending new content
  containerElement.innerHTML = '';

  // Validate headingLevel and ensure it's a valid HTML heading tag
  const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadingLevels.includes(headingLevel)) {
    console.warn(`Invalid headingLevel '${headingLevel}', defaulting to 'h2'.`);
    headingLevel = 'h2';  // Default to 'h2' if invalid
  }

  // Loop through the projects and render each one
  projects.forEach(project => {
    // Create a new <article> element
    const article = document.createElement('article');

    // Define the content dynamically
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image?.src || 'default-image.jpg'}" alt="${project.image?.alt || project.title}">
      <div>
      <p>${project.description}</p>
      <p style="font-family: Baskerville, serif; font-variant-numeric: oldstyle-nums; color: #555; margin-top: 0.25em;">
          ${project.year}
        </p>
      <div>
    `;

    // Append the article to the container
    containerElement.appendChild(article);
  });
}

export async function fetchGithubData(username) {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) throw new Error('Failed to fetch GitHub data');
  return res.json();
}

