Zest-Addon
==========

Zest Firefox add-on


## Building

1. Clone the repo
2. `cd` into the cloned repo
3. Run `npm install` to install all the dependencies
4. Run `grunt build` to start building. This would install jetpack and put the generated .xpi in tmp/dist-stable/

## Running in a test environment

Run `grunt run`

## Some useful commands

#### `grunt`

It performs jshint on the source in src/ and starts a watcher to pick up any change in files and run jshint on them.

#### `grunt run`

Run the add-on in a test environment in Firefox.

#### `grunt run:experimental`

Run the add-on in the trunk version of Firefox add-on SDK. Before running this, the trunk version must be installed by running `grunt mozilla-addon-sdk:master`

#### `grunt release`

Generate an .xpi using the stable version of the add-on SDK.

#### `grunt release:experimental`

Generate an .xpi using the master branch of the add-on SDK. This command requires installing the master branch of the sdk in advance.

#### `grunt test`

Run the add-on SDK unit tests using the stable version of the SDK.

#### `grunt test:experimental`

Run the add-on SDK unit tests using the trunk version of the SDK.
