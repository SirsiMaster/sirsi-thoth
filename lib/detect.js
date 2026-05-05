// 𓁟 Thoth — Project Detection
// Ported from internal/thoth/init.go DetectProject + CountSourceLines + ScanArchitecture

const fs = require('fs');
const path = require('path');

const SOURCE_EXTENSIONS = new Set(['.go', '.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.java', '.swift', '.kt']);
const EXCLUDE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', 'vendor', '__pycache__', '.git', '.thoth', 'out']);

function detectProject(root = '.') {
    const absRoot = path.resolve(root);
    const info = { name: path.basename(absRoot), language: 'unknown', version: '0.1.0' };

    // go.mod (highest priority — matches Pantheon's Go preference)
    const goMod = readSafe(path.join(root, 'go.mod'));
    if (goMod) {
        info.language = 'Go';
        const m = goMod.match(/^module\s+(.+)/m);
        if (m) info.name = m[1].split('/').pop();
        const ver = readSafe(path.join(root, 'VERSION'));
        if (ver) info.version = ver.trim();
    }

    // package.json
    const pkgPath = path.join(root, 'package.json');
    if (!goMod && fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            info.name = pkg.name || info.name;
            info.version = pkg.version || info.version;
            info.language = 'TypeScript/JavaScript';
            if (fs.existsSync(path.join(root, 'next.config.js')) || fs.existsSync(path.join(root, 'next.config.ts')) || fs.existsSync(path.join(root, 'next.config.mjs')))
                info.language = 'TypeScript (Next.js)';
            else if (fs.existsSync(path.join(root, 'vite.config.ts')) || fs.existsSync(path.join(root, 'vite.config.js')))
                info.language = 'TypeScript (Vite)';
        } catch {}
    }

    // Cargo.toml
    const cargo = readSafe(path.join(root, 'Cargo.toml'));
    if (cargo) {
        info.language = 'Rust';
        const m = cargo.match(/name\s*=\s*"(.+?)"/);
        if (m) info.name = m[1];
    }

    // Python
    if (fs.existsSync(path.join(root, 'pyproject.toml')) || fs.existsSync(path.join(root, 'setup.py')))
        info.language = 'Python';

    return info;
}

function countSourceLines(root = '.') {
    let total = 0;
    walk(root, 0, 8, (filePath) => {
        try {
            total += fs.readFileSync(filePath, 'utf8').split('\n').length;
        } catch {}
    });
    return total;
}

function scanArchitecture(root = '.') {
    try {
        return fs.readdirSync(root, { withFileTypes: true })
            .filter(e => e.isDirectory() && !e.name.startsWith('.') && !EXCLUDE_DIRS.has(e.name))
            .map(e => e.name);
    } catch { return []; }
}

function walk(dir, depth, maxDepth, onFile) {
    if (depth > maxDepth) return;
    try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (EXCLUDE_DIRS.has(entry.name)) continue;
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full, depth + 1, maxDepth, onFile);
            else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) onFile(full);
        }
    } catch {}
}

function readSafe(filePath) {
    try { return fs.readFileSync(filePath, 'utf8'); } catch { return null; }
}

function formatNumber(n) {
    return n >= 1000 ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, '0')}` : String(n);
}

module.exports = { detectProject, countSourceLines, scanArchitecture, formatNumber, readSafe };
