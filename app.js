// Modules needed
const { menubar } = require( 'menubar' );
const express = require( 'express' );
const exec = require( 'child_process' ).exec;
const cors = require( 'cors' );

// Webserver
const port = 9138;
const webserv = express();
webserv.use( cors() );

// All needed properties for the menubar entry
const mb = menubar( {
  browserWindow: {
    frame: false,
    width: 255,
    height: 415,
    hasShadow: true,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false
  }
} );

// Start internal webserver on specified port
const servInst = webserv.listen( port, () => {
  console.log( "Internal webserver running on port " + port + "!" );
} );

// Notify when menubar app is up
mb.on( 'ready', () => {
  console.log( 'Menubar app is ready for use!' );
} );

// /exec path route, used for command execution
webserv.get( "/exec", ( req, res ) => {
  // Get arguments for binary from URL
  const args = req.query.command;

  // Nothing provided
  if( !args ) {
    res.send( "ERR: No command provided" );
    return;
  }

  // Dispatch command in shell
  const command = "/usr/local/bin/osx-razer-led " + req.query.command;
  exec( command, ( err, stderr ) => {
    if( err )
      res.send( "ERR: " + err + " " + stderr );
    else
      res.send( "OK" );
  } );
} );

// /terminate path route, used to shut this tool down
webserv.get( "/terminate", ( req, res ) => {
  // Send OK so no error appears
  console.log( "Going to terminate now!" );
  res.send( "OK" );

  // Shutdown express
  console.log( "Quitting web-server..." );
  servInst.close();

  // Shut down menubar item
  console.log( "Quitting main application..." );
  mb.app.quit();
} );
