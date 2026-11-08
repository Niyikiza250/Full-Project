const { spawn } = require('node:child_process');
const path = require('node:path');
const { checkBackend } = require('./backendHealth');

async function startBackend() {
  const backend = await checkBackend();
  if (backend.reachable) {
    if (backend.healthy) {
      console.log(`MIFEM API is already healthy on port ${backend.port}; reusing it.`);
    } else {
      console.warn(`An API is already responding on port ${backend.port}, but it is unhealthy. Not starting a duplicate backend.`);
    }
    return;
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npmCommand, ['run', 'dev:watch'], {
    cwd: path.resolve(__dirname, '..', 'Backend_MIFEM'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('error', (error) => {
    console.error(`Failed to start backend development server: ${error.message}`);
    process.exitCode = 1;
  });
  child.on('exit', (code) => {
    process.exitCode = code || 0;
  });

  const forwardSignal = (signal) => {
    if (child.exitCode === null) child.kill(signal);
  };
  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));
}

startBackend().catch((error) => {
  console.error(`Failed to check backend status: ${error.message}`);
  process.exitCode = 1;
});
