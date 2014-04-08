define(["durandal/system","durandal/app","durandal/activator","durandal/events","durandal/composition","plugins/history","knockout","jquery"],function(e,n,t,r,o,a,i,s){function l(e){return e=e.replace(h,"\\$&").replace(f,"(?:$1)?").replace(g,function(e,n){return n?e:"([^/]+)"}).replace(b,"(.*?)"),new RegExp("^"+e+"$")}function c(e){var n=e.indexOf(":"),t=n>0?n-1:e.length;return e.substring(0,t)}function u(e,n){return-1!==e.indexOf(n,e.length-n.length)}function d(e,n){if(!e||!n)return!1;if(e.length!=n.length)return!1;for(var t=0,r=e.length;r>t;t++)if(e[t]!=n[t])return!1;return!0}var p,v,f=/\((.*?)\)/g,g=/(\(\?)?:\w+/g,b=/\*\w+/g,h=/[\-{}\[\]+?.,\\\^$|#\s]/g,m=/\/$/,y=function(){function o(e){return e.router&&e.router.parent==E}function s(e){T&&T.config.isActive&&T.config.isActive(e)}function f(n,t){e.log("Navigation Complete",n,t);var r=e.getModuleId(U);r&&E.trigger("router:navigation:from:"+r),U=n,s(!1),T=t,s(!0);var a=e.getModuleId(U);a&&E.trigger("router:navigation:to:"+a),o(n)||E.updateDocumentTitle(n,t),v.explicitNavigation=!1,v.navigatingBack=!1,E.trigger("router:navigation:complete",n,t,E)}function g(n,t){e.log("Navigation Cancelled"),E.activeInstruction(T),T&&E.navigate(T.fragment,!1),R(!1),v.explicitNavigation=!1,v.navigatingBack=!1,E.trigger("router:navigation:cancelled",n,t,E)}function b(n){e.log("Navigation Redirecting"),R(!1),v.explicitNavigation=!1,v.navigatingBack=!1,E.navigate(n,{trigger:!0,replace:!0})}function h(n,t,r){v.navigatingBack=!v.explicitNavigation&&U!=r.fragment,E.trigger("router:route:activating",t,r,E),n.activateItem(t,r.params).then(function(e){if(e){var a=U;if(f(t,r),o(t)){var i=r.fragment;r.queryString&&(i+="?"+r.queryString),t.router.loadUrl(i)}a==t&&(E.attached(),E.compositionComplete())}else n.settings.lifecycleData&&n.settings.lifecycleData.redirect?b(n.settings.lifecycleData.redirect):g(t,r);p&&(p.resolve(),p=null)}).fail(function(n){e.error(n)})}function w(n,t,r){var o=E.guardRoute(t,r);o?o.then?o.then(function(o){o?e.isString(o)?b(o):h(n,t,r):g(t,r)}):e.isString(o)?b(o):h(n,t,r):g(t,r)}function k(e,n,t){E.guardRoute?w(e,n,t):h(e,n,t)}function C(e){return T&&T.config.moduleId==e.config.moduleId&&U&&(U.canReuseForRoute&&U.canReuseForRoute.apply(U,e.params)||!U.canReuseForRoute&&U.router&&U.router.loadUrl)}function A(){if(!R()){var n=D.shift();D=[],n&&(R(!0),E.activeInstruction(n),C(n)?k(t.create(),U,n):e.acquire(n.config.moduleId).then(function(t){var r=e.resolveObject(t);k(H,r,n)}).fail(function(t){e.error("Failed to load routed module ("+n.config.moduleId+"). Details: "+t.message)}))}}function x(e){D.unshift(e),A()}function N(e,n,t){for(var r=e.exec(n).slice(1),o=0;o<r.length;o++){var a=r[o];r[o]=a?decodeURIComponent(a):null}var i=E.parseQueryString(t);return i&&r.push(i),{params:r,queryParams:i}}function I(n){E.trigger("router:route:before-config",n,E),e.isRegExp(n)?n.routePattern=n.route:(n.title=n.title||E.convertRouteToTitle(n.route),n.moduleId=n.moduleId||E.convertRouteToModuleId(n.route),n.hash=n.hash||E.convertRouteToHash(n.route),n.routePattern=l(n.route)),n.isActive=n.isActive||i.observable(!1),E.trigger("router:route:after-config",n,E),E.routes.push(n),E.route(n.routePattern,function(e,t){var r=N(n.routePattern,e,t);x({fragment:e,queryString:t,config:n,params:r.params,queryParams:r.queryParams})})}function S(n){if(e.isArray(n.route))for(var t=n.isActive||i.observable(!1),r=0,o=n.route.length;o>r;r++){var a=e.extend({},n);a.route=n.route[r],a.isActive=t,r>0&&delete a.nav,I(a)}else I(n);return E}var U,T,D=[],R=i.observable(!1),H=t.create(),E={handlers:[],routes:[],navigationModel:i.observableArray([]),activeItem:H,isNavigating:i.computed(function(){var e=H(),n=R(),t=e&&e.router&&e.router!=E&&e.router.isNavigating()?!0:!1;return n||t}),activeInstruction:i.observable(null),__router__:!0};return r.includeIn(E),H.settings.areSameItem=function(e,n,t,r){return e==n?d(t,r):!1},E.parseQueryString=function(e){var n,t;if(!e)return null;if(t=e.split("&"),0==t.length)return null;n={};for(var r=0;r<t.length;r++){var o=t[r];if(""!==o){var a=o.split("=");n[a[0]]=a[1]&&decodeURIComponent(a[1].replace(/\+/g," "))}}return n},E.route=function(e,n){E.handlers.push({routePattern:e,callback:n})},E.loadUrl=function(n){var t=E.handlers,r=null,o=n,i=n.indexOf("?");if(-1!=i&&(o=n.substring(0,i),r=n.substr(i+1)),E.relativeToParentRouter){var s=this.parent.activeInstruction();o=s.params.join("/"),o&&"/"==o.charAt(0)&&(o=o.substr(1)),o||(o=""),o=o.replace("//","/").replace("//","/")}o=o.replace(m,"");for(var l=0;l<t.length;l++){var c=t[l];if(c.routePattern.test(o))return c.callback(o,r),!0}return e.log("Route Not Found"),E.trigger("router:route:not-found",n,E),T&&a.navigate(T.fragment,{trigger:!1,replace:!0}),v.explicitNavigation=!1,v.navigatingBack=!1,!1},E.updateDocumentTitle=function(e,t){t.config.title?document.title=n.title?t.config.title+" | "+n.title:t.config.title:n.title&&(document.title=n.title)},E.navigate=function(e,n){return e&&-1!=e.indexOf("://")?(window.location.href=e,!0):(v.explicitNavigation=!0,a.navigate(e,n))},E.navigateBack=function(){a.navigateBack()},E.attached=function(){E.trigger("router:navigation:attached",U,T,E)},E.compositionComplete=function(){R(!1),E.trigger("router:navigation:composition-complete",U,T,E),A()},E.convertRouteToHash=function(e){if(E.relativeToParentRouter){var n=E.parent.activeInstruction(),t=n.config.hash+"/"+e;return a._hasPushState&&(t="/"+t),t=t.replace("//","/").replace("//","/")}return a._hasPushState?e:"#"+e},E.convertRouteToModuleId=function(e){return c(e)},E.convertRouteToTitle=function(e){var n=c(e);return n.substring(0,1).toUpperCase()+n.substring(1)},E.map=function(n,t){if(e.isArray(n)){for(var r=0;r<n.length;r++)E.map(n[r]);return E}return e.isString(n)||e.isRegExp(n)?(t?e.isString(t)&&(t={moduleId:t}):t={},t.route=n):t=n,S(t)},E.buildNavigationModel=function(n){for(var t=[],r=E.routes,o=n||100,a=0;a<r.length;a++){var i=r[a];i.nav&&(e.isNumber(i.nav)||(i.nav=++o),t.push(i))}return t.sort(function(e,n){return e.nav-n.nav}),E.navigationModel(t),E},E.mapUnknownRoutes=function(n,t){var r="*catchall",o=l(r);return E.route(o,function(i,s){var l=N(o,i,s),c={fragment:i,queryString:s,config:{route:r,routePattern:o},params:l.params,queryParams:l.queryParams};if(n)if(e.isString(n))c.config.moduleId=n,t&&a.navigate(t,{trigger:!1,replace:!0});else if(e.isFunction(n)){var u=n(c);if(u&&u.then)return u.then(function(){E.trigger("router:route:before-config",c.config,E),E.trigger("router:route:after-config",c.config,E),x(c)}),void 0}else c.config=n,c.config.route=r,c.config.routePattern=o;else c.config.moduleId=i;E.trigger("router:route:before-config",c.config,E),E.trigger("router:route:after-config",c.config,E),x(c)}),E},E.reset=function(){return T=U=void 0,E.handlers=[],E.routes=[],E.off(),delete E.options,E},E.makeRelative=function(n){return e.isString(n)&&(n={moduleId:n,route:n}),n.moduleId&&!u(n.moduleId,"/")&&(n.moduleId+="/"),n.route&&!u(n.route,"/")&&(n.route+="/"),n.fromParent&&(E.relativeToParentRouter=!0),E.on("router:route:before-config").then(function(e){n.moduleId&&(e.moduleId=n.moduleId+e.moduleId),n.route&&(e.route=""===e.route?n.route.substring(0,n.route.length-1):n.route+e.route)}),E},E.createChildRouter=function(){var e=y();return e.parent=E,e},E};return v=y(),v.explicitNavigation=!1,v.navigatingBack=!1,v.targetIsThisWindow=function(e){var n=s(e.target).attr("target");return!n||n===window.name||"_self"===n||"top"===n&&window===window.top?!0:!1},v.activate=function(n){return e.defer(function(t){if(p=t,v.options=e.extend({routeHandler:v.loadUrl},v.options,n),a.activate(v.options),a._hasPushState)for(var r=v.routes,o=r.length;o--;){var i=r[o];i.hash=i.hash.replace("#","")}s(document).delegate("a","click",function(e){if(a._hasPushState){if(!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&v.targetIsThisWindow(e)){var n=s(this).attr("href");null==n||"#"===n.charAt(0)||/^[a-z]+:/i.test(n)||(v.explicitNavigation=!0,e.preventDefault(),a.navigate(n))}}else v.explicitNavigation=!0}),a.options.silent&&p&&(p.resolve(),p=null)}).promise()},v.deactivate=function(){a.deactivate()},v.install=function(){i.bindingHandlers.router={init:function(){return{controlsDescendantBindings:!0}},update:function(e,n,t,r,a){var s=i.utils.unwrapObservable(n())||{};if(s.__router__)s={model:s.activeItem(),attached:s.attached,compositionComplete:s.compositionComplete,activate:!1};else{var l=i.utils.unwrapObservable(s.router||r.router)||v;s.model=l.activeItem(),s.attached=l.attached,s.compositionComplete=l.compositionComplete,s.activate=!1}o.compose(e,s,a)}},i.virtualElements.allowedBindings.router=!0},v});