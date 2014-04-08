define(["durandal/system","durandal/viewEngine","durandal/composition","durandal/events","jquery"],function(e,n,t,r,o){function a(){return e.defer(function(n){return 0==s.length?(n.resolve(),void 0):(e.acquire(s).then(function(t){for(var r=0;r<t.length;r++){var o=t[r];if(o.install){var a=l[r];e.isObject(a)||(a={}),o.install(a),e.log("Plugin:Installed "+s[r])}else e.log("Plugin:Loaded "+s[r])}n.resolve()}).fail(function(n){e.error("Failed to load plugin(s). Details: "+n.message)}),void 0)}).promise()}var i,s=[],l=[];return i={title:"Application",configurePlugins:function(n,t){var r=e.keys(n);t=t||"plugins/",-1===t.indexOf("/",t.length-1)&&(t+="/");for(var o=0;o<r.length;o++){var a=r[o];s.push(t+a),l.push(n[a])}},start:function(){return e.log("Application:Starting"),this.title&&(document.title=this.title),e.defer(function(n){o(function(){a().then(function(){n.resolve(),e.log("Application:Started")})})}).promise()},setRoot:function(r,o,a){var i,s={activate:!0,transition:o};i=!a||e.isString(a)?document.getElementById(a||"applicationHost"):a,e.isString(r)?n.isViewUrl(r)?s.view=r:s.model=r:s.model=r,t.compose(i,s)}},r.includeIn(i),i});