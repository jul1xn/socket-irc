const { execSync } = require("child_process");
const os = require("os");
const path = require("path");

function run(cmd) {
    console.log(`\n> ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
}

try {
    console.log("=== DEPLOY START ===");

    // 🔼 Go up one directory (to git root)
    const rootDir = path.resolve(__dirname, "..");
    process.chdir(rootDir);

    console.log(`\nWorking directory: ${process.cwd()}`);

    // 1. Git operations
    run("git fetch");
    run("git pull");

    // 2. Build step (from git root)
    console.log("\n=== BUILD ===");
    run("npm i");
    
    run("node build.js");

    // 3. Platform-specific step
    const platform = os.platform();

    if (platform === "linux") {
        console.log("\n=== LINUX: restarting systemd service ===");

        run("sudo systemctl restart socket-irc");
        run("systemctl status socket-irc --no-pager");

    } else {
        console.log(`\n=== NON-LINUX (${platform}): running production ===`);

        run("npm run production");
    }

    console.log("\n✔ DEPLOY COMPLETE");

} catch (err) {
    console.error("\n❌ DEPLOY FAILED");
    console.error(err.message);
    process.exit(1);
}