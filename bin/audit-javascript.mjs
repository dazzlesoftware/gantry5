#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(root, 'JAVASCRIPT-INVENTORY.json');
const checkOnly = process.argv.includes('--check');
const normalize = value => value.replaceAll('\\', '/').replace(/^\.\//, '');
const ignoredSegments = /(^|\/)(node_modules|vendor|dist|cache|css-compiled|package)(\/|$)/;
const sourceExtensions = new Set(['.js', '.mjs', '.cjs']);
const consumerExtensions = new Set(['.twig', '.yaml', '.yml', '.php', '.html', '.json', '.md', '.js', '.mjs', '.cjs']);

const gitFiles = () => execFileSync(
    'git',
    [
        'ls-files', '--cached', '--others', '--exclude-standard', '--',
        'gulpfile.js', 'package.json', 'assets', 'engines', 'platforms', 'src', 'tests', 'themes',
        ':(glob)bin/*.mjs'
    ],
    { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }
).split(/\r?\n/)
    .map(normalize)
    .filter(file => file && existsSync(resolve(root, file)));

const allFiles = gitFiles();
const javascriptFiles = allFiles.filter(file => sourceExtensions.has(extname(file)) && !ignoredSegments.test(file));
const consumerFiles = allFiles.filter(file => consumerExtensions.has(extname(file)) && !ignoredSegments.test(file));
const sources = new Map(javascriptFiles.map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
const consumers = new Map(consumerFiles.map(file => [file, readFileSync(resolve(root, file), 'utf8')]));

const generatedFiles = new Set([
    'assets/common/js/main.js',
    'assets/common/js/swiper.js',
    'platforms/common/js/main.js'
]);
const buildEntryPoints = new Set([
    'assets/common/application/main.js',
    'assets/common/application/swiper.js',
    'platforms/common/application/main.js'
]);
const thirdPartyNames = /^(chart|chartist|classie|fastclick|headroom(?:\.min)?|length(?:\.min)?|modernizr(?:-vmenu|\.custom)?|particles|smooth-scroll(?:\.min)?|swiper(?:\.min)?|tinyscrollbar(?:\.min)?)\.js$/i;
const thirdPartyHeaders = /(?:MIT License|Modernizr \d|Chartist\.js|Swiper \d|headroom\.js|classie v|fastclick|tinyscrollbar|Codrops)/i;

const classify = (file, source) => {
    const name = posix.basename(file);
    if (generatedFiles.has(file)) return 'generated_bundle';
    if (name === 'gulpfile.js' || file === 'bin/audit-javascript.mjs') return 'build_tool';
    if (/themes\/helium\/phpbb\/template\//.test(file)) return 'platform_owned_integration';
    if (file.startsWith('assets/common/application/') || file.startsWith('platforms/common/application/')) {
        return 'first_party_source';
    }
    if (/\.min\.js$/i.test(name) || thirdPartyNames.test(name) || thirdPartyHeaders.test(source.slice(0, 2500))) {
        return 'third_party_vendored';
    }
    return 'first_party_source';
};

const area = file => {
    if (file === 'gulpfile.js' || file.endsWith('/gulpfile.js') || file.startsWith('bin/')) return 'build';
    if (file.startsWith('assets/common/application/')) return 'frontend_core';
    if (file.startsWith('assets/common/js/')) return 'shared_browser_asset';
    if (file.startsWith('platforms/common/application/')) return 'administration';
    if (file.startsWith('platforms/')) return 'platform_integration';
    if (file.startsWith('engines/')) return 'engine';
    if (file.startsWith('themes/')) return 'recovered_theme';
    if (file.startsWith('tests/')) return 'test';
    return 'repository';
};

const byBasename = new Map();
javascriptFiles.forEach(file => {
    const name = posix.basename(file);
    if (!byBasename.has(name)) byBasename.set(name, []);
    byBasename.get(name).push(file);
});

const references = new Map(javascriptFiles.map(file => [file, new Set()]));
const addReference = (target, consumer) => {
    if (references.has(target) && target !== consumer) references.get(target).add(consumer);
};

const resolveModule = (consumer, specifier) => {
    if (!specifier.startsWith('.')) return null;
    const base = normalize(posix.normalize(posix.join(posix.dirname(consumer), specifier)));
    return [base, `${base}.js`, `${base}.mjs`, `${base}.cjs`, `${base}/index.js`]
        .find(candidate => sources.has(candidate)) || null;
};

for (const [consumer, content] of consumers) {
    const modulePattern = /(?:require\s*\(\s*|from\s+|import\s*)['"]([^'"]+)['"]/g;
    for (const match of content.matchAll(modulePattern)) {
        const target = resolveModule(consumer, match[1]);
        if (target) addReference(target, consumer);
    }

    const assetPattern = /(?:genesis-(assets|theme):\/\/)?(?:[A-Za-z0-9_.@-]+\/)*([A-Za-z0-9_.-]+\.(?:js|mjs|cjs))(?:[?#][^'"\s)]*)?/g;
    for (const match of content.matchAll(assetPattern)) {
        const protocol = match[1];
        const name = match[2];
        let candidates = [];

        if (protocol === 'assets') {
            candidates = [`assets/common/js/${name}`];
        } else if (protocol === 'theme' && consumer.startsWith('themes/')) {
            const theme = consumer.split('/')[1];
            candidates = [`themes/${theme}/common/js/${name}`];
        } else {
            candidates = byBasename.get(name) || [];
            if (candidates.length > 1 && consumer.startsWith('themes/')) {
                const theme = consumer.split('/')[1];
                const local = candidates.filter(candidate => candidate.startsWith(`themes/${theme}/`));
                if (local.length) candidates = local;
            }
        }
        candidates.forEach(candidate => addReference(candidate, consumer));
    }
}

const extractMatches = (source, pattern, group = 1) => [...source.matchAll(pattern)].map(match => match[group]).filter(Boolean);
const uniqueSorted = values => [...new Set(values)].sort();
const hash = source => createHash('sha256').update(source).digest('hex');
const groupBy = (values, callback) => {
    const groups = new Map();
    values.forEach(value => {
        const key = callback(value);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(value);
    });
    return groups;
};

const entries = javascriptFiles.sort().map(file => {
    const source = sources.get(file);
    const consumersForFile = [...references.get(file)].sort();
    const classification = classify(file, source);
    const globals = extractMatches(source, /window\.([A-Za-z_$][\w$]*)\s*=/g);
    const customEvents = [
        ...extractMatches(source, /new CustomEvent\(\s*['"]([^'"]+)['"]/g),
        ...extractMatches(source, /dispatchEvent\(\s*new Event\(\s*['"]([^'"]+)['"]/g)
    ];
    const dataAttributes = [...source.matchAll(/(?:dataset\.([A-Za-z][\w]*)|data-([a-z][\w-]*))/g)]
        .map(match => match[1] || match[2]);
    const storageKeys = extractMatches(source, /(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g);

    return {
        path: file,
        area: area(file),
        classification,
        owner: classification === 'platform_owned_integration' ? 'phpBB platform integration'
            : classification === 'third_party_vendored' ? 'upstream third party'
                : 'Genesis',
        generatedFrom: file === 'assets/common/js/main.js' ? 'assets/common/application/main.js'
            : file === 'assets/common/js/swiper.js' ? 'assets/common/application/swiper.js'
                : file === 'platforms/common/js/main.js' ? 'platforms/common/application/main.js'
                    : null,
        entryPoint: buildEntryPoints.has(file),
        activeReferenceCount: consumersForFile.length,
        consumers: consumersForFile,
        bytes: Buffer.byteLength(source),
        lines: source.split(/\r?\n/).length,
        sha256: hash(source),
        signals: {
            commonjs: /\b(?:require\s*\(|module\.exports|exports\.)/.test(source),
            esModule: /(?:^|\n)\s*(?:import|export)\s/m.test(source),
            var: /\bvar\s+/.test(source),
            prototype: /\.prototype\b/.test(source),
            legacyBrowserApi: /ActiveXObject|attachEvent|MSPointer|msPointer|DocumentTouch|arguments\.callee|webkitRequestAnimationFrame/.test(source),
            inlineCodeGeneration: /\beval\s*\(|new Function\s*\(|setTimeout\s*\(\s*['"]|setInterval\s*\(\s*['"]/.test(source),
            globals: uniqueSorted(globals),
            customEvents: uniqueSorted(customEvents),
            dataAttributes: uniqueSorted(dataAttributes),
            storageKeys: uniqueSorted(storageKeys)
        }
    };
});

const duplicateGroups = [...groupBy(entries, entry => entry.sha256).values()]
    .filter(group => group.length > 1)
    .map(group => ({ count: group.length, paths: group.map(entry => entry.path).sort() }))
    .sort((left, right) => right.count - left.count || left.paths[0].localeCompare(right.paths[0]));
const countBy = key => Object.fromEntries(
    [...groupBy(entries, entry => entry[key]).entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([name, values]) => [name, values.length])
);

const inventory = {
    schemaVersion: 1,
    scope: {
        included: ['tracked and non-ignored *.js, *.mjs, and *.cjs'],
        excludedDirectories: ['node_modules', 'vendor', 'dist', 'cache', 'package', 'css-compiled'],
        browserBaseline: ['Chrome 60+', 'Firefox 60+', 'Safari 12+', 'Microsoft Edge', 'Internet Explorer unsupported'],
        browserBaselineSource: 'README.md lines 60-68'
    },
    summary: {
        totalFiles: entries.length,
        classifications: countBy('classification'),
        areas: countBy('area'),
        activeReferencedFiles: entries.filter(entry => entry.activeReferenceCount > 0 || entry.entryPoint).length,
        unreferencedFiles: entries.filter(entry => entry.activeReferenceCount === 0 && !entry.entryPoint).length,
        commonjsFiles: entries.filter(entry => entry.signals.commonjs).length,
        esModuleFiles: entries.filter(entry => entry.signals.esModule).length,
        varFiles: entries.filter(entry => entry.signals.var).length,
        legacyBrowserApiFiles: entries.filter(entry => entry.signals.legacyBrowserApi).length,
        inlineCodeGenerationFiles: entries.filter(entry => entry.signals.inlineCodeGeneration).length,
        duplicateGroups: duplicateGroups.length
    },
    buildEntryPoints: [...buildEntryPoints].sort(),
    generatedBundles: [...generatedFiles].sort(),
    duplicateGroups,
    files: entries
};

const serialized = `${JSON.stringify(inventory, null, 2)}\n`;
if (checkOnly) {
    if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== serialized) {
        console.error('JAVASCRIPT-INVENTORY.json is stale. Run: node bin/audit-javascript.mjs');
        process.exit(1);
    }
    console.log(`JavaScript inventory is current (${entries.length} files).`);
} else {
    writeFileSync(outputPath, serialized);
    console.log(JSON.stringify(inventory.summary, null, 2));
}
