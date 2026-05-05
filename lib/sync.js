// 𓁟 Thoth — Memory Sync Engine
// Ported from internal/thoth/sync.go

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { formatNumber } = require('./detect');

function sync(repoRoot) {
    const memoryPath = path.join(repoRoot, '.thoth', 'memory.yaml');
    if (!fs.existsSync(memoryPath)) throw new Error('No .thoth/memory.yaml found. Run thoth-init first.');

    let content = fs.readFileSync(memoryPath, 'utf8');

    // Discover facts from the filesystem
    const facts = discoverFacts(repoRoot);

    // Replace fact lines in memory.yaml
    const replacements = [
        [/^module_count:\s+\d+/m, `module_count: ${facts.moduleCount}`],
        [/^binary_count:\s+\d+.*/m, `binary_count: ${facts.binaryCount} (${facts.binaryNames.join(', ')})`],
        [/^test_count:\s+\d+.*/m, `test_count: ${facts.testCount}+`],
        [/^line_count:\s+.*/m, `line_count: ~${formatNumber(facts.lineCount)}`],
        [/^command_count:\s+\d+/m, `command_count: ${facts.commandCount}`],
        [/^# Last updated:.*/m, `# Last updated: ${new Date().toISOString()}`],
    ];

    for (const [re, replacement] of replacements) {
        if (re.test(content)) content = content.replace(re, replacement);
    }

    fs.writeFileSync(memoryPath, content);
    return facts;
}

function syncJournal(repoRoot, since = '24 hours ago') {
    const journalPath = path.join(repoRoot, '.thoth', 'journal.md');
    if (!fs.existsSync(journalPath)) return 0;

    let commits;
    try {
        const raw = execFileSync('git', ['-C', repoRoot, 'log', '--oneline', `--since=${since}`], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        commits = raw.trim().split('\n').filter(Boolean);
    } catch { return 0; }

    if (commits.length === 0) return 0;

    const entryNum = findLastEntryNumber(journalPath) + 1;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].slice(0, 5);

    let entry = `\n## Entry ${String(entryNum).padStart(3, '0')} — ${date} ${time} — Auto-sync\n\n`;
    entry += `> ${commits.length} commits since ${since}\n\n`;
    for (const c of commits.slice(0, 20)) {
        entry += `- ${c}\n`;
    }
    if (commits.length > 20) entry += `- ... and ${commits.length - 20} more\n`;
    entry += '\n---\n';

    fs.appendFileSync(journalPath, entry);
    return commits.length;
}

function discoverFacts(root) {
    return {
        moduleCount: countSubdirs(path.join(root, 'internal')) || countSubdirs(path.join(root, 'src')) || countSubdirs(path.join(root, 'packages')),
        ...listSubdirs(path.join(root, 'cmd')),
        testCount: estimateTestCount(root),
        lineCount: estimateLineCount(root),
        commandCount: estimateCommandCount(root),
    };
}

function countSubdirs(dir) {
    try {
        return fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).length;
    } catch { return 0; }
}

function listSubdirs(dir) {
    try {
        const names = fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
        return { binaryCount: names.length, binaryNames: names };
    } catch { return { binaryCount: 0, binaryNames: [] }; }
}

function estimateTestCount(root) {
    let count = 0;
    walkFiles(root, (filePath) => {
        try {
            if (filePath.endsWith('_test.go')) {
                const content = fs.readFileSync(filePath, 'utf8');
                count += (content.match(/^func Test/gm) || []).length;
            } else if (filePath.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
                const content = fs.readFileSync(filePath, 'utf8');
                count += (content.match(/\b(it|test)\s*\(/g) || []).length;
            }
        } catch {}
    });
    return count;
}

function estimateLineCount(root) {
    const exts = new Set(['.go', '.ts', '.js', '.tsx', '.jsx', '.md', '.html', '.css', '.yaml', '.yml']);
    const excludes = new Set(['node_modules', '.git', 'vendor', 'dist', 'out', '.thoth']);
    let totalBytes = 0;
    walkFiles(root, (filePath) => {
        if (exts.has(path.extname(filePath))) {
            try { totalBytes += fs.statSync(filePath).size; } catch {}
        }
    }, excludes);
    return Math.round(totalBytes / 65);
}

function estimateCommandCount(root) {
    let count = 0;
    const cmdDir = path.join(root, 'cmd');
    if (!fs.existsSync(cmdDir)) return 0;
    walkFiles(cmdDir, (filePath) => {
        if (filePath.endsWith('.go')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                count += (content.match(/&cobra\.Command/g) || []).length;
            } catch {}
        }
    });
    return count;
}

function walkFiles(dir, onFile, excludes) {
    const excl = excludes || new Set(['node_modules', '.git', 'vendor', 'dist', 'out', '.thoth', '__pycache__', '.next', 'build']);
    function _walk(d, depth) {
        if (depth > 8) return;
        try {
            for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
                if (excl.has(entry.name)) continue;
                const full = path.join(d, entry.name);
                if (entry.isDirectory()) _walk(full, depth + 1);
                else onFile(full);
            }
        } catch {}
    }
    _walk(dir, 0);
}

function findLastEntryNumber(journalPath) {
    try {
        const content = fs.readFileSync(journalPath, 'utf8');
        const matches = content.match(/## Entry (\d+)/g);
        if (!matches) return 0;
        const nums = matches.map(m => parseInt(m.match(/\d+/)[0]));
        return Math.max(...nums);
    } catch { return 0; }
}

module.exports = { sync, syncJournal, findLastEntryNumber };
