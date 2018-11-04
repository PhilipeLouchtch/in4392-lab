const fs = require("fs");
const path = require("path");
const nodezip = require('node-zip');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function buildPathToPackageFunction(packageName) {
    return path.join(__dirname, 'dist', packageName, 'index.js');
}

function zipPackage(packageName) {
    const zip = new nodezip();

    const pathToPackageFunction = buildPathToPackageFunction(packageName);
    const pathToPackageFile = fs.readFileSync(pathToPackageFunction);
    zip.file('index.js', pathToPackageFile);

    const zippedData = zip.generate({base64:false,compression:'DEFLATE'});

    const destFile = path.join(__dirname, 'dist', `${packageName}.zip`);
    fs.writeFileSync(destFile, zippedData, 'binary');

    return destFile;
}

function uploadToS3(pathToZippedPackage, packageName) {
    return exec(`aws s3 cp ${pathToZippedPackage} s3://lamdbas-fns/${packageName}.zip`, (err) => {
        if (err) {
            // node couldn't execute the command
            console.error(err);
            process.exit(1);
        }
    });
}

function assertValidPackageName(packageName) {
    if (!packageName) {
        console.error(`Usage: node ${__filename} < package name >`);
        process.exit(1);
    }

    let pathToFile = buildPathToPackageFunction(packageName);
    if (!fs.existsSync(pathToFile)) {
        console.error(`File does not exist: ${pathToFile}`);
        process.exit(1);
    }
}

function cleanup(pathToZip) {
    fs.unlinkSync(pathToZip);
}

const packageName = process.argv[2];
assertValidPackageName(packageName);

const pathToZip = zipPackage(packageName);
uploadToS3(pathToZip, packageName)
    .then(() => cleanup(pathToZip));



