const fs = require('fs');
const path = require('path');
// const glob = require('glob'); // If glob is available, or use readdir

function getKeys(obj, prefix = '') {
	let keys = [];
	for (const key in obj) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
			keys = keys.concat(getKeys(obj[key], fullKey));
		} else {
			keys.push(fullKey);
		}
	}
	return keys;
}

const en = JSON.parse(fs.readFileSync('src/lib/i18n/locales/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('src/lib/i18n/locales/ar.json', 'utf8'));
const enKeys = new Set(getKeys(en));
const arKeys = new Set(getKeys(ar));

// Walk src and find t("...")
function walkSync(dir, filelist = []) {
	const files = fs.readdirSync(dir);
	files.forEach(function(file) {
		const filePath = path.join(dir, file);
		if (fs.statSync(filePath).isDirectory()) {
			filelist = walkSync(filePath, filelist);
		} else if (file.endsWith('.js') || file.endsWith('.jsx')) {
			filelist.push(filePath);
		}
	});
	return filelist;
}

const files = walkSync('src');
const codeKeys = new Set();
const hardCodedStrings = [];

files.forEach(file => {
	const content = fs.readFileSync(file, 'utf8');
	const regex = /t\(['"]([\w.\-_:]+)['"]/g;
	let match;
	while ((match = regex.exec(content)) !== null) {
		codeKeys.add(match[1]);
	}

	// Heuristic for hardcoded strings in JSX: >Text< or placeholder="Text"
	// This is noisy, so we'll just look for specific patterns
	const jsxTextRegex = />([^<>{}\n\r ]+[^<>{}\n\r]*)</g;
	while ((match = jsxTextRegex.exec(content)) !== null) {
		const text = match[1].trim();
		if (text && !text.match(/^[0-9\W]+$/)) {
			hardCodedStrings.push({ file, text });
		}
	}
});

const missingInEn = [...codeKeys].filter(k => !enKeys.has(k));
const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
const unusedInEn = [...enKeys].filter(k => !codeKeys.has(k));

const report = {
	missingInEn,
	missingInAr,
	unusedInEnCount: unusedInEn.length,
	hardCodedSample: hardCodedStrings.slice(0, 50)
};

fs.writeFileSync('translation_audit.json', JSON.stringify(report, null, 2), 'utf8');
console.log('Audit complete. see translation_audit.json');
