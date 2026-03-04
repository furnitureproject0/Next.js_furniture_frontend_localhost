const fs = require('fs');
const path = require('path');

function getKeys(obj, prefix = '') {
	let keys = [];
	for (const key in obj) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			keys = keys.concat(getKeys(obj[key], fullKey));
		} else {
			keys.push(fullKey);
		}
	}
	return keys;
}

const enPath = path.join(__dirname, 'src/lib/i18n/locales/en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enKeys = getKeys(en);

fs.writeFileSync('en_json_keys.txt', enKeys.join('\n'), 'utf8');
