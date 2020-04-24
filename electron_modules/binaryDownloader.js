const exec = require( "child_process" ).exec;
const https = require( "https" );
const fs = require( "fs" );

// Target path, for rw
const fPath = "/usr/local/bin/osx-razer-led";

/**
 * Initialize the downloader and try to get the needed binary,
 * if not already existent on the user's system
 * @param done Callback which returns a string with result
 */
const init = async ( done ) => {
  try {
    // File already downloaded, skip further processing
    let res = await getFileContent();
    if( res ) {
      done( "OK: Binary already existed!" );
      return;
    }

    // Get latest release url and execute a wget on it
    let releaseLink = await getLatestReleaseURL();
    const command = "/usr/local/bin/wget " + releaseLink + " -O /usr/local/bin/osx-razer-led";
    exec( command, ( error, stdout, stderr ) => {
      // Notify of error with this command
      if( error ) {
        done( "ERR: " + error + ";" + stdout + ";" + stderr );
        return;
      }

      // Make it executable
      exec( "chmod +x /usr/local/bin/osx-razer-led" ).on( "exit", () => {
        // Done!
        done( "NEW: Done downloading binary!" );
      } );
    } );
  }

  // Error during execution, notify user with that message
  catch ( e ) {
    done( "ERR: " + e );
  }
};

/**
 * Get the latest release download URL
 * @returns Browser download url string, as a promise
 */
const getLatestReleaseURL = () => {
  // Generate promise for await call
  return new Promise( async ( resolve, reject ) => {

    try {
      // Make request and parse data
      const relURL = "https://api.github.com/repos/dylanparker/osx-razer-led/releases/latest";
      const apiRes = await makeRequest( relURL );
      let res = JSON.parse( apiRes );
      let targLink = undefined;
      let existingAssets = res.assets;

      // Loop found assets
      for( let i = 0; i < existingAssets.length; i++ ) {
        let currAsset = existingAssets[ i ];

        // Only need the binary asset
        if( currAsset.name !== "osx-razer-led" )
          continue;

        // Get the download link from found asset
        targLink = currAsset.browser_download_url;
        break;
      }

      // Needed asset not found
      if( targLink === undefined )
        reject( "Could not find target asset in release!" );

      // Resolve with download link
      resolve( targLink );
    }

    // Reject with error message
    catch ( e ) {
      reject( e );
    }

  } );
};

/**
 * Make a GET request on the provided URL
 * @param url URL to request
 * @returns Page content string, as a promise
 */
const makeRequest = ( url ) => {
  url = url.replace( "https://", "" ).split( /\/(.+)/ );

  // Options needed for this releases page request
  const reqOptions = {
    host: url[ 0 ],
    port: 443,
    path: "/" + url[ 1 ],
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  };

  // Generate promise for await call
  return new Promise( ( resolve, reject ) => {

    // Generate request
    const req = https.get( reqOptions, ( resp ) => {
      // Buffer
      let data = "";

      // Build chunked data into one string
      resp.on( "data", ( chunk ) => {
        data += chunk;
      } );

      // Resolve with read data
      resp.on( "end", () => {
        resolve( data );
      } );

    } );

    // Reject with error message
    req.on( "error", ( err ) => {
      reject( err.message );
    } );

  } );
};

/**
 * Tries to get the content of the needed executable
 * @returns Promise, resolves with content, if exists
 */
const getFileContent = () => {
  // Generate promise for await call
  return new Promise( ( resolve, reject ) => {
    // Try to read the file on standardized path
    fs.readFile( fPath, "utf-8", ( err, data ) => {
      resolve( data );
    } );
  } );
};

// Only needs to be initialized from outside
module.exports = init;