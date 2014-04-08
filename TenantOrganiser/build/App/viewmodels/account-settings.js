define(["services/logger","services/datacontext","services/session","plugins/router","durandal/app"],function(e,n,t,r,o){function a(){return Q.all([l(),c()]).then(function(){C(),e.log("Account Settings Activated",null,"account-settings",!0)})}function i(){if(!n.hasChanges())return!0;var e=o.showMessage("You have unsaved data. Are you sure you want to navigate?","Unsaved Data",["Yes","No"]);return e.then(function(e){return"No"===e?!1:("Yes"===e&&n.rejectChanges(),!0)})}function s(){for(var e in I)I[e].dispose()}function l(){return n.getPendingRequests(j,t.sessionUser().HouseId())}function c(){return n.getTenants(B,t.sessionUser().HouseId())}function u(){return Q.all([l(),c()])}function d(){e.logSuccess("Picture Uploaded!",null,"account-settings",!0)}function p(){n.leaveHouse(t.sessionUser).done(function(){return t.refreshSession().then(function(){r.navigate("#join-house"),e.logSuccess("You have left the house!",null,"account-settings",!0)})})}function v(t){return n.joinTenantToHouse(t.User,t.House).then(u).then(function(){e.logSuccess("Tenant Accepted!",null,"account-settings",!0)})}function g(e){var t=e;return j.remove(e),t.entityAspect.setDeleted(),Q.all([n.saveChanges(),l()])}function b(e){_(e)}function f(){return _().HouseId(null),n.saveChanges().then(c).then(function(){e.logSuccess("Tenant Removed.",null,"account-settings",!0)})}function m(r){return t.sessionUser().EmailNotifications(r),1==r?e.logSuccess("Email Notifications Enabled!",null,"account-settings",!0):e.logSuccess("Email Notifications Disabled!",null,"account-settings",!0),n.saveChanges().fail(function(){e.logSuccess("Email notifications could not be saved.",null,"account-settings",!0)})}function h(){if(F()!==M())return e.logError("Both passwords must match.",null,"account-settings",!0),void 0;var r=ko.observable();return n.getUserById(t.sessionUser().Id(),r).then(function(){function o(n){return n.errors?($.each(n.errors,function(t,r){e.logError(r,n.errors,"account-settings",!0)}),void 0):(e.logSuccess("User Password Saved!",null,"account-settings",!0),a())}function a(){var o=E().split(" ");return r().FirstName(o[0]),r().LastName(o[o.length-1]),r().Email(P()),n.saveChanges().then(function(){return S(!1),e.logSuccess("User Settings Saved!",null,"account-settings",!0),t.login(r().Email(),F())}).fail(function(){r().entityAspect.rejectChanges()})}return F()?t.changePassword(F()).then(o):a()})}function y(){return t.sessionUser().House().HouseName(T()),t.sessionUser().House().HouseCode(H()),n.saveChanges().then(function(){U(!1),e.logSuccess("House Settings Saved!",null,"account-settings",!0)}).fail(function(){e.logError("Error saving settings.",null,"account-settings",!0)})}function w(){H(t.sessionUser().House().HouseCode()),T(t.sessionUser().House().HouseName()),U(!1),e.logSuccess("House Settings Reset!",null,"account-settings",!0)}function k(){E(t.sessionUser().FullName()),P(t.sessionUser().Email()),F(""),M(""),t.sessionUser().entityAspect.rejectChanges(),S(!1),e.logSuccess("User Settings Reset!",null,"account-settings",!0)}function C(){x(),A(),N()}function x(){T(t.sessionUser().House().HouseName()),H(t.sessionUser().House().HouseCode()),I.push(T.subscribe(function(){U(!0)})),I.push(H.subscribe(function(){U(!0)}))}function A(){R(t.sessionUser().EmailNotifications()),D(t.sessionUser().DisplayPictureFilePath()),I.push(R.subscribe(m))}function N(){E(t.sessionUser().FullName()),P(t.sessionUser().Email()),F(""),M(""),I.push(E.subscribe(function(){S(!0)})),I.push(P.subscribe(function(){S(!0)})),I.push(F.subscribe(function(){S(!0)})),I.push(M.subscribe(function(){S(!0)}))}var I=[],U=new ko.observable(!1),S=new ko.observable(!1),T=new ko.observable,H=new ko.observable,R=ko.observable(),D=new ko.observable,E=new ko.observable,P=new ko.observable,F=new ko.observable,M=new ko.observable,j=new ko.observableArray,B=new ko.observableArray,_=new ko.observable,O={activate:a,deactivate:s,canDeactivate:i,title:"Account Settings",houseName:T,houseCode:H,emailNotifications:R,displayPictureURL:D,fullName:E,email:P,password1:F,password2:M,pendingRequests:j,tenants:B,hasHouseChanged:U,hasUserInfoChanged:S,saveHousePanelClicked:y,undoHousePanelClicked:w,saveUserInfoClicked:h,undoUserInfoClicked:k,markDeleteTenant:b,deleteTenant:f,acceptTenant:v,rejectTenant:g,leaveHouseConfirmed:p,pictureUploaded:d};return O});