define(["durandal/system","jquery"],function(e,n){var t;return t=n.parseHTML?function(e){return n.parseHTML(e)}:function(e){return n(e).get()},{viewExtension:".html",viewPlugin:"text",isViewUrl:function(e){return-1!==e.indexOf(this.viewExtension,e.length-this.viewExtension.length)},convertViewUrlToViewId:function(e){return e.substring(0,e.length-this.viewExtension.length)},convertViewIdToRequirePath:function(e){return this.viewPlugin+"!"+e+this.viewExtension},parseMarkup:t,processMarkup:function(e){var n=this.parseMarkup(e);return this.ensureSingleElement(n)},ensureSingleElement:function(e){if(1==e.length)return e[0];for(var t=[],r=0;r<e.length;r++){var o=e[r];if(8!=o.nodeType){if(3==o.nodeType){var a=/\S/.test(o.nodeValue);if(!a)continue}t.push(o)}}return t.length>1?n(t).wrapAll('<div class="durandal-wrapper"></div>').parent().get(0):t[0]},createView:function(n){var t=this,r=this.convertViewIdToRequirePath(n);return e.defer(function(o){e.acquire(r).then(function(e){var r=t.processMarkup(e);r.setAttribute("data-view",n),o.resolve(r)}).fail(function(e){t.createFallbackView(n,r,e).then(function(e){e.setAttribute("data-view",n),o.resolve(e)})})}).promise()},createFallbackView:function(n,t){var r=this,o='View Not Found. Searched for "'+n+'" via path "'+t+'".';return e.defer(function(e){e.resolve(r.processMarkup('<div class="durandal-view-404">'+o+"</div>"))}).promise()}}});