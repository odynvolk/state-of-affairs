# State of affairs

An application for gathering data from different sources and doing an sentiment
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
```

### Usage

Start the project:

```
deno task start --allow-read --allow-env
```

This will watch the project directory and restart as necessary.

## Testing

Tests use the built in test runner in Deno. Try to write tests in a meaningful
way as to describe what it is you're testing and what resources are available.
Testing does not only test a piece of code that it actually works but is also
used for documentation purposes. Focus on testing what is vital for the feature.

To run all tests...

```bash
IS_TEST=true deno test --allow-read --allow-write --allow-env --allow-net --allow-run
```
