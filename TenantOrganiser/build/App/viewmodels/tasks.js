define(["services/logger"],function(e){function n(){return 0==k&&(console.log("Getting cleaning rota data..."),f(p().slice()),h(t().slice()),k=!0),e.log("Tasks View Activated",null,"tasks",!0),!0}function t(){var e=new ko.observableArray;return e.push({DueDate:"12th September '13",ShortDate:"12th September",Colour:"Green",Name:"Green Bins",Tenants:g()}),e.push({DueDate:"30th October '13",ShortDate:"30th October",Colour:"Pink",Name:"Black & Pink Bins",Tenants:g()}),e.push({DueDate:"2nd December '13",ShortDate:"2nd December",Colour:"Brown",Name:"Brown Bins",Tenants:g()}),e}function r(){y(y()+1)}function o(){y(y()-1)}function a(n){n.Completed(!n.Completed()),n.Completed()?e.logSuccess(n.Tenants+" Cleaned!",null,"tasks",!0):e.logSuccess(n.Tenants+" Un-Cleaned!",null,"tasks",!0)}function i(){m(m()+1)}function s(){m(m()-1)}function l(){return h().length>1&&y()>0?!0:!1}function c(){return y()<h().length-1?!0:!1}function u(){return f().length>1&&m()>0?!0:!1}function d(){return m()<f().length-1?!0:!1}function p(){var e=new ko.observableArray;return e.push({DueDate:"15th September '13",RotaData:v()}),e.push({DueDate:"20th September '13",RotaData:v()}),e.push({DueDate:"2nd October '13",RotaData:v()}),e}function v(){var e=new ko.observableArray;return e.push({Completed:b(),Area:"Kitchen",Tenants:g()}),e.push({Completed:b(),Area:"Bathroom",Tenants:g()}),e.push({Completed:b(),Area:"Floors",Tenants:g()}),e.push({Completed:b(),Area:"Living Room",Tenants:g()}),e}function b(){return new ko.observable(Math.random()<.5?!0:!1)}function g(){var e=new ko.observableArray;e.push({TenantNames:"Adam Barrell"}),e.push({TenantNames:"Joss Whittle / Toby Webster"}),e.push({TenantNames:"Tom Walton / Tom Milner"}),e.push({TenantNames:"Chris Lewis"});var n=Math.floor(3*Math.random()+0);return e()[n].TenantNames}var f=new ko.observableArray,h=new ko.observableArray,m=new ko.observable(0),y=new ko.observable(0),k=!1,w={activate:n,title:"Tasks",cleaningRota:f,binCollectionRota:h,currentCleaningRotaIndex:m,binCollectionIndex:y,isPreviousCleanNavEnabled:u,isNextCleanNavEnabled:d,isPreviousBinNavEnabled:l,isNextBinNavEnabled:c,navPreviousCleaningRota:s,navNextCleaningRota:i,navPreviousBinRota:o,navNextBinRota:r,cleanStatusClicked:a};return w});