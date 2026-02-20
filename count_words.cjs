const fs = require('fs');
const content = fs.readFileSync('/Users/brunoravaglia/Desktop/TrafficHub/src/data/blogPosts.ts', 'utf8');

// Primitive regex to match 'content: `...`,' blocks
// Note: this assumes the content doesn't contain backticks followed by a comma
const matches = content.split('content: `');
matches.shift(); // remove first part before first match

const results = matches.map((m, i) => {
    const text = m.split('`,')[0];
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    return { id: i + 1, words, chars };
});

console.log(JSON.stringify(results, null, 2));
