define(["jquery","knockout"],function(e,n){return{callbackParam:"callback",get:function(n,t){return e.ajax(n,{data:t})},jsonp:function(n,t,r){return-1==n.indexOf("=?")&&(r=r||this.callbackParam,n+=-1==n.indexOf("?")?"?":"&",n+=r+"=?"),e.ajax({url:n,dataType:"jsonp",data:t})},post:function(t,r){return e.ajax({url:t,data:n.toJSON(r),type:"POST",contentType:"application/json",dataType:"json"})}}});