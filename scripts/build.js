const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.join(__dirname, '../', "public");
const OUTPUT_DIR = path.join(__dirname, '../', "public-obf");

// Step 1: ensure output exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Step 2: run obfuscator
console.log("Obfuscating JS files...");

execSync(
    `npx javascript-obfuscator public --output public-obf`,
    { stdio: "inherit" }
);

// Step 3: copy non-JS files
console.log("Copying non-JS assets...");

function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    for (const item of fs.readdirSync(src)) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);

        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            // skip JS files (already obfuscated)
            if (item.endsWith(".js")) continue;

            fs.copyFileSync(srcPath, destPath);
        }
    }
}

copyRecursive(PUBLIC_DIR, OUTPUT_DIR);

console.log("Done!");