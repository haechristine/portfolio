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
          enumerable: true,  // Don't show up in console logs
          configurable: false,  // Don't allow reconfiguring this property
        });
  
        return ret;
      });
  }
   
let data = await loadData();
let commits = processCommits(data);

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

  //added to global scope

  let xScale, yScale;

  function isCommitSelected(selection, commit) {
    if (!selection || !selection[0] || !selection[1]) return false;
    const [x0, y0] = selection[0];
    const [x1, y1] = selection[1];
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}

  function renderScatterPlot(data, commits) {
    // Put all the JS code of Steps inside this function
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

    yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);
    
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };

    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

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
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
                    .scaleSqrt() // Change only this line
                    .domain([minLines, maxLines])
                    .range([5, 30]);
    dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    // .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7);
        updateTooltipVisibility(false);
   });
     // Define helper function FIRST (so it's clear it's being used below)
    // function isCommitSelected(selection, commit) {
    //     if (!selection || !selection[0] || !selection[1]) return false;
    //     const [x0, y0] = selection[0];
    //     const [x1, y1] = selection[1];
    //     const x = xScale(commit.datetime);
    //     const y = yScale(commit.hourFrac);
    //     return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    // }
    function renderSelectionCount(selection,commits) {
        const selectedCommits = selection
          ? commits.filter((d) => isCommitSelected(selection, d))
          : [];
      
        const countElement = document.querySelector('#selection-count');
        countElement.textContent = `${
          selectedCommits.length || 'No'
        } commits selected`;
      
        return selectedCommits;
      }
    // Brush handler
    function brushed(event) {
        const selection = event.selection;
        d3.selectAll('circle').classed('selected', (d) =>
        isCommitSelected(selection,d)
        );
        renderSelectionCount(selection,commits);
        renderLanguageBreakdown(selection,commits);
     }

    // Set up brush and attach to svg
    svg.call(d3.brush().on('start brush end', brushed));

    // Raise dots so they are above brush overlay
    svg.selectAll('.dots, .overlay ~ *').raise();
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

  function renderLanguageBreakdown(selection,commits) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type,
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  }
