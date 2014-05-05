define(['App/services/helper'], function (helper) {

    describe('Helper', function () {
        it('should append an anti-forgery token to the given object.', function () {

            var form = $('<form></form>', {
                id: '__AjaxAntiForgeryForm'
            }).append($('<input />', {
                name: '__RequestVerificationToken',
                value: 'verification_token_from_server',
                type: 'hidden'
            }));

            $('body').append(form);

            var token = {
                __RequestVerificationToken: ''
            };

            helper.addAntiForgeryToken(token);

            expect(token.__RequestVerificationToken).toEqual('verification_token_from_server');

            $(form).remove();
        });
    });
});