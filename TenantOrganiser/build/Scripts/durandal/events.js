define(["durandal/system"],function(e){var n=/\s+/,t=function(){},r=function(e,n){this.owner=e,this.events=n};return r.prototype.then=function(e,n){return this.callback=e||this.callback,this.context=n||this.context,this.callback?(this.owner.on(this.events,this.callback,this.context),this):this},r.prototype.on=r.prototype.then,r.prototype.off=function(){return this.owner.off(this.events,this.callback,this.context),this},t.prototype.on=function(e,t,o){var a,i,s;if(t){for(a=this.callbacks||(this.callbacks={}),e=e.split(n);i=e.shift();)s=a[i]||(a[i]=[]),s.push(t,o);return this}return new r(this,e)},t.prototype.off=function(t,r,o){var a,i,s,l;if(!(i=this.callbacks))return this;if(!(t||r||o))return delete this.callbacks,this;for(t=t?t.split(n):e.keys(i);a=t.shift();)if((s=i[a])&&(r||o))for(l=s.length-2;l>=0;l-=2)r&&s[l]!==r||o&&s[l+1]!==o||s.splice(l,2);else delete i[a];return this},t.prototype.trigger=function(e){var t,r,o,a,i,s,l,c;if(!(r=this.callbacks))return this;for(c=[],e=e.split(n),a=1,i=arguments.length;i>a;a++)c[a-1]=arguments[a];for(;t=e.shift();){if((l=r.all)&&(l=l.slice()),(o=r[t])&&(o=o.slice()),o)for(a=0,i=o.length;i>a;a+=2)o[a].apply(o[a+1]||this,c);if(l)for(s=[t].concat(c),a=0,i=l.length;i>a;a+=2)l[a].apply(l[a+1]||this,s)}return this},t.prototype.proxy=function(e){var n=this;return function(t){n.trigger(e,t)}},t.includeIn=function(e){e.on=t.prototype.on,e.off=t.prototype.off,e.trigger=t.prototype.trigger,e.proxy=t.prototype.proxy},t});