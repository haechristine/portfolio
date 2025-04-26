import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const titleElement = document.querySelector('.projects-title');
if (titleElement) {
    titleElement.textContent = `${projects.length} Projects`; 
}

renderProjects(projects, projectsContainer, 'h2');

// import { fetchJSON, renderProjects } from '../global.js';

// console.log('Running projects.js');  // Add this to check if the script runs

// const projects = await fetchJSON('./lib/projects.json');
// console.log('Fetched projects:', projects);  // Check if projects are fetched correctly

// const projectsContainer = document.querySelector('.projects');

// // Render the projects if the data is valid
// if (projects && projects.length > 0) {
//     renderProjects(projects, projectsContainer, 'h2');
// } else {
//     console.error('No projects found or failed to load the data.');
//     projectsContainer.innerHTML = '<p>No projects available.</p>';
// }


// async function loadProjects() {
//     const projects = await fetchJSON('../lib/projects.json');
//     const projectsContainer = document.querySelector('.projects');
//     renderProjects(projects, projectsContainer, 'h2');
// }

// loadProjects();