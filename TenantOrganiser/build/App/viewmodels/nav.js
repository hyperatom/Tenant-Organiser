define(["services/logger","plugins/router","services/session"],function(e,n,t){function r(){return e.log("Navigation View Activated",null,"nav",!0),!0}function o(){t.logout().then(function(){n.navigate("#login")})}var a={activate:r,title:"Navigation View",messagesTag:"/#messages",tenantsTag:"/#tenants",settingsTag:"/#account-settings",homeTag:"/#home",billsTag:"/#bills",tasksTag:"/#tasks",wishListTag:"/#wish-list",logoutClicked:o,sessionUser:t.sessionUser};return a});