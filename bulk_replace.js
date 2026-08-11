const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('#2aabb0') || content.includes('#38C8CC') || content.includes('bg-floral-2') || content.includes('bg-floral-1')) {
    content = content.replace(/#2aabb0/g, '#C5A059');
    content = content.replace(/#38C8CC/g, '#D4AF37'); // Lighter gold for hover
    content = content.replace(/bg-floral-2/g, 'bg-[#FAFAFA]'); // Replace floral backgrounds
    content = content.replace(/bg-floral-1/g, 'bg-[#FAFAFA]');
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Successfully updated ${changedCount} files.`);
