define(function () {

    var helper = {
        AddAntiForgeryToken: AddAntiForgeryToken
    };

    return helper;

    function AddAntiForgeryToken(data) {

        // Get token from the hidden form and add it as a new attribute to object
        data.__RequestVerificationToken = $('#__AjaxAntiForgeryForm input[name=__RequestVerificationToken]').val();

        return data;
    }
});