const minimist = require('minimist');
const util = require('util');
const {exec: execute, spawnSync} = require('child_process');
const exec = util.promisify(execute);
const echo = console.log;

type Args = string[];
interface Options {
  [key: string]: any;
}

const spawn = (cmdArgs: Args) => spawnSync('git', cmdArgs, { stdio: 'inherit' })

const masterCmd = async (args: Args, forceOptions?: Options) => {
  const isCheckout = args.includes('checkout')
  const isPull = args.includes('pull');

  if (isCheckout) {
    await spawn(['checkout', 'master'])
  }

  if (isPull) {
    await spawn(['pull', 'origin', 'master'])
  }
}

const checkoutCmd = (args: Args, forceOptions?: Options) => {

}

const branchCmd = (args: Args, forceOptions?: Options) => {

}

const cmdSwitch = (args: Args) => {
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
  }
};

const main = async () => {
  const {_: args}: { _: Args } = minimist(process.argv.slice(2));
  await cmdSwitch(args);
};

main();
