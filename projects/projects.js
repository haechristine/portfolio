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
// let projects = ...;
// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );

// let data = rolledData.map(([year, count]) => {
//   return { value: count, label: year };
// });

// let colors = d3.scaleOrdinal(d3.schemeTableau10);
// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data);

// function arcGenerator(d) {
//     let r = 50;
//     let x1 = r * Math.cos(d.startAngle);
//     let y1 = r * Math.sin(d.startAngle);
//     let x2 = r * Math.cos(d.endAngle);
//     let y2 = r * Math.sin(d.endAngle);
//     let largeArc = d.endAngle - d.startAngle > Math.PI ? 1 : 0;
  
//     return `
//       M 0 0
//       L ${x1} ${y1}
//       A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
//       Z
//     `;
//   }
  
//   // Convert to path strings
//   let arcs = arcData.map((d) => arcGenerator(d));
  
//   // Append paths to SVG with colors
//   let svg = d3.select('#projects-pie-plot');

// arcs.forEach((arc, i) => {
//     svg.append('path')
//     .attr('d', arc)
//     .attr('fill', colors(i));
//   });

//   let legend = d3.select('.legend');
//   data.forEach((d, idx) => {
//     legend
//       .append('li')
//       .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//       .attr('class', 'legend-item')
//       .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
//   });

  let query = '';
