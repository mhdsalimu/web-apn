const fs = require('fs');

let content = fs.readFileSync('products.html', 'utf8');
content = content.replace(/â‚¹/g, '₹');
content = content.replace(/âˆ’/g, '−');
content = content.replace(/Â/g, '');

const pattern = /(<h3>.*? - 200g<\/h3>\s*<p class="price">)[^<]*(<\/p>)/g;
content = content.replace(pattern, '$1₹199$2\n                        <p class="free-delivery">FREE Delivery</p>');

fs.writeFileSync('products.html', content, 'utf8');
console.log('Fixed');
