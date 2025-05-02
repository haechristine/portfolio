import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const titleElement = document.querySelector('.projects-title');
if (titleElement) {
    titleElement.textContent = `${projects.length} Projects`; 
}

renderProjects(projects, projectsContainer, 'h2');

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Step 1: Fetch project data using .then()
d3.json('../lib/projects.json')
  .then((projects) => {
    // Step 2: Group projects by year and count the number of projects per year
    let rolledData = d3.rollups(
      projects,
      (v) => v.length,
      (d) => d.year
    );

    // Step 3: Map rolled data into a structure suitable for the pie chart
    let data = rolledData.map(([year, count]) => ({
      value: count,
      label: year
    }));

    // Step 4: Create color scale and pie chart generator
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);

    // Step 5: Arc generation function for pie chart slices
    function arcGenerator(d) {
      let r = 50; // radius of the pie chart
      let x1 = r * Math.cos(d.startAngle);
      let y1 = r * Math.sin(d.startAngle);
      let x2 = r * Math.cos(d.endAngle);
      let y2 = r * Math.sin(d.endAngle);
      let largeArc = d.endAngle - d.startAngle > Math.PI ? 1 : 0;

      return `
        M 0 0
        L ${x1} ${y1}
        A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;
    }

    // Step 6: Convert arcs to path strings
    let arcs = arcData.map((d) => arcGenerator(d));

    // Step 7: Append paths to SVG with colors
    let svg = d3.select('#projects-pie-plot');
    arcs.forEach((arc, i) => {
      svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(i)); // Apply colors to each slice
    });

    // Step 8: Append legend items
    let legend = d3.select('.legend');
    data.forEach((d, idx) => {
      legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`) // Set the color for each legend item
        .attr('class', 'legend-item')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // Set the label and value in the legend
    });
  })

let query = '';
// Select the search bar element
let searchInput = document.querySelector('.searchBar');

// Add event listener to listen for input changes
searchInput.addEventListener('input', (event) => {
  // Update the query with the current value from the search bar
  query = event.target.value.toLowerCase(); // Convert to lowercase for case-insensitive search

  // Filter the projects based on the query
  let filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(query) // Case-insensitive search by title
  );

  // Render the updated projects (you can adjust this part to match your render function)
  renderProjects(filteredProjects);
});

// Function to render projects (this is just an example structure)
function renderProjects(projects) {
  let projectContainer = document.querySelector('#project-container');
  projectContainer.innerHTML = ''; // Clear previous results

  // Loop through the filtered projects and display them
  projects.forEach((project) => {
    let projectElement = document.createElement('div');
    projectElement.classList.add('project');
    projectElement.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    `;
    projectContainer.appendChild(projectElement);
  });
}