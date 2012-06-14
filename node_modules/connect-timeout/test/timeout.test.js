/**
 * Module dependencies.
 */

var connect = require('connect'),
    timeout = require('../index');

// Test server

var server = connect.createServer(
    timeout(),
    function(req, res, next){
        if (req.url == '/should/timeout'){
          // we do nothing!
        } else if (req.url == '/should/not/timeout') {
          res.writeHead(200);
          res.end();
        } else if (req.url == '/should/interrupt/timeout') {
          req.clearTimeout();
          setTimeout(function(){
            res.writeHead(200);
            res.end();
          }, 12000); // make sure this timer is > timeout timer
        }
    }
);

// Tests

exports['timeouts'] = function(assert){
    assert.response(server,
        { url: '/should/timeout' },
        { status: 500 });
    
    assert.response(server,
        { url: '/should/not/timeout' },
        { status: 200 });
        
    assert.response(server,
        { url: '/should/interrupt/timeout' },
        { status: 200 });
};