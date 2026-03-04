const fs = require('fs');
const path = require('path');

function getKeys(obj, prefix = '') {
	let keys = [];
	for (const key in obj) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
			keys = keys.concat(getKeys(obj[key], fullKey));
		} else {
			keys.push(fullKey);
		}
	}
	return keys;
}

const en = JSON.parse(fs.readFileSync('src/lib/i18n/locales/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('src/lib/i18n/locales/ar.json', 'utf8'));

fs.writeFileSync('en_keys.txt', getKeys(en).sort().join('\n'), 'utf8');
fs.writeFileSync('ar_keys.txt', getKeys(ar).sort().join('\n'), 'utf8');
