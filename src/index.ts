const minimist = require('minimist');
const util = require('util');
const { exec: execute, spawn } = require('child_process');
const exec = util.promisify(execute);
const echo = console.log;

type Args = string[];
interface BranchInfo {
  branchID: string;
  isRemote: boolean;
}

const git = (cmdArgs: Args) => spawn('git', cmdArgs, { stdio: 'inherit' });
const getBranchName = async () => {
  const {stdout: branchName} = await exec('git branch --show-current');
  return branchName.replace(/\n/gi, '').trim();
}
const getBranchID = async (branchName: string): Promise<BranchInfo> => {
  let branchID: string;
  let isRemote: boolean;
  const verify = (name: string) => exec(`git rev-parse --verify ${name}`)

  try {
    const { stdout: localBranchID } = await verify(branchName)
    branchID = localBranchID
  } catch {
    const { stdout: remoteBranchID } = await verify(`origin/${branchName}`)
    branchID = remoteBranchID
    isRemote = true
  }

  return {
    branchID,
    isRemote,
  }
};

const masterCmd = async (args: Args) => {
  const isCheckout = args.includes('checkout')
  const isPull = args.includes('pull');

  if (isCheckout) {
    await git(['checkout', 'master'])
  }

  if (isPull) {
    git(['pull', 'origin', 'master'])
  }
}

const checkoutCmd = async (args: Args) => {
  const [branchName] = args.filter(arg => arg !== 'remote')

  if (!branchName) {
    echo('Enter branch name')
    return;
  }

  const { branchID, isRemote } = await getBranchID(branchName);

  if (branchID) {
    isRemote ? await git(['checkout', '-t', `origin/${branchName}`]) : await git(['checkout', branchName]);
    return;
  }

  git(['checkout', '-b', branchName]);
}

const branchCmd = async (args: Args) => {
  if (!args.length) {
    await git(['branch']);
    return;
  }

  const isDelete = args.includes('delete');
  if (isDelete) {
    const branchNames = args.filter(arg => arg !== 'delete' && arg !== 'remote')
    await git(['branch', '-D', ...branchNames])
    return
  }

  const isRemote = args.includes('remote')
  if (isRemote) {
    await git(['branch', '-r'])
  }
}

const pushCmd = async () => {
  const branchName = await getBranchName();
  await git(['push', 'origin', branchName]);
}

const pullCmd = async () => {
  const branchName = await getBranchName();
  await git(['pull', 'origin', branchName]);
}

const runGitCommand = (args: string[]) => {
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
      pushCmd();
      break;
    case 'pull':
      pullCmd();
      break;
  }
};

const main = async () => {
  const { _: args }: { _: Args } = minimist(process.argv.slice(2));
  await runGitCommand(args);
};

main();
