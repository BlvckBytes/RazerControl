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
  const modeSelect = dropdown.querySelector( ".dropdown-current" );

  // Settings changed when this gets fired
  wrapper.addEventListener( "RazerSettingsChanged", update );
  let lastTimeout;
  let settings = {};

  function update( e ) {
    setStatusMeter( false );

    // Update result color
    let r = rVal.value, g = gVal.value, b = bVal.value;
    color.style.background = "rgb( " + r + ", " + g + "," + b + ")";

    settings.r = r;
    settings.g = g;
    settings.b = b;

    // Get all further needed variables
    let speed = delVal.value, light = lightVal.value, logo = logoVal.checked;
    settings.speed = speed;
    settings.light = light;
    settings.logo = logo;

    // Build command based on informations from UI
    let mode = modeSelect.innerHTML;
    settings.mode = mode;
    let command = "";
    switch ( mode.toLowerCase() ) {

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
        command = mode.toLowerCase();
        break;
    }

    // Clear last timeout if exists, new action is now overriding
    if( lastTimeout != null )
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

      // Send mode command, origin either dropdown or mixer slider or delay slider
      else if( e.detail === "mode" || e.detail.startsWith( "MX" ) || e.detail.startsWith( "Delay" ) ) {
        dispatchParams( command );
        console.log( command );
      }

      // Send logo command
      else if( e.detail === "logo" )
        dispatchParams( "logo " + ( logo ? "on" : "off" ) );

      // Update settings in persistent storage
      serverDispatch( "settingswrite?settings=" + JSON.stringify( settings ) );

    }, 180 ); // that seems like a good delay to use
  }

  /**
   * Load the settings to all UI controls and the settings buffer
   * in mem by requesting them from the server
   */
  function loadSettings() {
    serverDispatch( "settingsread", response => {

      // Read response and parse if something exists, empty object otherwise
      let parsed = {}
      if( response.trim() !== "" )
        parsed = JSON.parse( response );

      // Read data from storage with fallback values (either file fresh created or
      // new setting added that needs to be written in next write cycle)
      settings.r = parsed.r || 255;
      settings.g = parsed.g || 255;
      settings.b = parsed.b || 255;
      settings.speed = parsed.speed || 3;
      settings.light = parsed.light || 255;
      settings.logo = parsed.logo === undefined ? true : parsed.logo;
      settings.mode = parsed.mode || "Static";

      // Write settings to UI controls
      rVal.value = settings.r;
      gVal.value = settings.g;
      bVal.value = settings.b;
      delVal.value = settings.speed;
      lightVal.value = settings.light;
      modeSelect.innerHTML = settings.mode;
      logoVal.checked = settings.logo;

      // Update all sliders by calling their input event
      let updateables = [ rVal, gVal, bVal, delVal, lightVal ];
      for( let i = 0; i < updateables.length; i++ )
        updateables[ i ].dispatchEvent( new CustomEvent( "SettingsLoaded" ) );

      // Update the dropdown item visibility
      const items = document.getElementsByClassName( "dropdown" )[ 0 ].querySelector( ".dropdown-items" ).children;
      for( let j = 0; j < items.length; j++ ) {
        if( items[ j ].innerHTML.toLowerCase() === settings.mode.toLowerCase() )
          items[ j ].style.display = "none";
        else
          items[ j ].style.display = "block";
      }

      // Initial call
      update();
    } );
  }

  /**
   * Dispatches these params by sending them to the built-in server
   * @param params Params to dispatch
   */
  function dispatchParams( params ) {
    serverDispatch( "exec?command=" + params, () => {
      setStatusMeter( true );
    } );
  }

  /**
   * Sets the bottom right status meter to writing or done
   * @param status False is writing, true done
   */
  function setStatusMeter( status ) {
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
  loadSettings();
} );