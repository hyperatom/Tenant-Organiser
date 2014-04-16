define(["services/logger","plugins/router","services/datacontext","services/session"],function(e,t,n,r){function i(t){return Q.all([a(),s(t),l(),c()]).then(function(){y("New "+_().Name()+" Invoice"),e.log("Add Bill Invoice Activated",null,"add-bill-invoice",!0)})}function o(){_(null),I(null),k([]),S(null)}function a(){return n.getTenants(A,r.sessionUser().HouseId())}function s(e){return n.getBillTypeById(_,e)}function l(){return w({BillType:_(),Recipients:ko.observableArray()})}function c(){x({User:ko.observable({FullName:ko.observable("Select a recipient")}),BillInvoice:w(),Paid:ko.observable(!1),Amount:ko.observable()})}function u(){ko.observable.fn.beforeAndAfterSubscribe=function(e,t){var n;t.subscribe(function(e){n=e},null,"beforeChange"),t.subscribe(function(r){e(t,n,r)})},$(".input-group.date").datepicker({autoclose:!0,todayHighlight:!0}),ko.observable.fn.beforeAndAfterSubscribe(h,I)}function d(){function r(){return $.each(k(),function(e,t){var r=n.createInvoiceRecipient(i);r.Amount(t.Amount()),r.Paid(t.Paid()),r.User(t.User())}),n.saveChanges().then(function(){return e.logSuccess("Invoice Created!",null,"add-bill-invoice",!0),t.navigate("#bills")})}if(!S())return e.logError("Please enter a due date for the invoice.",null,"add-bill-invoice",!0),void 0;var i=n.createBillInvoice(_());return i.DueDate(moment(S(),"DD/MM/YYYY").format("MM/DD/YYYY")),n.saveChanges().then(r)}function p(){ko.utils.arrayForEach(k(),function(){k.removeAll()}),I(0),S(""),e.log("Changes undone!",null,"add-bill-invoice",!0)}function f(){R=!0;var e=0;ko.utils.arrayForEach(k(),function(t){console.log(e+=parseInt(t.Amount()))}),0==E&&I(e),R=!1}function h(e,t,n){var r=k().length;if(t!=n&&""!=n&&r>0&&0==R){var i=n/r;E=!0,ko.utils.arrayForEach(k(),function(e){e.Amount(i)}),E=!1}}function g(t){return t.Amount()?"Select a recipient"===t.User().FullName()?(e.logError("Please choose a recipient from the combo box.",null,"add-bill-invoice",!0),void 0):(t.Amount.subscribe(f),k.push(t),t.Amount.notifySubscribers(),c(),void 0):(e.logError("Please enter a bill amount for the new recipient.",null,"add-bill-invoice",!0),void 0)}function v(e){k.remove(e),e.Amount.notifySubscribers()}function m(e,t){t.User(e)}function b(t){t.Paid()?(t.Paid(!1),e.logSuccess(t.User().FullName().concat(" has now un-paid."),null,"add-bill-invoice",!0)):(t.Paid(!0),e.logSuccess(t.User().FullName().concat(" has now paid."),null,"add-bill-invoice",!0))}var y=new ko.observable,_=new ko.observable,w=new ko.observable,k=new ko.observableArray,x=new ko.observableArray,C=new ko.observable(!1),A=new ko.observableArray,I=new ko.observable(0),S=new ko.observable,R=!1,E=!1,N={activate:i,deactivate:o,title:"Add Bill Invoice View",attached:u,billType:_,billInvoice:w,pageHeader:y,clickedCombo:m,checkboxClicked:b,invoiceRecipients:k,newInvoiceRecipient:x,totalAmount:I,dueDate:S,addNewRecipient:g,removeRecipient:v,invoiceCreated:d,invoiceUndone:p,tenantsList:A,isUndoEnabled:C};return N});