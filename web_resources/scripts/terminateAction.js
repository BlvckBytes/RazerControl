document.addEventListener( "DOMContentLoaded", () => {

  // Attach click event to top right terminate cross
  const closeBtn = document.getElementById( "terminate-cross" );
  closeBtn.addEventListener( "click", () => {

    serverDispatch( "terminate" );

  } );

} );