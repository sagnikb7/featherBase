import chalk from 'chalk';

const printRequests = (msg) => chalk.green(msg);
const printErrors = (msg) => chalk.red(msg);

export { printRequests, printErrors };
