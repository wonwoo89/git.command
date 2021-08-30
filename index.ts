const minimist = require('minimist');
const util = require('util');
const { exec: execute, spawnSync } = require('child_process');
const exec = util.promisify(execute);
const echo = console.log;

interface Options {
  [key: string]: any;
}

const spawn = (cmdArgs: string[]) => spawnSync('git', cmdArgs, { stdio: 'inherit' });
const verifyBranch = (branchName: string, remoteCheck?: boolean) => exec(`git rev-parse --verify ${remoteCheck ? 'origin/' : ''}${branchName}`);

const masterCmd = async (args: string[], forceOptions?: Options) => {
  const isCheckout = args.includes('checkout')
  const isPull = args.includes('pull');

  if (isCheckout) {
    await spawn(['checkout', 'master'])
  }

  if (isPull) {
    await spawn(['pull', 'origin', 'master'])
  }
}

const checkoutCmd = async (args: string[]) => {
  const [branchName] = args.filter(arg => arg !== 'remote')

  if (!branchName) {
    echo('Enter branch name')
    return
  }

  try {
    const { stdout: localBranchID } = await verifyBranch(branchName);
    localBranchID && await spawn(['checkout', branchName]);
  } catch {
    try {
      const { stdout: remoteBranchID } = await verifyBranch(branchName, true);
      remoteBranchID && await spawn(['checkout', '-t', `origin/${branchName}`]);
    } catch {
      await spawn(['checkout', '-b', branchName]);
    }
  }
}

const branchCmd = async (args: string[]) => {
  if (!args.length) {
    await spawn(['branch']);
  }

  const isDelete = args.includes('delete');
  if (isDelete) {
    const [branchName] = args.filter(arg => arg !== 'delete' && arg !== 'remote')
    await spawn(['branch', '-D', branchName])
    return
  }

  const isRemote = args.includes('remote')
  if (isRemote) {
    await spawn(['branch', '-r'])
  }
}

const getBranchName = async () => {
  const { stdout } = await exec('git branch --show-current');
  return stdout.replace(/\n/gi, '').trim();
}

const pushCmd = async(args: string[]) => {
  const branchName = await getBranchName();
  await spawn(['push', 'origin', branchName]);
}

const pullCmd = async(args: string[]) => {
  const branchName = args && args.length ? args[0] : await getBranchName();
  await spawn(['pull', 'origin', branchName]);
}

const cmdSwitch = (args: string[]) => {
  const command = args.shift()

  switch (command) {
    case 'master':
      masterCmd(args);
      break;
    case 'checkout':
      checkoutCmd(args);
      break;
    case 'branch':
      branchCmd(args);
      break;
    case 'push':
      pushCmd(args);
      break;
    case 'pull':
      pullCmd(args);
      break;
  }
};

const main = async () => {
  const { _: args }: { _: string[] } = minimist(process.argv.slice(2));
  await cmdSwitch(args);
};

main();
