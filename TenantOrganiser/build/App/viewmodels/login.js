define(["services/logger","plugins/router","services/session","services/fbhelper"],function(e,t,n,r){function i(){return e.log("Login View Activated",null,"login",!0),!0}function o(){r.init()}function a(){}function s(){n.login(u,d).then(function(n){return n?(n.House?t.navigate("#home"):t.navigate("#join-house"),void 0):(e.logError("Incorrect username or password!",null,"login",!0),void 0)})}function l(){var r=f().split(" ");if(h()!==g())return e.logError("Both passwords must match!",null,"login",!0),void 0;if(!f())return e.logError("Full name cannot be empty.",null,"login",!0),void 0;if(r.length<2)return e.logError("Please enter a full name with two or more parts.",null,"login",!0),void 0;if(!f())return e.logError("Full name cannot be empty.",null,"login",!0),void 0;if(!p())return e.logError("Email cannot be empty.",null,"login",!0),void 0;if(!h()||!g())return e.logError("Passwords cannot be empty.",null,"login",!0),void 0;var i=r[0],o=r[r.length-1];return n.register(i,o,p(),h(),c).then(function(e){return e?(t.navigate("#join-house"),t.activate("join-house")):void 0})}function c(t){if(t.errors)for(var n=0;n<t.errors.length;n++)console.log(t.errors[n]),e.logError(t.errors[n],null,"login",!0)}var u=new ko.observable,d=new ko.observable,f=new ko.observable,p=new ko.observable,h=new ko.observable,g=new ko.observable,v={activate:i,title:"Login",attached:o,loginEmail:u,loginPassword:d,fbLoginClicked:a,loginClicked:s,registerClicked:l,registerFullName:f,registerEmail:p,registerPassword1:h,registerPassword2:g};return v});