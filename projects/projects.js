import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const titleElement = document.querySelector('.projects-title');
if (titleElement) {
    titleElement.textContent = `${projects.length} Projects`; 
}

renderProjects(projects, projectsContainer, 'h2');

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let data = [
  { value: 1, label: 'apples' },
  { value: 2, label: 'oranges' },
  { value: 3, label: 'mangos' },
  { value: 4, label: 'pears' },
  { value: 5, label: 'limes' },
  { value: 5, label: 'cherries' },
];let colors = d3.scaleOrdinal(d3.schemeTableau10);

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);

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
  
  // Convert to path strings
  let arcs = arcData.map((d) => arcGenerator(d));
  
  // Append paths to SVG with colors
  let svg = d3.select('#projects-pie-plot');

arcs.forEach((arc, i) => {
    svg.append('path')
    .attr('d', arc)
    .attr('fill', colors(i));
  });