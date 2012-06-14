# Connect-timeout middleware

Connect timeout sets a global timeout for responses.

## Usage

	connect.createServer(
	    require('./path/to/connect-timeout')({options})
	)

### Options

#### Code

Error code to respond with in case of timeout (500)

#### Time

Number of ms after which the timeout is triggered (8000)

## What about long-running requests?

When the timeout is enabled, a `clearTimeout` method is attached to the request.

	function(req, res, next){
	    req.clearTimeout();
	    setTimeout(function(){
	      res.writeHead(200);
	      res.end();
	      // this will work
	    }, 20000);
	}

## Author

Guillermo Rauch &lt;guillermo@learnboost.com&gt;