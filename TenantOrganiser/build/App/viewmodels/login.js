define(["services/logger","plugins/router","services/session","fb"],function(e,n,t){function r(){return e.log("Login View Activated",null,"login",!0),a()}function o(){$("#fb-login-btn").on("mouseenter",function(){$("#fb-login-btn").css("background","url(Content/images/fb/fb_login_pressed_404.png) no-repeat")}),$("#fb-login-btn").on("mouseleave",function(){$("#fb-login-btn").css("background","url(Content/images/fb/fb_login_active_404.png) no-repeat")})}function a(){function e(){console.log("Welcome!  Fetching your information.... "),FB.api("/me",function(e){console.log("Good to see you, "+e.name+".")})}window.fbAsyncInit=function(){FB.init({appId:"533178160135622",status:!0,cookie:!0,xfbml:!0}),FB.Event.subscribe("auth.authResponseChange",function(n){"connected"===n.status?e():"not_authorized"===n.status?FB.login():FB.login()})},function(e){var n,t="facebook-jssdk",r=e.getElementsByTagName("script")[0];e.getElementById(t)||(n=e.createElement("script"),n.id=t,n.async=!0,n.src="//connect.facebook.net/en_US/all.js",r.parentNode.insertBefore(n,r))}(document)}function i(){}function s(){t.login(u,d).then(function(t){return t?(t.House?n.navigate("#home"):n.navigate("#join-house"),void 0):(e.logError("Incorrect username or password!",null,"login",!0),void 0)})}function l(){var r=v().split(" ");if(f()!==g())return e.logError("Both passwords must match!",null,"login",!0),void 0;if(!v())return e.logError("Full name cannot be empty.",null,"login",!0),void 0;if(r.length<2)return e.logError("Please enter a full name with two or more parts.",null,"login",!0),void 0;if(!v())return e.logError("Full name cannot be empty.",null,"login",!0),void 0;if(!p())return e.logError("Email cannot be empty.",null,"login",!0),void 0;if(!f()||!g())return e.logError("Passwords cannot be empty.",null,"login",!0),void 0;var o=r[0],a=r[r.length-1];return t.register(o,a,p(),f(),c).then(function(e){return e?(n.navigate("#join-house"),n.activate("join-house")):void 0})}function c(n){if(n.errors)for(var t=0;t<n.errors.length;t++)console.log(n.errors[t]),e.logError(n.errors[t],null,"login",!0)}var u=new ko.observable,d=new ko.observable,v=new ko.observable,p=new ko.observable,f=new ko.observable,g=new ko.observable,b={activate:r,title:"Login",attached:o,loginEmail:u,loginPassword:d,fbLoginClicked:i,loginClicked:s,registerClicked:l,registerFullName:v,registerEmail:p,registerPassword1:f,registerPassword2:g};return b});