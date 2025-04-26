import { fetchJSON, renderProjects, fetchGithubData } from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');

const titleElement = document.querySelector('.projects-title');

if (titleElement) {
    titleElement.textContent = `${projects.length} Projects`; 
}

renderProjects(latestProjects, projectsContainer, 'h2');

