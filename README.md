# State of affairs

An application for gathering data from different sources and doing a sentiment
analysis on it.

Fetches...

1. Tweets from [https://twitter.com/](https://twitter.com/)

### Prerequisites:

- Deno

For running this fabulous little thing. On MacOS the easiest way to install Deno
is through Brew package manager.

```bash
$ brew install deno
```

- MongoDB

For storing tweets. On MacOS the easiest way to install Deno is through Brew
package manager.

```bash
$ brew install mongodb-community
```

Configuration:

Create a .env file with values needed in your setup.

```
TWITTER_BEARER_TOKEN=<YOUR-TOKEN>
TWITTER_PULL=true
TWITTER_PULL_LIMIT=<NUMBER-OF-TWEETS-TO-PULL>
```

- Python

You need Python 3 on your machine. 

- Miniconda (optional)

For handling the packages needed.

```bash
$ curl https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh -o Miniconda3-latest-MacOSX-x86_64.sh
$ chmod +x Miniconda3-latest-MacOSX-arm64.sh
$ ./Miniconda3-latest-MacOSX-arm64.sh -b -p $HOME/miniconda
$ source ~/miniconda/bin/activate
```

- Pytorch, Transformers & Websockets

For using trained models and analysing sentiment through websocket calls.

```bash
$ cd sentiment
$ pip install -r requirements.txt
```

### Usage

Start the sentiment server:

```bash
python ./sentiment/server.py
```

Start the Deno server:

```bash
deno task start --allow-read --allow-env
```

This will watch the project directory and restart as necessary.

Or start them at the same time for running continuously through a script:

```bash
./scripts/start.sh
```

## Testing

Tests use the built in test runner in Deno. Try to write tests in a meaningful
way as to describe what it is you're testing and what resources are available.
Testing does not only test a piece of code that it actually works but is also
used for documentation purposes. Focus on testing what is vital for the feature.

To run all tests...

```bash
IS_TEST=true deno test --allow-read --allow-write --allow-env --allow-net --allow-run
```
