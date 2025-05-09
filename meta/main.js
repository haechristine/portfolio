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
