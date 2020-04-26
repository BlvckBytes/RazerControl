document.addEventListener( "DOMContentLoaded", () => {

  // Iterate all available sliders
  const wrapper = document.getElementById( "wrapper" );
  const sliders = document.getElementsByClassName( "slider" );
  for( let i = 0; i < sliders.length; i++ ) {
    const curr = sliders[ i ];

    // Get input and it's label
    const input = curr.querySelector( "input" );
    const label = curr.querySelector( "p" );

    // Update on handle move
    input.addEventListener( "input", () => {
      label.innerHTML = pad( input.value, 3 );

      // Dispatch change event
      wrapper.dispatchEvent( new CustomEvent( "RazerSettingsChanged", { detail: input.id } ) );
    } );

    // Just update the label when settings have been loaded
    input.addEventListener( "SettingsLoaded", () => { label.innerHTML = pad( input.value, 3 ); } );

      // Initial call
    label.innerHTML = pad( input.value, 3 );
  }

  /**
   * Padds a number to meet the specified length
   * @param number Number to pad
   * @param length Total result length
   * @returns {string} Padded number
   */
  function pad( number, length ) {
    let str = '' + number;

    // Append leading zeros while len not reached
    while ( str.length < length )
      str = '0' + str;

    return str;
  }

} );