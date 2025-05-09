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
