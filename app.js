// Modules needed
const { menubar } = require( "menubar" );
const express = require( "express" );
const exec = require( "child_process" ).exec;
const cors = require( "cors" );

// Self-written modules
const storage = require( "./electron_modules/settingsStorage" );
const downloader = require( "./electron_modules/binaryDownloader" );

let displayPopup = undefined;
let settings = undefined;

const launch = () => {
  /////////////////////////////
  //      MENUBAR ITEM      //
  ////////////////////////////

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
    },
    preloadWindow: true,
    showDockIcon: false
  } );

  // Notify when menubar app is up
  mb.on( "ready", () => {
    console.log( "Menubar app is ready for use!" );
  } );

  /////////////////////////////
  //       WEBSERVER        //
  ////////////////////////////

  // Webserver port, also make it use CORS (Cross-origin resource sharing)
  // in order to be able to communicate duplex entirely on 127.0.0.1
  const port = 9138;
  const webserv = express();
  webserv.use( cors() );

  // Start internal webserver on specified port
  const servInst = webserv.listen( port, () => {
    console.log( "Internal webserver running on port " + port + "!" );
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
    res.send( "OK" );
    terminate();
  } );

  // /notification, interface between browser and backend to display notifications on launch
  webserv.get( "/notification", ( req, res ) => {
    // No popup to display
    if( displayPopup === undefined ) {
      res.send( "null" );
      return;
    }

    // Reset popup after display
    res.send( displayPopup );
    displayPopup = undefined;
  } );

  // /settingsread to request current settings
  webserv.get( "/settingsread", ( req, res ) => {
    res.send( settings );
  } );

  // /settingswrite to update current settings
  webserv.get( "/settingswrite", ( req, res ) => {
    settings = req.query.settings;
    storage.write( settings );
    res.send( "OK" );
  } );

  /**
   * Terminate this application, with it's menubar item and
   * it's internal webserver
   */
  const terminate = () => {
    console.log( "Going to terminate now!" );

    // Shutdown express
    console.log( "Quitting web-server..." );
    servInst.close();

    // Shut down menubar item
    console.log( "Quitting main application..." );
    mb.app.quit();
  };
};

/////////////////////////////
//   BINARY DOWNLOADER    //
////////////////////////////

// Include and call downloader module
downloader( message => {

  // Notify the user of the error while trying to download binary
  if( message.startsWith( "ERR" ) ) {
    displayPopup = "Error while trying to download the needed binary!;" +
                   "Sadly, the resource could not be downloaded. " +
                    message;
  }

  // Notify user of this new download
  else if( message.startsWith( "NEW" ) ) {
    displayPopup = "Successfully downloaded the needed binary!;"+
                   "This software detected the fact, that you were missing the " +
                   "'osx-razer-led' binary and automatically downloaded it for you from the github repo!";
  }

  /////////////////////////////
  //    SETTINGS STORAGE    //
  ////////////////////////////

  storage.read( json => {

    // Notify the user of the error while trying to create or read settings file
    if( json.startsWith( "ERR" ) && displayPopup === undefined ) {
      displayPopup = "Error while trying to read or create the settings file!;"+
                     "Sadly, the resource could not be used. " +
                     json
    }

    settings = json;

    // Launch program, now that this needed binary exists and settings are read
    launch();
  } );
} );