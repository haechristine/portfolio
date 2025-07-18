import { fetchJSON, renderProjects, fetchGithubData } from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects
  .slice() // create a shallow copy so original isn't mutated
  .sort((a, b) => Number(b.year) - Number(a.year))
  .slice(0, 3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

const githubData = await fetchGithubData('haechristine')
const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
      `;
  }