import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let projects = await fetchJSON('../lib/projects.json'); // now it's mutable
const projectsContainer = document.querySelector('.projects');

const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `${projects.length} Projects`;
}

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects); // call the pie chart on initial load

// -- Pie Chart Function --
function renderPieChart(data) {
  let svg = d3.select('#projects-pie-plot');
  let legend = d3.select('.legend');

  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  let rolledData = d3.rollups(data, v => v.length, d => d.year);
  let pieData = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData = sliceGenerator(pieData);

  function arcGenerator(d) {
    let r = 50;
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

  let selectedIndex = -1;

  arcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(i))
      .attr('class', 'wedge')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        
        svg.selectAll('path')
          .attr('class', (_, idx) => idx === selectedIndex ? 'selected wedge' : 'wedge');
        
          legend.selectAll('li')
          .attr('class', (_, idx) => idx === selectedIndex ? 'selected legend-item' : 'legend-item')
          .style('--color', (_, idx) =>
            idx === selectedIndex ? 'oklch(60% 45% 0)' : colors(idx)
          );
        
        // Combine both the search query filter and the pie slice filter
        let filteredProjects = data;
        
        if (selectedIndex !== -1) {
          const selectedYear = pieData[selectedIndex].label;
          filteredProjects = filteredProjects.filter(project => project.year === selectedYear);
        }
      
        if (query) {
          filteredProjects = filteredProjects.filter(project => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
          });
        }
        // After filtering by both year and search query, render the projects
        renderProjects(filteredProjects, projectsContainer, 'h2');
      });
    });

  pieData.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// -- Search Handling --
let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});