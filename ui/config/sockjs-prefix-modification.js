// Thanks to:
// https://gist.github.com/zsalzbank/cdee4f852e4a89c116eb7a28491bbf63

// webpack-dev-server does not currently have a way to change the
//   path of the socket being used for hot reloads. It is pending
//   in https://github.com/webpack/webpack-dev-server/pull/1553,
//   but until then, we can use the following to modify the server
//   and client to have a custom path.

// Pass a prefix path in where you'd like your socket to be served
//   from.
module.exports = function (prefix) {
  const plugin = [
    "search-and-replace",
    {
      rules: [
        {
          search: '/sockjs-node',
          replace: prefix + 'sockjs-node',
        },
      ],
    },
  ];

  return {
    // Use the plugin in your webpack configuration to change the
    //   path that the client is using.
    plugin,

    // Run this method before requiring webpack-dev-server in your
    //   server code to modify the server.
    fixWebpackDevServer: function () {
      require('@babel/register')({
        ignore: [],
        babelrc: false,
        compact: false,
        plugins: [plugin],
        configFile: false,
        sourceMaps: false,
        only: [/webpack-dev-server/],
      });
    },
  };
}
