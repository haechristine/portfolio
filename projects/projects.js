import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('./lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const titleElement = document.querySelector('.projects-title');
if (titleElement) {
    titleElement.textContent = `${projects.length} Projects`; 
}

renderProjects(latestProjects, projectsContainer, 'h2');

// async function loadProjects() {
//     const projects = await fetchJSON('../lib/projects.json');
//     const projectsContainer = document.querySelector('.projects');
//     renderProjects(projects, projectsContainer, 'h2');
// }

// loadProjects();