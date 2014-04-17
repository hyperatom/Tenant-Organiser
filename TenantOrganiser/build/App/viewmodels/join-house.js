define(["services/logger","plugins/router","services/session","services/datacontext","services/fbhelper"],function(e,t,n,r,i){function o(){return p(f),e.log("Join House View Activated",null,"join-house",!0),d()}function a(){}function s(){return n.sessionUser().IsFacebookUser()&&i.logout(),n.logout().then(function(){t.navigate("#login")})}function l(){return r.joinHouse(n.sessionUser,h()).then(function(){return d()})}function c(){var e=m();return m(null),r.cancelHouseRequest(e).then(d)}function u(){return r.createHouse(n.sessionUser,g(),v()).then(n.refreshSession).then(function(){t.navigate("#home")})}function d(){return r.getUsersJoinRequest(n.sessionUser,m)}function p(e){e("Welcome "+n.sessionUser().FirstName()+"!")}var f=new ko.observable,h=new ko.observable,g=new ko.observable,v=new ko.observable,m=new ko.observable,b={activate:o,title:"Join House",attached:a,pageHeader:f,joinHouseCode:h,createHouseName:g,createHouseCode:v,joinExistingHouseClicked:l,createNewHouseClicked:u,cancelRequestClicked:c,logoutClicked:s,houseJoinRequest:m};return b});