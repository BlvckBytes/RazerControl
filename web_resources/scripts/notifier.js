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

  serverDispatch( "notification", response => {
    // Nothing to display
    if( response === "null" )
      return;

    // Data to display, show overlay with content
    const data = response.split( ";" );
    notifyOverlay.style.display = "flex";
    headline.innerHTML = data[ 0 ];
    body.innerHTML = data[ 1 ];
  } );
} );