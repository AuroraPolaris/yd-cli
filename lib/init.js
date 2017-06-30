var downloadGitRepo = require('download-git-repo');
var colors = require('colors');
var { spawn, exec } = require('child_process');
var fs = require('fs');

var template = 'base';
var projectName = 'new project';
var templateRepository = 'AuroraPolaris/yd-cli-template';
var temp = '.yd-cli-template';

var command = function (cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, function (error, stdout, stderr) {
      error ? reject(error) : resolve(stdout);
    });
  });
}

// clear exist template
var clean = function () {
  if (fs.existsSync(temp)) {
    return command('rm -r ' + temp)
  } else {
    return Promise.resolve();
  }
}
// download repo
var download = function () {
  console.log('start download template...')
  return new Promise(function (resolve, reject) {
    downloadGitRepo(templateRepository, temp, { clone: false }, function (err) {
      console.log('download finish...')
      err ? reject(err) : resolve();
    })
  })
}
// copy files
var setup = function () {
  console.log('start setup...')
  var cmd = `cp -r ${temp}/templates/${template} ${projectName}`;

  var packagePath = `${temp}/templates/${template}/package.json`;
  var packageContent = fs.readFileSync(packagePath, 'utf-8')
  packageContent = packageContent.replace(/\$PROJECT_NAME/g, projectName);
  fs.writeFileSync(packagePath, packageContent);

  var processPath = `${temp}/templates/${template}/processes.json`;
  var processContent = fs.readFileSync(processPath, 'utf-8')
  processContent = processContent.replace(/\$PROJECT_NAME/g, projectName);
  fs.writeFileSync(processPath, processContent);

  console.log('setup...finish')
  return command(cmd);
}
var installDependencies = function () {
  console.log('start install npm package...')
  var cmd = `cd ${projectName};npm install; cd ..`;
  return command(cmd).then(function (stdout) {
    console.log(stdout);
  });
}
// install finish
var finish = function () {
  var l = function () {console.log.apply(console, arguments)};
  l(colors.green('---- Install Finish ----'));
  l(colors.white(`How to start your project:`));
  l(colors.gray(`    cd ${projectName}`));
  l(colors.gray(`    npm run dev`));
}

//download()
module.exports = function (name) {
  projectName = name;
  clean()
    .then(download)
    .then(setup)
    .then(installDependencies)
    .then(clean)
    .then(finish)
    .catch(function (err) {
      console.log('Error:', err)
    })
}
