define(["durandal/system"],function(e){return{typeAttribute:"type",space:void 0,replacer:function(e,n){if(e){var t=e[0];if("_"===t||"$"===t)return void 0}return n},serialize:function(n,t){return t=void 0===t?{}:t,(e.isString(t)||e.isNumber(t))&&(t={space:t}),JSON.stringify(n,t.replacer||this.replacer,t.space||this.space)},getTypeId:function(e){return e?e[this.typeAttribute]:void 0},typeMap:{},registerType:function(){var n=arguments[0];if(1==arguments.length){var t=n[this.typeAttribute]||e.getModuleId(n);this.typeMap[t]=n}else this.typeMap[n]=arguments[1]},reviver:function(e,n,t,r){var o=t(n);if(o){var a=r(o);if(a)return a.fromJSON?a.fromJSON(n):new a(n)}return n},deserialize:function(e,n){var t=this;n=n||{};var r=n.getTypeId||function(e){return t.getTypeId(e)},o=n.getConstructor||function(e){return t.typeMap[e]},a=n.reviver||function(e,n){return t.reviver(e,n,r,o)};return JSON.parse(e,a)}}});