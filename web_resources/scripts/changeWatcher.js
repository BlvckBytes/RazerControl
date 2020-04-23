document.addEventListener( "DOMContentLoaded", () => {

  // All inputs needed for further processing
  const dropdown = document.getElementById( "kb-mode" );
  const logoVal = document.getElementById( "Logo_val" );
  const wrapper = document.getElementById( "wrapper" );
  const color = document.getElementById( "result-color" );
  const rVal = document.getElementById( "MXR_val" );
  const gVal = document.getElementById( "MXG_val" );
  const bVal = document.getElementById( "MXB_val" );
  const delVal = document.getElementById( "Delay_val" );
  const lightVal = document.getElementById( "Light_val" );

  // Settings changed when this gets fired
  wrapper.addEventListener( "RazerSettingsChanged", update );
  let lastTimeout;

  function update( e ) {
    setStatusMeter( false );

    // Update result color
    let r = rVal.value, g = gVal.value, b = bVal.value;
    color.style.background = "rgb( " + r + ", " + g + "," + b + ")";

    // Get all further needed variables
    let speed = delVal.value, light = lightVal.value, logo = logoVal.checked;

    // Build command based on informations from UI
    let mode = dropdown.querySelector( ".dropdown-current" ).innerHTML.toLowerCase();
    let command = "";
    switch ( mode ) {

      // Static color mode
      case "static":
        command = "static " + r + " " + g + " " + b
        break;

      // Breathing that static color
      case "breathe":
        command = "breathe " + r + " " + g + " " + b
        break;

      // Starlight with the given speed
      case "starlight":
        command = "starlight " + speed + " " + r + " " + g + " " + b;
        break;

      // Reactive keys with the given speed
      case "reactive":
        command = "reactive " + speed + " " + r + " " + g + " " + b;
        break;

      // Cyle through the whole color spectrum
      case "spectrum":
        command = "spectrum";
        break;

      // Wave either left or right
      case "wave left":
      case "wave right":
        command = mode;
        break;
    }

    // Clear last timeout if exists, new action is now overriding
    if( lastTimeout != null)
      clearTimeout( lastTimeout );

    // Create new timeout, after 150ms of no action it'll exec
    lastTimeout = setTimeout( () => {

      // No event provided - initial call - send everything
      if( e === undefined ) {
        // NOTE: These commands can't be dispatched all at once,
        // since the usb device is busy after some time
        // the binary can only do one command at once, sadly
        dispatchParams( "logo " + ( logo ? "on" : "off" ) );

        setTimeout( () => {
          dispatchParams( "brightness " + light )
        }, 100 );

        setTimeout( () => {
          dispatchParams( command );
        }, 200 );
      }

      // Send brightness command, if origin is light
      else if( e.detail === "Light_val" )
        dispatchParams( "brightness " + light );

      // Send mode command, origin either dropdown or
      else if( e.detail === "mode" || e.detail.startsWith( "MX" ) )
        dispatchParams( command );

      // Send logo command
      else if( e.detail === "logo" )
        dispatchParams( "logo " + ( logo ? "on" : "off" ) );

    }, 180 ); // that seems like a good delay to use
  }

  /**
   * Dispatches these params by sending them to the built-in server
   * @param params Params to dispatch
   */
  function dispatchParams( params ) {
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

      setStatusMeter( true );
    };

    req.open( "GET", "http://localhost:9138/exec?command=" + params );
    req.send();
  }

  /**
   * Sets the bottom right status meter to writing or done
   * @param status False is writing, true done
   */
  function setStatusMeter( status) {
    const meter = document.getElementById( "status-meter" );

    // True - it's up to date
    if( status ) {
      meter.classList.remove( "status-meter-active" );
      meter.querySelector( "p" ).innerHTML = "Up to date";
    }

    // False - writing to keyboard
    else {
      meter.classList.add( "status-meter-active" );
      meter.querySelector( "p" ).innerHTML = "Writing...";
    }
  }

  // Listen for changes on logo switch
  logoVal.addEventListener( "change", () => {
    wrapper.dispatchEvent( new CustomEvent( "RazerSettingsChanged", { detail: "logo" } ) );
  } );

  // Initial call
  update();
} );