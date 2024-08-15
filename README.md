# EZMC CLI

Server management CLI for self-hosting Minecraft Java Edition with AWS Elastic Container Service. This CLI is a wrapper around the [vatertime/minecraft-spot-pricing](https://github.com/vatertime/minecraft-spot-pricing) Cloudformation template and the AWS SDK that contains useful commands for orchestrating containers without logging in or using the AWS directly (after initial account creation and billing setup).

## Usage

```sh
# clone the repo
git clone git@github.com:jseashell/ezmc-cli.git
# install dependencies
npm install
# build the project
npm run build
# create your server
ezmc new s1
# after a short wait you'll see:
# server ip 168.192.0.1
```

> Requires Node.js v20+

## Commands

| Command  | Description                                                                  |
| :------- | :--------------------------------------------------------------------------- |
| `cip`    | Copies a server's ip address to the clipboard.                               |
| `ip`     | Displays a server's ip address.                                              |
| `ls`     | Lists your servers.                                                          |
| `new`    | Creates a new server. Wait 5 minutes for commands like `ipaddr` or `status`. |
| `params` | Get/set server parameters.                                                   |
| `rm`     | Removes a server (cannot be undone).                                         |
| `start`  | Starts a server.                                                             |
| `status` | Displays a server's status.                                                  |
| `stop`   | Stops a server.                                                              |
| `help`   | Displays help.                                                               |

## Options

### Notable Defaults

| Option        |  Value   |
| :------------ | :------: |
| Max players   |    10    |
| Difficulty    |  Normal  |
| View Distance |    10    |
| Game Mode     | Survival |
| Level Type    | Default  |

## Infrastructure

Resources are provisioned using your current AWS CLI profile, falling back to the default profile, and lastly falling back to `us-east-1` as a default region.

AWS Elastic Container Service is used to deploy the Minecraft image. EC2 instance(s) are spun up upon request and remain running until told to shutdown via the `stop` command or stop and remove the server entirely with `rm`.

> Contributors are not responsible for any AWS costs incurred from using this CLI. Use at your own discretion.

Each "server" is given its own networking stack and ECS cluster for simple clean up -- keeps it ez. By default, your AWS account will be limited to 5 VPCs. With the default VPC, and assuming zero other provisioned resources, that means you can have a maximum of 4 servers operating simulateously.

## Contributing

### Development

```sh
# use ezmc locally without npm install --global
npm run link
# verify with
ezmc ls
```

### Testing

```sh
# run tests
npm test
```

### Pull Requests

Pull requests are welcomed. Please leave detailed reasoning for your change. Bugs should include reproduction steps. OS can sometimes be helpful but this project lets [commander.js](https://github.com/tj/commander.js) manage cross-platform compatibility.

## License

This project is distributed under the terms of the [MIT License](./LICENSE).
