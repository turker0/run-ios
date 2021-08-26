#! /usr/bin/env node

const commander = require("commander");

const Prefered = [
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12",
  "iPhone 12 mini",
];

commander
  .version(require("./package.json").version)
  .description("Quick React-Native Run-IOS")
  .action(() => start());

commander.parse(process.argv);

function start() {
  if (require("os").platform() == "darwin") {
    const inquirer = require("inquirer");

    const { spawn, exec } = require("child_process");

    const getIOSDeviceProcess = exec(
      "xcrun simctl list --json devices available"
    );

    let message = "";

    getIOSDeviceProcess.stdout.on(
      "data",
      (jsonString) => (message += jsonString)
    );

    getIOSDeviceProcess.on("exit", () => {
      const json = JSON.parse(message);

      const choices = [];

      for (const key of Object.keys(json.devices)) {
        if (key.startsWith("com.apple.CoreSimulator.SimRuntime.iOS")) {
          for (const device of json.devices[key]) {
            if (device.name.includes("iPhone") && !device.name.includes("SE"))
              choices.push(device.name);
          }
        }
      }

      inquirer
        .prompt([
          {
            type: "list",
            name: "device",
            message: "Quick React-Native Run-IOS",
            choices: choices.sort((a, b) =>
              b.localeCompare(a, "en", { sensitivity: "base" })
            ),
          },
        ])
        .then(({ device }) =>
          spawn("npx", [`react-native`, `run-ios`, `--simulator="${device}"`], {
            stdio: "inherit",
            shell: true,
          })
        );
    });
  } else {
    console.log("Sorry, run-ios is not supported with your operating system");
  }
}
