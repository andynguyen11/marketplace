$(document).ready(function() {
    var $active = false;
    zE(function() {
        zE.hide();
    });
    $('#help, #help-mobile').click(function() {
        if ($active) {
            zE.hide();
            $active = false;
        } else {
            zE.activate();
            $active = true;
        }
    });
});
