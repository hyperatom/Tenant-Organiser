define(["plugins/dialog","services/datacontext","services/session","services/logger"],function(e,n,t,r){function o(n){return n?e.close(this,n):e.close(this)}function a(e){c(e)}function i(){if(!l())return r.logError("Bill name is required.",null,"create-bill-modal",!0),void 0;if("Select a recipient"===c().FullName)return r.logError("Bill manager is required.",null,"create-bill-modal",!0),void 0;var e=n.createBillType();e.Manager(c()),e.Name(l()),n.saveChanges().then(function(){return r.logSuccess(l()+" created.",null,"create-bill-modal",!0),s.close(this,!0)})}var s,l=new ko.observable,c=new ko.observable({FullName:"Select a recipient"}),u=new ko.observableArray,d=function(){this.input=ko.observable(""),this.clickedCombo=a,this.tenantsList=u,this.close=o,this.billName=l,this.manager=c,this.createBillType=i,s=this,n.getTenants(u,t.sessionUser().HouseId())};return d.prototype.ok=function(){e.close(this,this.input())},d.show=function(){return e.show(new d)},d});