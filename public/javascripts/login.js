$(function() {
    var $window = $(window);

    var $usernameInput = $('.usernameInput'); // Input for username
    var $userpassInput = $('.userpassInput');
    var $userform = $('.userf');
    var $passform = $('.passf');
    var $loginPage = $('.login.page'); // The login page
    var $loginform = $('.login-form');
    var username;
    var password;
    var $currentInput = $usernameInput;
    $passform.hide();





    function userPassword() {
        console.log("inside user password");
        $userform.fadeOut();
        $passform.show();
        $currentInput = $userpassInput;

    }

    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    $window.keydown(function(event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            console.log("pressed enter");
            username = cleanInput($usernameInput.val().trim());
            password = cleanInput($userpassInput.val().trim());

            if (username) {
                userPassword();
            }

            if (password) {
                console.log("password entered");
                $loginform.submit();
            }
        }
    });

});
