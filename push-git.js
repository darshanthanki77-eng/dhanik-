const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const dir = process.cwd();

async function push() {
    try {
        // Initialize if not already
        if (!fs.existsSync(path.join(dir, '.git'))) {
            console.log('Initializing repository...');
            await git.init({ fs, dir });
        }

        // Add all files
        console.log('Adding files...');
        const files = await git.listFiles({ fs, dir });
        for (const file of files) {
            await git.add({ fs, dir, filepath: file });
        }

        // Find untracked files (basic check)
        const allFiles = [];
        function walk(currentDir) {
            const list = fs.readdirSync(currentDir);
            for (const item of list) {
                const fullPath = path.join(currentDir, item);
                const relPath = path.relative(dir, fullPath);
                if (relPath.startsWith('.git') || relPath.includes('node_modules')) continue;
                if (fs.statSync(fullPath).isDirectory()) {
                    walk(fullPath);
                } else {
                    allFiles.push(relPath);
                }
            }
        }
        walk(dir);

        for (const file of allFiles) {
            await git.add({ fs, dir, filepath: file });
        }

        console.log('Committing changes...');
        await git.commit({
            fs,
            dir,
            message: 'Premium UI upgrades and Donut Chart visibility fixes',
            author: {
                name: 'Antigravity AI',
                email: 'antigravity@google.com'
            }
        });

        console.log('Setting remote...');
        // We can't easily check remotes with isomorphic-git CLI style without config
        // But we can just push to the URL

        console.log('Pushing to GitHub...');
        await git.push({
            fs,
            http,
            dir,
            remote: 'origin',
            ref: 'main',
            url: 'https://github.com/darshanthanki77-eng/dhanki.git',
            force: true // Using force because it might be a fresh init or remote change
        });

        console.log('Success!');
    } catch (err) {
        console.error('Error during git operations:', err);
        process.exit(1);
    }
}

push();
