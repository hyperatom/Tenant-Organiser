define(['facebook'], function () {
    FB.init({
        appId: '533178160135622',
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true  // parse XFBML
    });
    FB.getLoginStatus(function (response) {
        console.log(response);
    });
});