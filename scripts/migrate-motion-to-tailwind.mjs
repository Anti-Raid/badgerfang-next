import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, '..', 'src');

const BRACE_ATTRS = [
	'initial',
	'animate',
	'exit',
	'transition',
	'variants',
	'whileHover',
	'whileTap',
	'whileInView',
	'viewport',
	'layoutId',
	'dragConstraints',
	'dragElastic',
	'dragMomentum',
	'onDragStart',
	'onDrag',
	'onDragEnd'
];

function stripBraceAttr(content, attrName) {
	let result = content;
	let guard = 0;
	while (guard++ < 5000) {
		const re = new RegExp(`(\\s)${attrName}=\\{`);
		const m = result.match(re);
		if (!m) break;
		const start = m.index;
		const braceStart = result.indexOf('{', start);
		let depth = 0;
		let i = braceStart;
		for (; i < result.length; i++) {
			const c = result[i];
			if (c === '{') depth++;
			else if (c === '}') {
				depth--;
				if (depth === 0) {
					i++;
					break;
				}
			}
		}
		result = result.slice(0, start) + result.slice(i);
	}
	return result;
}

function walkTsx(dir, files = []) {
	for (const name of fs.readdirSync(dir)) {
		const p = path.join(dir, name);
		const st = fs.statSync(p);
		if (st.isDirectory()) walkTsx(p, files);
		else if (name.endsWith('.tsx')) files.push(p);
	}
	return files;
}

function migrateFile(filePath) {
	let s = fs.readFileSync(filePath, 'utf8');
	if (!s.includes('motion') && !s.includes('AnimatePresence') && !s.includes('Reorder')) return false;

	// motion tags -> native tags
	s = s.replace(/<\/motion\.(\w+)>/g, '</$1>');
	s = s.replace(/<motion\.(\w+)/g, '<$1');

	// AnimatePresence -> fragment
	s = s.replace(/<AnimatePresence[^>]*>/g, '<>');
	s = s.replace(/<\/AnimatePresence>/g, '</>');

	// Reorder.Group -> div (drop reorder-specific props in a second pass)
	s = s.replace(/<Reorder\.Group\b/g, '<div');
	s = s.replace(/<\/Reorder\.Group>/g, '</div>');
	s = s.replace(/<Reorder\.Item\b/g, '<div');
	s = s.replace(/<\/Reorder\.Item>/g, '</div>');

	for (const a of BRACE_ATTRS) {
		s = stripBraceAttr(s, a);
	}

	// boolean layout (motion layout prop)
	s = s.replace(/\s+layout(?=[\s/>])/g, '');

	// drag={...}
	s = stripBraceAttr(s, 'drag');

	// Reorder shim props (only safe on dedicated lines — fix SettingsReorderableList manually if needed)
	s = s.replace(/\s+axis="[xy]"/g, '');

	// Import remaps
	s = s.replace(
		/import\s*\{\s*motion\s*,\s*AnimatePresence\s*,\s*useInView\s*,\s*Variants\s*\}\s*from\s*['"]@\/components\/ui\/motion['"]/g,
		"import { useInView } from '@/lib/scroll-motion'"
	);
	s = s.replace(
		/import\s*\{\s*motion\s*,\s*AnimatePresence\s*,\s*useInView\s*\}\s*from\s*['"]@\/components\/ui\/motion['"]/g,
		"import { useInView } from '@/lib/scroll-motion'"
	);
	s = s.replace(
		/import\s*\{\s*motion\s*,\s*AnimatePresence\s*\}\s*from\s*['"]@\/components\/ui\/motion['"]/g,
		''
	);
	s = s.replace(
		/import\s*\{\s*motion\s*,\s*AnimatePresence\s*,\s*Variants\s*\}\s*from\s*['"]@\/components\/ui\/motion['"]/g,
		''
	);
	s = s.replace(/import\s*\{\s*motion\s*\}\s*from\s*['"]@\/components\/ui\/motion['"];\s*\n/g, '');
	s = s.replace(/import\s*\{\s*Reorder\s*\}\s*from\s*['"]@\/components\/ui\/motion['"];\s*\n/g, '');
	s = s.replace(
		/import\s*\{\s*AnimatePresence\s*,\s*motion\s*,\s*Reorder\s*\}\s*from\s*['"]@\/components\/ui\/motion['"]/g,
		''
	);
	s = s.replace(
		/import\s*\{\s*motion\s*,\s*Reorder\s*\}\s*from\s*['"]@\/components\/ui\/motion['"];\s*\n/g,
		''
	);

	s = s.replace(
		/import\s*\{\s*motion\s*,\s*useScroll\s*,\s*useSpring\s*\}\s*from\s*['"]@\/components\/ui\/motion['"]/g,
		"import { useScroll, useSpring } from '@/lib/scroll-motion'"
	);
	s = s.replace(
		/import\s*\{\s*motion\s*,\s*useScroll\s*,\s*useTransform\s*,\s*useInView\s*\}\s*from\s*['"]@\/components\/ui\/motion['"]/g,
		"import { useScroll, useTransform, useInView } from '@/lib/scroll-motion'"
	);
	s = s.replace(
		/import\s*\{\s*motion\s*,\s*useScroll\s*,\s*useTransform\s*,\s*useInView\s*,\s*useSpring\s*,\s*useMotionValue\s*\}\s*from\s*['"]@\/components\/ui\/motion['"]/g,
		"import { useScroll, useTransform, useInView, useSpring, useMotionValue } from '@/lib/scroll-motion'"
	);

	fs.writeFileSync(filePath, s);
	return true;
}

let n = 0;
for (const f of walkTsx(srcRoot)) {
	if (migrateFile(f)) {
		console.log('migrated', path.relative(srcRoot, f));
		n++;
	}
}
console.log('done', n, 'files');
