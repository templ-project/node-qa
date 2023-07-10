import {Command} from 'commander';

export interface NodeQaArgs {
    config: string;
}

let args: NodeQaArgs | undefined = undefined; 

function readArgs (): NodeQaArgs {
    const program = new Command();
 
    program
    .version('0.0.1')
    .option(
        '-c, --config <config>',
        `Path to the configuration file`
    )
    .option(
        '--configure',
        'Generate the configuration file',
    // )
    // .option('-e, --ide <ide>', `configure an IDE: ${Object.values(supportedIdes).join(', ')}`, supportedIdes.VSCODE)
    // .option(
    //     '-vsccm, --vscode-cpp-module <vscodeCppModule>',
    //     `configure VSCode to a specific C/C++ module: ${Object.values(supportedVscCppModules).join(', ')}`,
    //     supportedVscCppModules.VSCODE_CLANGD,
    // )
    // .option('-omc, --overwrite-main-cc', 'overwrite main.cc content with default standard code from template')
    // .option(
    //     '-cs, --c-standard <cStandards>',
    //     `C Standard (set the most important as last value): ${Object.keys(supportedCStandards)}`,
    //     (value, previous) => [...new Set(previous.concat([value]))],
    //     [supportedCStandards.c11],
    // )
    // .option(
    //     '-cpps, --cpp-standard <cppStandards>',
    //     `C++ Standard (set the most important as last value): ${Object.keys(supportedCppStandards)}`,
    //     (value, previous) => [...new Set(previous.concat([value]))],
    //     [supportedCppStandards.cxx11],
    );

    program.parse(process.argv);

    return program.opts() as NodeQaArgs;
}

if (!args) {
    args = readArgs();
}

console.log(args);

export {args};