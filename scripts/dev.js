const { spawn } = require('node:child_process');
const path = require('node:path');
const { checkBackend } = require('./backendHealth');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [];

let stopping = false;

const stopProcesses = (exitCode = 0) => {
  if (stopping) return;
  stopping = true;
  for (const { child } of processes) {
    if (child.exitCode === null) child.kill('SIGTERM');
  }
  process.exitCode = exitCode;
};

const startProcess = (args, { stopOnExit = true } = {}) => {
  const child = spawn(npmCommand, args, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  processes.push({ child, stopOnExit });
  child.on('error', (error) => {
    console.error(`Failed to start development process: ${error.message}`);
    stopProcesses(1);
  });
  child.on('exit', (code) => {
    if (!stopping && (stopOnExit || code !== 0)) stopProcesses(code || 1);
  });
};

async function startDevelopment() {
  const backend = await checkBackend();
  if (backend.healthy) {
    console.log(`Reusing healthy MIFEM API on port ${backend.port}.`);
  } else if (backend.reachable) {
    console.warn(`An API is already responding on port ${backend.port}, but it is unhealthy; not starting a duplicate backend.`);
  } else {
    startProcess(['run', 'dev:backend'], { stopOnExit: false });
  }

  startProcess(['--prefix', 'Frontend_Mifem', 'run', 'dev']);
}

process.on('SIGINT', () => stopProcesses(0));
process.on('SIGTERM', () => stopProcesses(0));

startDevelopment().catch((error) => {
  console.error(`Failed to check backend status: ${error.message}`);
  stopProcesses(1);
});
