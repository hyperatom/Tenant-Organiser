define(["durandal/system"],function(e){function n(e,n,t,r){a(e,n,t,r,"info")}function t(e,n,t,r){a(e,n,t,r,"success")}function r(e,n,t,r){a(e,n,t,r,"error")}function a(n,t,r,a,o){r=r?"["+r+"] ":"",t?e.log(r,n,t):e.log(r,n),a&&("error"===o?toastr.error(n):"info"===o?toastr.info(n):"success"===o&&toastr.success(n))}var o={log:n,logError:r,logSuccess:t};return o});