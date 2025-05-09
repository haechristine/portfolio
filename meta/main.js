import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
  
    return data;
  }

  function processCommits(data) {
    return d3
      .groups(data, (d) => d.commit)  // Group by commit ID
      .map(([commit, lines]) => {
        let first = lines[0];  // Get the first line for basic commit info
        let { author, date, time, timezone, datetime } = first;  // Destructure the relevant properties
  
        // Create the commit object with basic and derived properties
        let ret = {
          id: commit,  // Commit ID
          url: 'https://github.com/YOUR_REPO/commit/' + commit,  // URL for the commit on GitHub
          author,  // Author of the commit
          date,  // Date of the commit
          time,  // Time of the commit
          timezone,  // Timezone of the commit
          datetime,  // Full datetime object for the commit
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,  // Hour fraction for time analysis
          totalLines: lines.length,  // Total number of lines modified by this commit
        };
  
        // Use Object.defineProperty to add the 'lines' array as a hidden property
        Object.defineProperty(ret, 'lines', {
          value: lines,  // The original lines array
          writable: false,  // Make it non-writable
          enumerable: false,  // Don't show up in console logs
          configurable: false,  // Don't allow reconfiguring this property
        });
  
        return ret;
      });
  }
   
let data = await loadData();
let commits = processCommits(data)
console.log(commits)

function renderCommitInfo(data, commits) {
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Total lines of code
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Number of distinct files
    const fileCount = d3.groups(data, d => d.file).length;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(fileCount);
  
    // Average file length (in lines)
    const fileLengths = d3.rollups(
      data,
      v => d3.max(v, d => d.line),
      d => d.file
    );
    const avgFileLength = d3.mean(fileLengths, d => d[1]);
    dl.append('dt').text('Average file length');
    dl.append('dd').text(avgFileLength.toFixed(1));
  
    // Maximum depth
    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Maximum depth');
    dl.append('dd').text(maxDepth);
  
    // Time of day with most work
    const workByPeriod = d3.rollups(
      data,
      v => v.length,
      d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' }) // "AM", "PM"
    );
    const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0];
    dl.append('dt').text('Most active period');
    dl.append('dd').text(maxPeriod || 'N/A');
  }

  renderCommitInfo(data, commits);


  function renderScatterPlot(data, commits) {
    // Put all the JS code of Steps inside this function
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };

    xScale.range([usableArea.left, usableArea.right]);

    const yScale = d3.scaleLinear().domain([0,24]);
    yScale.range([usableArea.bottom, usableArea.top]);

    const colorScale = d3
    .scaleLinear()
    .domain([0, 6, 12, 18, 24]) // Break into parts: night, morning, afternoon, evening
    .range(['blue', 'lightblue', 'orange', 'darkorange', 'blue']);

    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Color gridlines based on the time of day
    gridlines
    .selectAll('line')
    .style('stroke', (d, i) => {
        const hour = i; // i corresponds to the tick index, representing the hour of the day
        return colorScale(hour); // Assign color based on the time of day
    });

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
                    .axisLeft(yScale)
                    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');    
    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    const dots = svg.append('g').attr('class', 'dots');

    dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        updateTooltipVisibility(false);
   });
}
   renderScatterPlot(data, commits);

   function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
   }

   function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }