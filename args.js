import {contains, isEmpty, merge, mergeAll, range, split} from 'ramda';

export const options = {
    headless: {
        defaultValue: false,
        acceptedValues: [false, true]
    },
    large: {
        defaultValue: true,
        acceptedValues: [false, true]
    },
    port: {
        defaultValue: 5000,
        acceptedValues: range(1, 10000)
    },
    logpath: {
        defaultValue: './log.txt',
        acceptedValues: 'path to logpath w/o quotes (ex: path/to/log.txt)'
    },
    configpath: {
        defaultValue: './config.json',
        acceptedValues: 'path to config w/o quotes (ex: path/to/config.json)'
    },
    logdetail: {
        defaultValue: 0,
        acceptedValues: range(0, 4)
    }
};

const optionsToCheck = ['headless', 'large', 'port'];

// returns all the default values from options as a dict {key: default, ...}
const defaultOptions = () => {
    return mergeAll(Object.keys(options).map( (key) => {
        return {[key]: options[key].defaultValue };
    }));
};

function mergeArgs (args) {
    const userOptions = {};

    const parseArgValue = (arg) => {
        switch (arg[0]) {
            case 'headless':
            case 'large':
                return [arg[0], ((arg[1] === 'true') ? true : false)];
            case 'port':
            case 'logdetail':
                return [arg[0], parseInt(arg[1], 10)];
            default:
                return arg;
        }
    };

    const wrongFormat = (arg) => arg.length !== 2;

    const wrongArg = (arg) => !contains(arg[0], Object.keys(options));

    const wrongValue = (arg) => {
        const acceptedValues = options[arg[0]].acceptedValues;
        if (contains(arg[0], optionsToCheck)) {
            return !contains(arg[1], acceptedValues);
        }
        return false;
    };

    const wrongFormatError = (arg) => {
        return `Command Line argument \'${arg}]'' was not of key=value format`;
    };

    const wrongArgError = (arg) => {
        return `Can\'t find \'${arg[0]}\' in the possible options...` +
        `Here are the options: ${Object.keys(options)}`;
    };

    const wrongValueError = (arg) => {
        if (arg[0] === 'port') {
            return 'Port number must be an integer between 1 and 9999';
        }

        return `Can\'t find \'${arg[1]}\' in the possible values for` +
        `\'${arg[0]}\'...` +
        `Valid values for this key are: ${options[arg[0]].acceptedValues}`;
    };

    // args are expected to be in ['key=value', 'key1=value2' ...] format
    try {
        if (!isEmpty(args)) {
            args.forEach( expression => {
                const arg = split('=', expression);
                const parsedArg = parseArgValue(arg);
                if (wrongFormat(parsedArg)) {
                    throw new Error(wrongFormatError(parsedArg));
                } else if (wrongArg(parsedArg)) {
                    throw new Error(wrongArgError(parsedArg));
                } else if (wrongValue(parsedArg)) {
                    throw new Error(wrongValueError(parsedArg));
                } else {
                    userOptions[parsedArg[0]] = parsedArg[1];
                }
            });
        }

    } catch (error) {
        console.error(`Error. Please try again... ${error}`);
        process.exit(-1);

    } finally {
        return merge(defaultOptions(), userOptions);
    }
}

// if in development mode, just pass in an empty args object => defaults all
const acceptedArgs = () => {
    return process.env.NODE_ENV === 'development' ? {} : process.argv.slice(2);
};

export const OPTIONS = mergeArgs(acceptedArgs());
