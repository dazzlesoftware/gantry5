const mediaQuery = window.matchMedia('(max-width: 1216px)')
mediaQuery.addListener(handleTabletChange);
function handleTabletChange(e) {
    if (e.matches) {
        jQuery('.empty').detach();
    } else {

    }
}
handleTabletChange(mediaQuery);
