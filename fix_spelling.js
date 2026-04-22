const fs = require('fs');

let content = fs.readFileSync('products.html', 'utf8');
content = content.replace(/Hydrabad Biriyani Masala/g, 'Hydrabadi Biriyani Masala');

fs.writeFileSync('products.html', content, 'utf8');
console.log('Fixed spelling');
