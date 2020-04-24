document.addEventListener( "DOMContentLoaded", () => {

  // Iterate all members of dropdown
  const wrapper = document.getElementById( "wrapper" );
  const dropdowns = document.getElementsByClassName( "dropdown" );
  for( let i = 0; i < dropdowns.length; i++ ) {

    // Get items from current dropdown
    const currDropdown = dropdowns[ i ];
    const selected = currDropdown.querySelector( "p" );
    const dropdownIcon = currDropdown.querySelector( "img" );
    const itemHolder = currDropdown.querySelector( ".dropdown-items" );
    const items = itemHolder.children;

    // Hide initially selected item (first)
    items[ 0 ].style.display = "none";

    // Cache state and listen to click
    let currState = false;
    currDropdown.addEventListener( "click", ( event ) => {
      // Toggle state
      currState = !currState;

      // Check if selectable item has been clicked
      let parentClasses = event.target.parentElement.className;
      if( event.target.tagName === "P" && parentClasses.includes( "dropdown-items" ) ) {

        // Show all items again
        for( let j = 0; j < items.length; j++ )
          items[ j ].style.display = "block";

        // Put content of clicked item into selected display and hide item
        selected.innerHTML = event.target.innerHTML;
        event.target.style.display = "none";

        // Dispatch change event
        wrapper.dispatchEvent( new CustomEvent( "RazerSettingsChanged", { detail: "mode" } ) );
      }

      // Set style based on state
      itemHolder.style.display = currState ? "flex" : "none";
      dropdownIcon.style.transform = "rotate( " + ( currState ? "180deg" : "0deg" ) + ")";
    } );
  }

} );