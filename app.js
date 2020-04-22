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
    height: 410,
    hasShadow: true,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false
  }
} );

// /exec path route
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
    // Error occurs only if binary not found, afaik
    if( err )
      res.send( "ERR: " + err + " " + stderr );
    else
      res.send( "OK" );
  } );
} );

// Start internal webserver on specified port
webserv.listen( port, () => {
  console.log( "Internal webserver running on port " + 9138 + "!" );
} );

// Notify when menubar app is up
mb.on( 'ready', () => {
  console.log( 'Menubar app is ready for use!' );
} );
