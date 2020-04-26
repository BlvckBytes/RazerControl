const fs = require( "fs" );
const exec = require( "child_process" ).exec;

let fFolder = "~/Library/RazerControl/";
const fName = "persistent_settings.json";

/**
 * Tries to get the content of the settings json file
 * @returns Promise, resolves with content, if exists
 */
const readSettings = () => {
  // Generate promise for await call
  return new Promise( ( resolve, reject ) => {
    // Try to read the file on standardized path
    fs.readFile( fFolder + fName, "utf-8", ( err, data ) => {
      resolve( data );
    } );
  } );
};

/**
 * Tries to get the executing user of this program, to decide what path
 * to use for this settings file (multi-user functionallity and such)
 * @returns Promise, either name or starting with ERR if occurred
 */
const getUser = () => {
  // Generate promise for await call
  return new Promise( ( resolve, reject ) => {

    // Execute command in shell
    const command = "whoami";
    exec( command, ( error, stdout, stderr ) => {
      // Notify of error with this command
      if( error ) {
        reject( "ERR: " + error + ";" + stdout + ";" + stderr );
        return;
      }

      // Command executed successfully
      resolve( stdout.trim() );
    } );

  } );
};

/**
 * Creates the settings file with it's parent directory, if it doesn't exist
 * @returns Promise, OK starting if it worked, ERR otherwise
 */
const createSettingsFile = () => {
  // Generate promise for await call
  return new Promise( ( resolve, reject ) => {

    // Execute command in shell
    const command = "mkdir -p " + fFolder + " && touch " + fFolder + fName;
    exec( command, ( error, stdout, stderr ) => {
      // Notify of error with this command
      if( error ) {
        reject( "ERR: " + error + ";" + stdout + ";" + stderr );
        return;
      }

      // Command executed successfully
      resolve( "OK: Settings file either created or touched." );
    } );

  } );
};

/**
 * Initialize this storage, create the file and read it
 * @param done Callback with either an ERR or the json contents
 */
const init = async ( done ) => {
  try {
    // Try to get the executing user, report error if occurred
    let user = await getUser();
    if( user.startsWith( "ERR: " ) ) {
      done( user );
      return;
    }

    // Replace ~ with absolute path now
    fFolder = fFolder.replace( "~", "/Users/" + user );

    // Create and read settings
    await createSettingsFile();
    let settings = await readSettings();
    done( settings );
  } catch ( e ) {
    done( "ERR: " + e );
  }
};

/**
 * Stores the provided settings in the previously loaded file
 * @param settings Settings to write
 */
const store = ( settings ) => {
  fs.writeFile( fFolder + fName, settings, err => {
    if( err )
      console.log( "ERR: " + err );
  } );
};

module.exports = {
  read: init,
  write: store
};