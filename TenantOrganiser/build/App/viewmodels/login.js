define(["services/logger","plugins/router","services/session"],function(e,n,t){function r(){return e.log("Login View Activated",null,"login",!0),!0}function o(){$("#fb-login-btn").on("mouseenter",function(){$("#fb-login-btn").css("background","url(Content/images/fb/fb_login_pressed_404.png) no-repeat")}),$("#fb-login-btn").on("mouseleave",function(){$("#fb-login-btn").css("background","url(Content/images/fb/fb_login_active_404.png) no-repeat")})}function a(){}function i(){t.login(c,u).then(function(t){return t?(t.House?n.navigate("#home"):n.navigate("#join-house"),void 0):(e.logError("Incorrect username or password!",null,"login",!0),void 0)})}function s(){var r=d().split(" ");if(p()!==f())return e.logError("Both passwords must match!",null,"login",!0),void 0;if(!d())return e.logError("Full name cannot be empty.",null,"login",!0),void 0;if(r.length<2)return e.logError("Please enter a full name with two or more parts.",null,"login",!0),void 0;if(!d())return e.logError("Full name cannot be empty.",null,"login",!0),void 0;if(!v())return e.logError("Email cannot be empty.",null,"login",!0),void 0;if(!p()||!f())return e.logError("Passwords cannot be empty.",null,"login",!0),void 0;var o=r[0],a=r[r.length-1];return t.register(o,a,v(),p(),l).then(function(e){return e?(n.navigate("#join-house"),n.activate("join-house")):void 0})}function l(n){if(n.errors)for(var t=0;t<n.errors.length;t++)console.log(n.errors[t]),e.logError(n.errors[t],null,"login",!0)}var c=new ko.observable,u=new ko.observable,d=new ko.observable,v=new ko.observable,p=new ko.observable,f=new ko.observable,g={activate:r,title:"Login",attached:o,loginEmail:c,loginPassword:u,fbLoginClicked:a,loginClicked:i,registerClicked:s,registerFullName:d,registerEmail:v,registerPassword1:p,registerPassword2:f};return g});