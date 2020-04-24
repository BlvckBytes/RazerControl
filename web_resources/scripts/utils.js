/**
 * Dispatches the given url data by sending it to the built-in server
 * @param urlData Get path aswell as get key value pairs
 * @param success Gets called if this dispatch succeeded
 */
function serverDispatch( urlData, success ) {
  let req = new XMLHttpRequest();

  // Listen for state changes on the over all progress on request
  req.onreadystatechange = () => {
    if( req.readyState !== XMLHttpRequest.DONE )
      return;

    // Server not properly reachable
    if( req.status !== 200 ) {
      window.alert( "Statuscode was " + req.status + ", couln't talk to server." );
      return;
    }

    // Error message from server, display if exists
    if( req.response.startsWith( "ERR" ) )
      window.alert( req.response );

    // Invoke success callback
    if( success !== undefined )
      success();
  };

  // Open connection and send request
  req.open( "GET", "http://localhost:9138/" + urlData );
  req.send();
}