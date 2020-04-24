document.addEventListener( "DOMContentLoaded", () => {

  // All needed references
  const notifyOverlay = document.getElementById( "notification-overlay" );
  const headline = notifyOverlay.querySelector( "h1" );
  const body = notifyOverlay.querySelector( "p" );
  const closeBtn = notifyOverlay.querySelector( "span" );

  // Hide overlay again
  closeBtn.addEventListener( "click", () => {
    notifyOverlay.style.display = "none";
  } );

  // Create a new request
  let req = new XMLHttpRequest();
  req.onreadystatechange = () => {
    if( req.readyState !== XMLHttpRequest.DONE || req.status !== 200 )
      return;

    // Nothing to display
    if( req.response === "null" )
      return;

    // Data to display, show overlay with content
    const data = req.response.split( ";" );
    notifyOverlay.style.display = "flex";
    headline.innerHTML = data[ 0 ];
    body.innerHTML = data[ 1 ];
  };

  // Open connection and send request
  req.open( "GET", "http://localhost:" + internal_server_port + "/notification" );
  req.send();

} );