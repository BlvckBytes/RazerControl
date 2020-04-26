document.addEventListener( "DOMContentLoaded", () => {

  // Attach click event to top right terminate cross
  const closeBtn = document.getElementById( "terminate-cross" );
  closeBtn.addEventListener( "click", () => {

    // Terminate on close button
    serverDispatch( "terminate" );

  } );

} );