/******/ var __webpack_modules__ = ({

/***/ "./node_modules/@socket.io/component-emitter/index.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/@socket.io/component-emitter/index.mjs ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Emitter": () => (/* binding */ Emitter)
/* harmony export */ });
/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

// alias used for reserved events (protected method)
Emitter.prototype.emitReserved = Emitter.prototype.emit;

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


/***/ }),

/***/ "./node_modules/assetsm/dist/assetsm.min.js":
/*!**************************************************!*\
  !*** ./node_modules/assetsm/dist/assetsm.min.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AssetsManager)
/* harmony export */ });
const PROGRESS_EVENT_TYPE={loadstart:"loadstart",progress:"progress",abort:"abort",error:"error",load:"load",timeout:"timeout"};class AssetsManager{#e;#t;#i;#s;#a;#r;#o;#n;constructor(){this.#t=new Map,this.#i=new Map,this.#s=new Map,this.#a=new Map,this.#r=new Map,this.#o=new Map,this.#e=new EventTarget,this.#n=0}get filesWaitingForUpload(){return this.#a.size+this.#o.size+this.#r.size}getAudio(e){const t=this.#t.get(e);if(t)return t;Warning("Audio with key '"+e+"' is not loaded")}getImage(e){const t=this.#i.get(e);if(t)return t;Warning("Image with key '"+e+"' is not loaded")}getTileMap(e){const t=this.#s.get(e);if(t)return t;Warning("Tilemap with key '"+e+"' is not loaded")}preload(){return this.#d(),Promise.allSettled(Array.from(this.#a.entries()).map((e=>this.#l(e[0],e[1])))).then((e=>(e.forEach((e=>{"rejected"===e.status&&Warning(e.reason||e.value)})),Promise.allSettled(Array.from(this.#o.entries()).map((e=>this.#h(e[0],e[1])))).then((e=>(e.forEach((e=>{"rejected"===e.status&&Warning(e.reason||e.value)})),Promise.allSettled(Array.from(this.#r.entries()).map((e=>this.#u(e[0],e[1])))).then((e=>(e.forEach((e=>{"rejected"===e.status&&Warning(e.reason||e.value)})),this.#m(),Promise.resolve())))))))))}addAudio(e,t){this.#c(e,t),this.#a.has(e)&&Warning("Audio with key "+e+" is already registered"),this.#a.set(e,t)}addImage(e,t){this.#c(e,t),this.#r.has(e)&&Warning("Image with key "+e+" is already registered"),this.#r.set(e,t)}addTileMap(e,t){this.#c(e,t),this.#o.has(e)&&Warning("Tilemap with key "+e+" is already registered"),this.#o.set(e,t)}addEventListener(e,t,...i){PROGRESS_EVENT_TYPE[e]?this.#e.addEventListener(e,t,...i):Warning("Event type should be one of the ProgressEvent.type")}removeEventListener(e,t,...i){this.#e.removeEventListener(e,t,...i)}#g(e,t){const{firstgid:i,source:s}=e;return this.#p(s),fetch(t+s).then((e=>e.json())).then((e=>{const{name:s,image:a}=e;return s&&a&&this.addImage(s,t?t+a:a,e),e.gid=i,Promise.resolve(e)})).catch((()=>{const e=new Error("Can't load related tileset ",s);return Promise.reject(e)}))}#h(e,t){return this.#E(t),fetch(t).then((e=>e.json())).then((i=>{let s,a=t.split("/"),r=a.length;if(a[r-1].includes(".tmj")||a[r-1].includes(".json")?(a.pop(),s=a.join("/")+"/"):(a[r-2].includes(".tmj")||a[r-2].includes(".json"))&&(a.splice(r-2,2),s=a.join("/")+"/"),this.#P(e,i),this.#T(e),i.tilesets&&i.tilesets.length>0){const t=[];return i.tilesets.forEach(((i,a)=>{const r=this.#g(i,s).then((t=>(this.#v(e,a,t),this.#w(),Promise.resolve())));t.push(r)})),Promise.all(t)}})).catch((e=>(e.message.includes("JSON.parse:")&&(e=new Error("Can't load tilemap "+t)),this.#Q(e),Promise.reject(e))))}#l(e,t){return new Promise(((i,s)=>{const a=new Audio(t);a.addEventListener("loadeddata",(()=>{this.#f(e,a),this.#L(e),this.#w(),i()})),a.addEventListener("error",(()=>{const e=new Error("Can't load audio "+t);this.#Q(e),s(e)}))}))}#u(e,t){return new Promise(((i,s)=>{const a=new Image;a.onload=()=>{createImageBitmap(a).then((t=>{this.#M(e,t),this.#j(e),this.#w(),i()}))},a.onerror=()=>{const e=new Error("Can't load image "+t);this.#Q(e),s(e)},a.src=t}))}#p(e){e.includes(".tsj")||e.includes(".json")||Exception("Related Tileset file type is not correct, only .tsj or .json files are supported")}#E(e){e.includes(".tmj")||e.includes(".json")||Exception("Tilemap file type is not correct, only .tmj or .json files are supported")}#c(e,t){const i="image key and url should be provided";e&&0!==e.trim().length||Exception(i),t&&0!==t.trim().length||Exception(i)}#f(e,t){this.#t.set(e,t)}#L(e){this.#a.delete(e)}#M(e,t){this.#i.set(e,t)}#j(e){this.#r.delete(e)}#v(e,t,i){this.#s.get(e).tilesets[t].data=i}#P(e,t){this.#s.set(e,t)}#T(e){this.#o.delete(e)}#d(){let e=this.filesWaitingForUpload;this.#e.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.loadstart,{total:e}))}#m(){this.#e.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.load))}#w(){const e=this.filesWaitingForUpload;this.#n+=1,this.#e.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.progress,{lengthComputable:!0,loaded:this.#n,total:e}))}#Q(e){this.#e.dispatchEvent(new ProgressEvent(PROGRESS_EVENT_TYPE.error,{error:e}))}}function Exception(e){throw new Error(e)}function Warning(e){console.warn(e)}

/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/contrib/has-cors.js":
/*!*********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/contrib/has-cors.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hasCORS": () => (/* binding */ hasCORS)
/* harmony export */ });
// imported from https://github.com/component/has-cors
let value = false;
try {
    value = typeof XMLHttpRequest !== 'undefined' &&
        'withCredentials' in new XMLHttpRequest();
}
catch (err) {
    // if XMLHttp support is disabled in IE then it will throw
    // when trying to create
}
const hasCORS = value;


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/contrib/parseqs.js":
/*!********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/contrib/parseqs.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode)
/* harmony export */ });
// imported from https://github.com/galkn/querystring
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */
function encode(obj) {
    let str = '';
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            if (str.length)
                str += '&';
            str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
        }
    }
    return str;
}
/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */
function decode(qs) {
    let qry = {};
    let pairs = qs.split('&');
    for (let i = 0, l = pairs.length; i < l; i++) {
        let pair = pairs[i].split('=');
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
}


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/contrib/parseuri.js":
/*!*********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/contrib/parseuri.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "parse": () => (/* binding */ parse)
/* harmony export */ });
// imported from https://github.com/galkn/parseuri
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */
const re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
const parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];
function parse(str) {
    const src = str, b = str.indexOf('['), e = str.indexOf(']');
    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }
    let m = re.exec(str || ''), uri = {}, i = 14;
    while (i--) {
        uri[parts[i]] = m[i] || '';
    }
    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }
    uri.pathNames = pathNames(uri, uri['path']);
    uri.queryKey = queryKey(uri, uri['query']);
    return uri;
}
function pathNames(obj, path) {
    const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
    if (path.slice(0, 1) == '/' || path.length === 0) {
        names.splice(0, 1);
    }
    if (path.slice(-1) == '/') {
        names.splice(names.length - 1, 1);
    }
    return names;
}
function queryKey(uri, query) {
    const data = {};
    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
        if ($1) {
            data[$1] = $2;
        }
    });
    return data;
}


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/contrib/yeast.js":
/*!******************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/contrib/yeast.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode),
/* harmony export */   "yeast": () => (/* binding */ yeast)
/* harmony export */ });
// imported from https://github.com/unshiftio/yeast

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''), length = 64, map = {};
let seed = 0, i = 0, prev;
/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
    let encoded = '';
    do {
        encoded = alphabet[num % length] + encoded;
        num = Math.floor(num / length);
    } while (num > 0);
    return encoded;
}
/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
    let decoded = 0;
    for (i = 0; i < str.length; i++) {
        decoded = decoded * length + map[str.charAt(i)];
    }
    return decoded;
}
/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
    const now = encode(+new Date());
    if (now !== prev)
        return seed = 0, prev = now;
    return now + '.' + encode(seed++);
}
//
// Map each character to its index.
//
for (; i < length; i++)
    map[alphabet[i]] = i;


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/globalThis.browser.js":
/*!***********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/globalThis.browser.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "globalThisShim": () => (/* binding */ globalThisShim)
/* harmony export */ });
const globalThisShim = (() => {
    if (typeof self !== "undefined") {
        return self;
    }
    else if (typeof window !== "undefined") {
        return window;
    }
    else {
        return Function("return this")();
    }
})();


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Socket": () => (/* reexport safe */ _socket_js__WEBPACK_IMPORTED_MODULE_0__.Socket),
/* harmony export */   "Transport": () => (/* reexport safe */ _transport_js__WEBPACK_IMPORTED_MODULE_1__.Transport),
/* harmony export */   "installTimerFunctions": () => (/* reexport safe */ _util_js__WEBPACK_IMPORTED_MODULE_3__.installTimerFunctions),
/* harmony export */   "nextTick": () => (/* reexport safe */ _transports_websocket_constructor_js__WEBPACK_IMPORTED_MODULE_5__.nextTick),
/* harmony export */   "parse": () => (/* reexport safe */ _contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_4__.parse),
/* harmony export */   "protocol": () => (/* binding */ protocol),
/* harmony export */   "transports": () => (/* reexport safe */ _transports_index_js__WEBPACK_IMPORTED_MODULE_2__.transports)
/* harmony export */ });
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket.js */ "./node_modules/engine.io-client/build/esm/socket.js");
/* harmony import */ var _transport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./transport.js */ "./node_modules/engine.io-client/build/esm/transport.js");
/* harmony import */ var _transports_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transports/index.js */ "./node_modules/engine.io-client/build/esm/transports/index.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var _contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./contrib/parseuri.js */ "./node_modules/engine.io-client/build/esm/contrib/parseuri.js");
/* harmony import */ var _transports_websocket_constructor_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./transports/websocket-constructor.js */ "./node_modules/engine.io-client/build/esm/transports/websocket-constructor.browser.js");


const protocol = _socket_js__WEBPACK_IMPORTED_MODULE_0__.Socket.protocol;







/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/socket.js":
/*!***********************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/socket.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Socket": () => (/* binding */ Socket)
/* harmony export */ });
/* harmony import */ var _transports_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./transports/index.js */ "./node_modules/engine.io-client/build/esm/transports/index.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var _contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./contrib/parseqs.js */ "./node_modules/engine.io-client/build/esm/contrib/parseqs.js");
/* harmony import */ var _contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./contrib/parseuri.js */ "./node_modules/engine.io-client/build/esm/contrib/parseuri.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/index.mjs");
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");






class Socket extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_4__.Emitter {
    /**
     * Socket constructor.
     *
     * @param {String|Object} uri or options
     * @param {Object} opts - options
     * @api public
     */
    constructor(uri, opts = {}) {
        super();
        if (uri && "object" === typeof uri) {
            opts = uri;
            uri = null;
        }
        if (uri) {
            uri = (0,_contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_3__.parse)(uri);
            opts.hostname = uri.host;
            opts.secure = uri.protocol === "https" || uri.protocol === "wss";
            opts.port = uri.port;
            if (uri.query)
                opts.query = uri.query;
        }
        else if (opts.host) {
            opts.hostname = (0,_contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_3__.parse)(opts.host).host;
        }
        (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.installTimerFunctions)(this, opts);
        this.secure =
            null != opts.secure
                ? opts.secure
                : typeof location !== "undefined" && "https:" === location.protocol;
        if (opts.hostname && !opts.port) {
            // if no port is specified manually, use the protocol default
            opts.port = this.secure ? "443" : "80";
        }
        this.hostname =
            opts.hostname ||
                (typeof location !== "undefined" ? location.hostname : "localhost");
        this.port =
            opts.port ||
                (typeof location !== "undefined" && location.port
                    ? location.port
                    : this.secure
                        ? "443"
                        : "80");
        this.transports = opts.transports || ["polling", "websocket"];
        this.readyState = "";
        this.writeBuffer = [];
        this.prevBufferLen = 0;
        this.opts = Object.assign({
            path: "/engine.io",
            agent: false,
            withCredentials: false,
            upgrade: true,
            timestampParam: "t",
            rememberUpgrade: false,
            rejectUnauthorized: true,
            perMessageDeflate: {
                threshold: 1024
            },
            transportOptions: {},
            closeOnBeforeunload: true
        }, opts);
        this.opts.path = this.opts.path.replace(/\/$/, "") + "/";
        if (typeof this.opts.query === "string") {
            this.opts.query = (0,_contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_2__.decode)(this.opts.query);
        }
        // set on handshake
        this.id = null;
        this.upgrades = null;
        this.pingInterval = null;
        this.pingTimeout = null;
        // set on heartbeat
        this.pingTimeoutTimer = null;
        if (typeof addEventListener === "function") {
            if (this.opts.closeOnBeforeunload) {
                // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                // closed/reloaded)
                this.beforeunloadEventListener = () => {
                    if (this.transport) {
                        // silently close the transport
                        this.transport.removeAllListeners();
                        this.transport.close();
                    }
                };
                addEventListener("beforeunload", this.beforeunloadEventListener, false);
            }
            if (this.hostname !== "localhost") {
                this.offlineEventListener = () => {
                    this.onClose("transport close", {
                        description: "network connection lost"
                    });
                };
                addEventListener("offline", this.offlineEventListener, false);
            }
        }
        this.open();
    }
    /**
     * Creates transport of the given type.
     *
     * @param {String} transport name
     * @return {Transport}
     * @api private
     */
    createTransport(name) {
        const query = Object.assign({}, this.opts.query);
        // append engine.io protocol identifier
        query.EIO = engine_io_parser__WEBPACK_IMPORTED_MODULE_5__.protocol;
        // transport name
        query.transport = name;
        // session id if we already have one
        if (this.id)
            query.sid = this.id;
        const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
            query,
            socket: this,
            hostname: this.hostname,
            secure: this.secure,
            port: this.port
        });
        return new _transports_index_js__WEBPACK_IMPORTED_MODULE_0__.transports[name](opts);
    }
    /**
     * Initializes transport to use and starts probe.
     *
     * @api private
     */
    open() {
        let transport;
        if (this.opts.rememberUpgrade &&
            Socket.priorWebsocketSuccess &&
            this.transports.indexOf("websocket") !== -1) {
            transport = "websocket";
        }
        else if (0 === this.transports.length) {
            // Emit error on next tick so it can be listened to
            this.setTimeoutFn(() => {
                this.emitReserved("error", "No transports available");
            }, 0);
            return;
        }
        else {
            transport = this.transports[0];
        }
        this.readyState = "opening";
        // Retry with the next transport if the transport is disabled (jsonp: false)
        try {
            transport = this.createTransport(transport);
        }
        catch (e) {
            this.transports.shift();
            this.open();
            return;
        }
        transport.open();
        this.setTransport(transport);
    }
    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @api private
     */
    setTransport(transport) {
        if (this.transport) {
            this.transport.removeAllListeners();
        }
        // set up transport
        this.transport = transport;
        // set up transport listeners
        transport
            .on("drain", this.onDrain.bind(this))
            .on("packet", this.onPacket.bind(this))
            .on("error", this.onError.bind(this))
            .on("close", reason => this.onClose("transport close", reason));
    }
    /**
     * Probes a transport.
     *
     * @param {String} transport name
     * @api private
     */
    probe(name) {
        let transport = this.createTransport(name);
        let failed = false;
        Socket.priorWebsocketSuccess = false;
        const onTransportOpen = () => {
            if (failed)
                return;
            transport.send([{ type: "ping", data: "probe" }]);
            transport.once("packet", msg => {
                if (failed)
                    return;
                if ("pong" === msg.type && "probe" === msg.data) {
                    this.upgrading = true;
                    this.emitReserved("upgrading", transport);
                    if (!transport)
                        return;
                    Socket.priorWebsocketSuccess = "websocket" === transport.name;
                    this.transport.pause(() => {
                        if (failed)
                            return;
                        if ("closed" === this.readyState)
                            return;
                        cleanup();
                        this.setTransport(transport);
                        transport.send([{ type: "upgrade" }]);
                        this.emitReserved("upgrade", transport);
                        transport = null;
                        this.upgrading = false;
                        this.flush();
                    });
                }
                else {
                    const err = new Error("probe error");
                    // @ts-ignore
                    err.transport = transport.name;
                    this.emitReserved("upgradeError", err);
                }
            });
        };
        function freezeTransport() {
            if (failed)
                return;
            // Any callback called by transport should be ignored since now
            failed = true;
            cleanup();
            transport.close();
            transport = null;
        }
        // Handle any error that happens while probing
        const onerror = err => {
            const error = new Error("probe error: " + err);
            // @ts-ignore
            error.transport = transport.name;
            freezeTransport();
            this.emitReserved("upgradeError", error);
        };
        function onTransportClose() {
            onerror("transport closed");
        }
        // When the socket is closed while we're probing
        function onclose() {
            onerror("socket closed");
        }
        // When the socket is upgraded while we're probing
        function onupgrade(to) {
            if (transport && to.name !== transport.name) {
                freezeTransport();
            }
        }
        // Remove all listeners on the transport and on self
        const cleanup = () => {
            transport.removeListener("open", onTransportOpen);
            transport.removeListener("error", onerror);
            transport.removeListener("close", onTransportClose);
            this.off("close", onclose);
            this.off("upgrading", onupgrade);
        };
        transport.once("open", onTransportOpen);
        transport.once("error", onerror);
        transport.once("close", onTransportClose);
        this.once("close", onclose);
        this.once("upgrading", onupgrade);
        transport.open();
    }
    /**
     * Called when connection is deemed open.
     *
     * @api private
     */
    onOpen() {
        this.readyState = "open";
        Socket.priorWebsocketSuccess = "websocket" === this.transport.name;
        this.emitReserved("open");
        this.flush();
        // we check for `readyState` in case an `open`
        // listener already closed the socket
        if ("open" === this.readyState &&
            this.opts.upgrade &&
            this.transport.pause) {
            let i = 0;
            const l = this.upgrades.length;
            for (; i < l; i++) {
                this.probe(this.upgrades[i]);
            }
        }
    }
    /**
     * Handles a packet.
     *
     * @api private
     */
    onPacket(packet) {
        if ("opening" === this.readyState ||
            "open" === this.readyState ||
            "closing" === this.readyState) {
            this.emitReserved("packet", packet);
            // Socket is live - any packet counts
            this.emitReserved("heartbeat");
            switch (packet.type) {
                case "open":
                    this.onHandshake(JSON.parse(packet.data));
                    break;
                case "ping":
                    this.resetPingTimeout();
                    this.sendPacket("pong");
                    this.emitReserved("ping");
                    this.emitReserved("pong");
                    break;
                case "error":
                    const err = new Error("server error");
                    // @ts-ignore
                    err.code = packet.data;
                    this.onError(err);
                    break;
                case "message":
                    this.emitReserved("data", packet.data);
                    this.emitReserved("message", packet.data);
                    break;
            }
        }
        else {
        }
    }
    /**
     * Called upon handshake completion.
     *
     * @param {Object} data - handshake obj
     * @api private
     */
    onHandshake(data) {
        this.emitReserved("handshake", data);
        this.id = data.sid;
        this.transport.query.sid = data.sid;
        this.upgrades = this.filterUpgrades(data.upgrades);
        this.pingInterval = data.pingInterval;
        this.pingTimeout = data.pingTimeout;
        this.maxPayload = data.maxPayload;
        this.onOpen();
        // In case open handler closes socket
        if ("closed" === this.readyState)
            return;
        this.resetPingTimeout();
    }
    /**
     * Sets and resets ping timeout timer based on server pings.
     *
     * @api private
     */
    resetPingTimeout() {
        this.clearTimeoutFn(this.pingTimeoutTimer);
        this.pingTimeoutTimer = this.setTimeoutFn(() => {
            this.onClose("ping timeout");
        }, this.pingInterval + this.pingTimeout);
        if (this.opts.autoUnref) {
            this.pingTimeoutTimer.unref();
        }
    }
    /**
     * Called on `drain` event
     *
     * @api private
     */
    onDrain() {
        this.writeBuffer.splice(0, this.prevBufferLen);
        // setting prevBufferLen = 0 is very important
        // for example, when upgrading, upgrade packet is sent over,
        // and a nonzero prevBufferLen could cause problems on `drain`
        this.prevBufferLen = 0;
        if (0 === this.writeBuffer.length) {
            this.emitReserved("drain");
        }
        else {
            this.flush();
        }
    }
    /**
     * Flush write buffers.
     *
     * @api private
     */
    flush() {
        if ("closed" !== this.readyState &&
            this.transport.writable &&
            !this.upgrading &&
            this.writeBuffer.length) {
            const packets = this.getWritablePackets();
            this.transport.send(packets);
            // keep track of current length of writeBuffer
            // splice writeBuffer and callbackBuffer on `drain`
            this.prevBufferLen = packets.length;
            this.emitReserved("flush");
        }
    }
    /**
     * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
     * long-polling)
     *
     * @private
     */
    getWritablePackets() {
        const shouldCheckPayloadSize = this.maxPayload &&
            this.transport.name === "polling" &&
            this.writeBuffer.length > 1;
        if (!shouldCheckPayloadSize) {
            return this.writeBuffer;
        }
        let payloadSize = 1; // first packet type
        for (let i = 0; i < this.writeBuffer.length; i++) {
            const data = this.writeBuffer[i].data;
            if (data) {
                payloadSize += (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.byteLength)(data);
            }
            if (i > 0 && payloadSize > this.maxPayload) {
                return this.writeBuffer.slice(0, i);
            }
            payloadSize += 2; // separator + packet type
        }
        return this.writeBuffer;
    }
    /**
     * Sends a message.
     *
     * @param {String} message.
     * @param {Function} callback function.
     * @param {Object} options.
     * @return {Socket} for chaining.
     * @api public
     */
    write(msg, options, fn) {
        this.sendPacket("message", msg, options, fn);
        return this;
    }
    send(msg, options, fn) {
        this.sendPacket("message", msg, options, fn);
        return this;
    }
    /**
     * Sends a packet.
     *
     * @param {String} packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} callback function.
     * @api private
     */
    sendPacket(type, data, options, fn) {
        if ("function" === typeof data) {
            fn = data;
            data = undefined;
        }
        if ("function" === typeof options) {
            fn = options;
            options = null;
        }
        if ("closing" === this.readyState || "closed" === this.readyState) {
            return;
        }
        options = options || {};
        options.compress = false !== options.compress;
        const packet = {
            type: type,
            data: data,
            options: options
        };
        this.emitReserved("packetCreate", packet);
        this.writeBuffer.push(packet);
        if (fn)
            this.once("flush", fn);
        this.flush();
    }
    /**
     * Closes the connection.
     *
     * @api public
     */
    close() {
        const close = () => {
            this.onClose("forced close");
            this.transport.close();
        };
        const cleanupAndClose = () => {
            this.off("upgrade", cleanupAndClose);
            this.off("upgradeError", cleanupAndClose);
            close();
        };
        const waitForUpgrade = () => {
            // wait for upgrade to finish since we can't send packets while pausing a transport
            this.once("upgrade", cleanupAndClose);
            this.once("upgradeError", cleanupAndClose);
        };
        if ("opening" === this.readyState || "open" === this.readyState) {
            this.readyState = "closing";
            if (this.writeBuffer.length) {
                this.once("drain", () => {
                    if (this.upgrading) {
                        waitForUpgrade();
                    }
                    else {
                        close();
                    }
                });
            }
            else if (this.upgrading) {
                waitForUpgrade();
            }
            else {
                close();
            }
        }
        return this;
    }
    /**
     * Called upon transport error
     *
     * @api private
     */
    onError(err) {
        Socket.priorWebsocketSuccess = false;
        this.emitReserved("error", err);
        this.onClose("transport error", err);
    }
    /**
     * Called upon transport close.
     *
     * @api private
     */
    onClose(reason, description) {
        if ("opening" === this.readyState ||
            "open" === this.readyState ||
            "closing" === this.readyState) {
            // clear timers
            this.clearTimeoutFn(this.pingTimeoutTimer);
            // stop event from firing again for transport
            this.transport.removeAllListeners("close");
            // ensure transport won't stay open
            this.transport.close();
            // ignore further transport communication
            this.transport.removeAllListeners();
            if (typeof removeEventListener === "function") {
                removeEventListener("beforeunload", this.beforeunloadEventListener, false);
                removeEventListener("offline", this.offlineEventListener, false);
            }
            // set ready state
            this.readyState = "closed";
            // clear session id
            this.id = null;
            // emit close event
            this.emitReserved("close", reason, description);
            // clean buffers after, so users can still
            // grab the buffers on `close` event
            this.writeBuffer = [];
            this.prevBufferLen = 0;
        }
    }
    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} server upgrades
     * @api private
     *
     */
    filterUpgrades(upgrades) {
        const filteredUpgrades = [];
        let i = 0;
        const j = upgrades.length;
        for (; i < j; i++) {
            if (~this.transports.indexOf(upgrades[i]))
                filteredUpgrades.push(upgrades[i]);
        }
        return filteredUpgrades;
    }
}
Socket.protocol = engine_io_parser__WEBPACK_IMPORTED_MODULE_5__.protocol;


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/transport.js":
/*!**************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transport.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Transport": () => (/* binding */ Transport)
/* harmony export */ });
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/index.mjs");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util.js */ "./node_modules/engine.io-client/build/esm/util.js");



class TransportError extends Error {
    constructor(reason, description, context) {
        super(reason);
        this.description = description;
        this.context = context;
        this.type = "TransportError";
    }
}
class Transport extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_1__.Emitter {
    /**
     * Transport abstract constructor.
     *
     * @param {Object} options.
     * @api private
     */
    constructor(opts) {
        super();
        this.writable = false;
        (0,_util_js__WEBPACK_IMPORTED_MODULE_2__.installTimerFunctions)(this, opts);
        this.opts = opts;
        this.query = opts.query;
        this.readyState = "";
        this.socket = opts.socket;
    }
    /**
     * Emits an error.
     *
     * @param {String} reason
     * @param description
     * @param context - the error context
     * @return {Transport} for chaining
     * @api protected
     */
    onError(reason, description, context) {
        super.emitReserved("error", new TransportError(reason, description, context));
        return this;
    }
    /**
     * Opens the transport.
     *
     * @api public
     */
    open() {
        if ("closed" === this.readyState || "" === this.readyState) {
            this.readyState = "opening";
            this.doOpen();
        }
        return this;
    }
    /**
     * Closes the transport.
     *
     * @api public
     */
    close() {
        if ("opening" === this.readyState || "open" === this.readyState) {
            this.doClose();
            this.onClose();
        }
        return this;
    }
    /**
     * Sends multiple packets.
     *
     * @param {Array} packets
     * @api public
     */
    send(packets) {
        if ("open" === this.readyState) {
            this.write(packets);
        }
        else {
            // this might happen if the transport was silently closed in the beforeunload event handler
        }
    }
    /**
     * Called upon open
     *
     * @api protected
     */
    onOpen() {
        this.readyState = "open";
        this.writable = true;
        super.emitReserved("open");
    }
    /**
     * Called with data.
     *
     * @param {String} data
     * @api protected
     */
    onData(data) {
        const packet = (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_0__.decodePacket)(data, this.socket.binaryType);
        this.onPacket(packet);
    }
    /**
     * Called with a decoded packet.
     *
     * @api protected
     */
    onPacket(packet) {
        super.emitReserved("packet", packet);
    }
    /**
     * Called upon close.
     *
     * @api protected
     */
    onClose(details) {
        this.readyState = "closed";
        super.emitReserved("close", details);
    }
}


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/transports/index.js":
/*!*********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "transports": () => (/* binding */ transports)
/* harmony export */ });
/* harmony import */ var _polling_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polling.js */ "./node_modules/engine.io-client/build/esm/transports/polling.js");
/* harmony import */ var _websocket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./websocket.js */ "./node_modules/engine.io-client/build/esm/transports/websocket.js");


const transports = {
    websocket: _websocket_js__WEBPACK_IMPORTED_MODULE_1__.WS,
    polling: _polling_js__WEBPACK_IMPORTED_MODULE_0__.Polling
};


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/transports/polling.js":
/*!***********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/polling.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Polling": () => (/* binding */ Polling),
/* harmony export */   "Request": () => (/* binding */ Request)
/* harmony export */ });
/* harmony import */ var _transport_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../transport.js */ "./node_modules/engine.io-client/build/esm/transport.js");
/* harmony import */ var _contrib_yeast_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../contrib/yeast.js */ "./node_modules/engine.io-client/build/esm/contrib/yeast.js");
/* harmony import */ var _contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contrib/parseqs.js */ "./node_modules/engine.io-client/build/esm/contrib/parseqs.js");
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");
/* harmony import */ var _xmlhttprequest_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./xmlhttprequest.js */ "./node_modules/engine.io-client/build/esm/transports/xmlhttprequest.browser.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/index.mjs");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var _globalThis_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../globalThis.js */ "./node_modules/engine.io-client/build/esm/globalThis.browser.js");








function empty() { }
const hasXHR2 = (function () {
    const xhr = new _xmlhttprequest_js__WEBPACK_IMPORTED_MODULE_4__.XHR({
        xdomain: false
    });
    return null != xhr.responseType;
})();
class Polling extends _transport_js__WEBPACK_IMPORTED_MODULE_0__.Transport {
    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @api public
     */
    constructor(opts) {
        super(opts);
        this.polling = false;
        if (typeof location !== "undefined") {
            const isSSL = "https:" === location.protocol;
            let port = location.port;
            // some user agents have empty `location.port`
            if (!port) {
                port = isSSL ? "443" : "80";
            }
            this.xd =
                (typeof location !== "undefined" &&
                    opts.hostname !== location.hostname) ||
                    port !== opts.port;
            this.xs = opts.secure !== isSSL;
        }
        /**
         * XHR supports binary
         */
        const forceBase64 = opts && opts.forceBase64;
        this.supportsBinary = hasXHR2 && !forceBase64;
    }
    /**
     * Transport name.
     */
    get name() {
        return "polling";
    }
    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @api private
     */
    doOpen() {
        this.poll();
    }
    /**
     * Pauses polling.
     *
     * @param {Function} callback upon buffers are flushed and transport is paused
     * @api private
     */
    pause(onPause) {
        this.readyState = "pausing";
        const pause = () => {
            this.readyState = "paused";
            onPause();
        };
        if (this.polling || !this.writable) {
            let total = 0;
            if (this.polling) {
                total++;
                this.once("pollComplete", function () {
                    --total || pause();
                });
            }
            if (!this.writable) {
                total++;
                this.once("drain", function () {
                    --total || pause();
                });
            }
        }
        else {
            pause();
        }
    }
    /**
     * Starts polling cycle.
     *
     * @api public
     */
    poll() {
        this.polling = true;
        this.doPoll();
        this.emitReserved("poll");
    }
    /**
     * Overloads onData to detect payloads.
     *
     * @api private
     */
    onData(data) {
        const callback = packet => {
            // if its the first message we consider the transport open
            if ("opening" === this.readyState && packet.type === "open") {
                this.onOpen();
            }
            // if its a close packet, we close the ongoing requests
            if ("close" === packet.type) {
                this.onClose({ description: "transport closed by the server" });
                return false;
            }
            // otherwise bypass onData and handle the message
            this.onPacket(packet);
        };
        // decode payload
        (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_3__.decodePayload)(data, this.socket.binaryType).forEach(callback);
        // if an event did not trigger closing
        if ("closed" !== this.readyState) {
            // if we got data we're not polling
            this.polling = false;
            this.emitReserved("pollComplete");
            if ("open" === this.readyState) {
                this.poll();
            }
            else {
            }
        }
    }
    /**
     * For polling, send a close packet.
     *
     * @api private
     */
    doClose() {
        const close = () => {
            this.write([{ type: "close" }]);
        };
        if ("open" === this.readyState) {
            close();
        }
        else {
            // in case we're trying to close while
            // handshaking is in progress (GH-164)
            this.once("open", close);
        }
    }
    /**
     * Writes a packets payload.
     *
     * @param {Array} data packets
     * @param {Function} drain callback
     * @api private
     */
    write(packets) {
        this.writable = false;
        (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_3__.encodePayload)(packets, data => {
            this.doWrite(data, () => {
                this.writable = true;
                this.emitReserved("drain");
            });
        });
    }
    /**
     * Generates uri for connection.
     *
     * @api private
     */
    uri() {
        let query = this.query || {};
        const schema = this.opts.secure ? "https" : "http";
        let port = "";
        // cache busting is forced
        if (false !== this.opts.timestampRequests) {
            query[this.opts.timestampParam] = (0,_contrib_yeast_js__WEBPACK_IMPORTED_MODULE_1__.yeast)();
        }
        if (!this.supportsBinary && !query.sid) {
            query.b64 = 1;
        }
        // avoid port if default for schema
        if (this.opts.port &&
            (("https" === schema && Number(this.opts.port) !== 443) ||
                ("http" === schema && Number(this.opts.port) !== 80))) {
            port = ":" + this.opts.port;
        }
        const encodedQuery = (0,_contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_2__.encode)(query);
        const ipv6 = this.opts.hostname.indexOf(":") !== -1;
        return (schema +
            "://" +
            (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
            port +
            this.opts.path +
            (encodedQuery.length ? "?" + encodedQuery : ""));
    }
    /**
     * Creates a request.
     *
     * @param {String} method
     * @api private
     */
    request(opts = {}) {
        Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
        return new Request(this.uri(), opts);
    }
    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @api private
     */
    doWrite(data, fn) {
        const req = this.request({
            method: "POST",
            data: data
        });
        req.on("success", fn);
        req.on("error", (xhrStatus, context) => {
            this.onError("xhr post error", xhrStatus, context);
        });
    }
    /**
     * Starts a poll cycle.
     *
     * @api private
     */
    doPoll() {
        const req = this.request();
        req.on("data", this.onData.bind(this));
        req.on("error", (xhrStatus, context) => {
            this.onError("xhr poll error", xhrStatus, context);
        });
        this.pollXhr = req;
    }
}
class Request extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_5__.Emitter {
    /**
     * Request constructor
     *
     * @param {Object} options
     * @api public
     */
    constructor(uri, opts) {
        super();
        (0,_util_js__WEBPACK_IMPORTED_MODULE_6__.installTimerFunctions)(this, opts);
        this.opts = opts;
        this.method = opts.method || "GET";
        this.uri = uri;
        this.async = false !== opts.async;
        this.data = undefined !== opts.data ? opts.data : null;
        this.create();
    }
    /**
     * Creates the XHR object and sends the request.
     *
     * @api private
     */
    create() {
        const opts = (0,_util_js__WEBPACK_IMPORTED_MODULE_6__.pick)(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
        opts.xdomain = !!this.opts.xd;
        opts.xscheme = !!this.opts.xs;
        const xhr = (this.xhr = new _xmlhttprequest_js__WEBPACK_IMPORTED_MODULE_4__.XHR(opts));
        try {
            xhr.open(this.method, this.uri, this.async);
            try {
                if (this.opts.extraHeaders) {
                    xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                    for (let i in this.opts.extraHeaders) {
                        if (this.opts.extraHeaders.hasOwnProperty(i)) {
                            xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                        }
                    }
                }
            }
            catch (e) { }
            if ("POST" === this.method) {
                try {
                    xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                }
                catch (e) { }
            }
            try {
                xhr.setRequestHeader("Accept", "*/*");
            }
            catch (e) { }
            // ie6 check
            if ("withCredentials" in xhr) {
                xhr.withCredentials = this.opts.withCredentials;
            }
            if (this.opts.requestTimeout) {
                xhr.timeout = this.opts.requestTimeout;
            }
            xhr.onreadystatechange = () => {
                if (4 !== xhr.readyState)
                    return;
                if (200 === xhr.status || 1223 === xhr.status) {
                    this.onLoad();
                }
                else {
                    // make sure the `error` event handler that's user-set
                    // does not throw in the same tick and gets caught here
                    this.setTimeoutFn(() => {
                        this.onError(typeof xhr.status === "number" ? xhr.status : 0);
                    }, 0);
                }
            };
            xhr.send(this.data);
        }
        catch (e) {
            // Need to defer since .create() is called directly from the constructor
            // and thus the 'error' event can only be only bound *after* this exception
            // occurs.  Therefore, also, we cannot throw here at all.
            this.setTimeoutFn(() => {
                this.onError(e);
            }, 0);
            return;
        }
        if (typeof document !== "undefined") {
            this.index = Request.requestsCount++;
            Request.requests[this.index] = this;
        }
    }
    /**
     * Called upon error.
     *
     * @api private
     */
    onError(err) {
        this.emitReserved("error", err, this.xhr);
        this.cleanup(true);
    }
    /**
     * Cleans up house.
     *
     * @api private
     */
    cleanup(fromError) {
        if ("undefined" === typeof this.xhr || null === this.xhr) {
            return;
        }
        this.xhr.onreadystatechange = empty;
        if (fromError) {
            try {
                this.xhr.abort();
            }
            catch (e) { }
        }
        if (typeof document !== "undefined") {
            delete Request.requests[this.index];
        }
        this.xhr = null;
    }
    /**
     * Called upon load.
     *
     * @api private
     */
    onLoad() {
        const data = this.xhr.responseText;
        if (data !== null) {
            this.emitReserved("data", data);
            this.emitReserved("success");
            this.cleanup();
        }
    }
    /**
     * Aborts the request.
     *
     * @api public
     */
    abort() {
        this.cleanup();
    }
}
Request.requestsCount = 0;
Request.requests = {};
/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */
if (typeof document !== "undefined") {
    // @ts-ignore
    if (typeof attachEvent === "function") {
        // @ts-ignore
        attachEvent("onunload", unloadHandler);
    }
    else if (typeof addEventListener === "function") {
        const terminationEvent = "onpagehide" in _globalThis_js__WEBPACK_IMPORTED_MODULE_7__.globalThisShim ? "pagehide" : "unload";
        addEventListener(terminationEvent, unloadHandler, false);
    }
}
function unloadHandler() {
    for (let i in Request.requests) {
        if (Request.requests.hasOwnProperty(i)) {
            Request.requests[i].abort();
        }
    }
}


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/transports/websocket-constructor.browser.js":
/*!*********************************************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/websocket-constructor.browser.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebSocket": () => (/* binding */ WebSocket),
/* harmony export */   "defaultBinaryType": () => (/* binding */ defaultBinaryType),
/* harmony export */   "nextTick": () => (/* binding */ nextTick),
/* harmony export */   "usingBrowserWebSocket": () => (/* binding */ usingBrowserWebSocket)
/* harmony export */ });
/* harmony import */ var _globalThis_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../globalThis.js */ "./node_modules/engine.io-client/build/esm/globalThis.browser.js");

const nextTick = (() => {
    const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
    if (isPromiseAvailable) {
        return cb => Promise.resolve().then(cb);
    }
    else {
        return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
    }
})();
const WebSocket = _globalThis_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim.WebSocket || _globalThis_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim.MozWebSocket;
const usingBrowserWebSocket = true;
const defaultBinaryType = "arraybuffer";


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/transports/websocket.js":
/*!*************************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/websocket.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WS": () => (/* binding */ WS)
/* harmony export */ });
/* harmony import */ var _transport_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../transport.js */ "./node_modules/engine.io-client/build/esm/transport.js");
/* harmony import */ var _contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../contrib/parseqs.js */ "./node_modules/engine.io-client/build/esm/contrib/parseqs.js");
/* harmony import */ var _contrib_yeast_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contrib/yeast.js */ "./node_modules/engine.io-client/build/esm/contrib/yeast.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var _websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./websocket-constructor.js */ "./node_modules/engine.io-client/build/esm/transports/websocket-constructor.browser.js");
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");






// detect ReactNative environment
const isReactNative = typeof navigator !== "undefined" &&
    typeof navigator.product === "string" &&
    navigator.product.toLowerCase() === "reactnative";
class WS extends _transport_js__WEBPACK_IMPORTED_MODULE_0__.Transport {
    /**
     * WebSocket transport constructor.
     *
     * @api {Object} connection options
     * @api public
     */
    constructor(opts) {
        super(opts);
        this.supportsBinary = !opts.forceBase64;
    }
    /**
     * Transport name.
     *
     * @api public
     */
    get name() {
        return "websocket";
    }
    /**
     * Opens socket.
     *
     * @api private
     */
    doOpen() {
        if (!this.check()) {
            // let probe timeout
            return;
        }
        const uri = this.uri();
        const protocols = this.opts.protocols;
        // React Native only supports the 'headers' option, and will print a warning if anything else is passed
        const opts = isReactNative
            ? {}
            : (0,_util_js__WEBPACK_IMPORTED_MODULE_3__.pick)(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
        if (this.opts.extraHeaders) {
            opts.headers = this.opts.extraHeaders;
        }
        try {
            this.ws =
                _websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.usingBrowserWebSocket && !isReactNative
                    ? protocols
                        ? new _websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.WebSocket(uri, protocols)
                        : new _websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.WebSocket(uri)
                    : new _websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.WebSocket(uri, protocols, opts);
        }
        catch (err) {
            return this.emitReserved("error", err);
        }
        this.ws.binaryType = this.socket.binaryType || _websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.defaultBinaryType;
        this.addEventListeners();
    }
    /**
     * Adds event listeners to the socket
     *
     * @api private
     */
    addEventListeners() {
        this.ws.onopen = () => {
            if (this.opts.autoUnref) {
                this.ws._socket.unref();
            }
            this.onOpen();
        };
        this.ws.onclose = closeEvent => this.onClose({
            description: "websocket connection closed",
            context: closeEvent
        });
        this.ws.onmessage = ev => this.onData(ev.data);
        this.ws.onerror = e => this.onError("websocket error", e);
    }
    /**
     * Writes data to socket.
     *
     * @param {Array} array of packets.
     * @api private
     */
    write(packets) {
        this.writable = false;
        // encodePacket efficient as it uses WS framing
        // no need for encodePayload
        for (let i = 0; i < packets.length; i++) {
            const packet = packets[i];
            const lastPacket = i === packets.length - 1;
            (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_5__.encodePacket)(packet, this.supportsBinary, data => {
                // always create a new object (GH-437)
                const opts = {};
                if (!_websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.usingBrowserWebSocket) {
                    if (packet.options) {
                        opts.compress = packet.options.compress;
                    }
                    if (this.opts.perMessageDeflate) {
                        const len = 
                        // @ts-ignore
                        "string" === typeof data ? Buffer.byteLength(data) : data.length;
                        if (len < this.opts.perMessageDeflate.threshold) {
                            opts.compress = false;
                        }
                    }
                }
                // Sometimes the websocket has already been closed but the browser didn't
                // have a chance of informing us about it yet, in that case send will
                // throw an error
                try {
                    if (_websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.usingBrowserWebSocket) {
                        // TypeError is thrown when passing the second argument on Safari
                        this.ws.send(data);
                    }
                    else {
                        this.ws.send(data, opts);
                    }
                }
                catch (e) {
                }
                if (lastPacket) {
                    // fake drain
                    // defer to next tick to allow Socket to clear writeBuffer
                    (0,_websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.nextTick)(() => {
                        this.writable = true;
                        this.emitReserved("drain");
                    }, this.setTimeoutFn);
                }
            });
        }
    }
    /**
     * Closes socket.
     *
     * @api private
     */
    doClose() {
        if (typeof this.ws !== "undefined") {
            this.ws.close();
            this.ws = null;
        }
    }
    /**
     * Generates uri for connection.
     *
     * @api private
     */
    uri() {
        let query = this.query || {};
        const schema = this.opts.secure ? "wss" : "ws";
        let port = "";
        // avoid port if default for schema
        if (this.opts.port &&
            (("wss" === schema && Number(this.opts.port) !== 443) ||
                ("ws" === schema && Number(this.opts.port) !== 80))) {
            port = ":" + this.opts.port;
        }
        // append timestamp to URI
        if (this.opts.timestampRequests) {
            query[this.opts.timestampParam] = (0,_contrib_yeast_js__WEBPACK_IMPORTED_MODULE_2__.yeast)();
        }
        // communicate binary support capabilities
        if (!this.supportsBinary) {
            query.b64 = 1;
        }
        const encodedQuery = (0,_contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_1__.encode)(query);
        const ipv6 = this.opts.hostname.indexOf(":") !== -1;
        return (schema +
            "://" +
            (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
            port +
            this.opts.path +
            (encodedQuery.length ? "?" + encodedQuery : ""));
    }
    /**
     * Feature detection for WebSocket.
     *
     * @return {Boolean} whether this transport is available.
     * @api public
     */
    check() {
        return !!_websocket_constructor_js__WEBPACK_IMPORTED_MODULE_4__.WebSocket;
    }
}


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/transports/xmlhttprequest.browser.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/xmlhttprequest.browser.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "XHR": () => (/* binding */ XHR)
/* harmony export */ });
/* harmony import */ var _contrib_has_cors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../contrib/has-cors.js */ "./node_modules/engine.io-client/build/esm/contrib/has-cors.js");
/* harmony import */ var _globalThis_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../globalThis.js */ "./node_modules/engine.io-client/build/esm/globalThis.browser.js");
// browser shim for xmlhttprequest module


function XHR(opts) {
    const xdomain = opts.xdomain;
    // XMLHttpRequest can be disabled on IE
    try {
        if ("undefined" !== typeof XMLHttpRequest && (!xdomain || _contrib_has_cors_js__WEBPACK_IMPORTED_MODULE_0__.hasCORS)) {
            return new XMLHttpRequest();
        }
    }
    catch (e) { }
    if (!xdomain) {
        try {
            return new _globalThis_js__WEBPACK_IMPORTED_MODULE_1__.globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
        }
        catch (e) { }
    }
}


/***/ }),

/***/ "./node_modules/engine.io-client/build/esm/util.js":
/*!*********************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/util.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "byteLength": () => (/* binding */ byteLength),
/* harmony export */   "installTimerFunctions": () => (/* binding */ installTimerFunctions),
/* harmony export */   "pick": () => (/* binding */ pick)
/* harmony export */ });
/* harmony import */ var _globalThis_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globalThis.js */ "./node_modules/engine.io-client/build/esm/globalThis.browser.js");

function pick(obj, ...attr) {
    return attr.reduce((acc, k) => {
        if (obj.hasOwnProperty(k)) {
            acc[k] = obj[k];
        }
        return acc;
    }, {});
}
// Keep a reference to the real timeout functions so they can be used when overridden
const NATIVE_SET_TIMEOUT = setTimeout;
const NATIVE_CLEAR_TIMEOUT = clearTimeout;
function installTimerFunctions(obj, opts) {
    if (opts.useNativeTimers) {
        obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(_globalThis_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim);
        obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(_globalThis_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim);
    }
    else {
        obj.setTimeoutFn = setTimeout.bind(_globalThis_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim);
        obj.clearTimeoutFn = clearTimeout.bind(_globalThis_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim);
    }
}
// base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
const BASE64_OVERHEAD = 1.33;
// we could also have used `new Blob([obj]).size`, but it isn't supported in IE9
function byteLength(obj) {
    if (typeof obj === "string") {
        return utf8Length(obj);
    }
    // arraybuffer or blob
    return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
    let c = 0, length = 0;
    for (let i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) {
            length += 1;
        }
        else if (c < 0x800) {
            length += 2;
        }
        else if (c < 0xd800 || c >= 0xe000) {
            length += 3;
        }
        else {
            i++;
            length += 4;
        }
    }
    return length;
}


/***/ }),

/***/ "./node_modules/engine.io-parser/build/esm/commons.js":
/*!************************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/commons.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ERROR_PACKET": () => (/* binding */ ERROR_PACKET),
/* harmony export */   "PACKET_TYPES": () => (/* binding */ PACKET_TYPES),
/* harmony export */   "PACKET_TYPES_REVERSE": () => (/* binding */ PACKET_TYPES_REVERSE)
/* harmony export */ });
const PACKET_TYPES = Object.create(null); // no Map = no polyfill
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
const PACKET_TYPES_REVERSE = Object.create(null);
Object.keys(PACKET_TYPES).forEach(key => {
    PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
const ERROR_PACKET = { type: "error", data: "parser error" };



/***/ }),

/***/ "./node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode)
/* harmony export */ });
// imported from https://github.com/socketio/base64-arraybuffer
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
const lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}
const encode = (arraybuffer) => {
    let bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    }
    else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
};
const decode = (base64) => {
    let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }
    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return arraybuffer;
};


/***/ }),

/***/ "./node_modules/engine.io-parser/build/esm/decodePacket.browser.js":
/*!*************************************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/decodePacket.browser.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _commons_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./commons.js */ "./node_modules/engine.io-parser/build/esm/commons.js");
/* harmony import */ var _contrib_base64_arraybuffer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contrib/base64-arraybuffer.js */ "./node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js");


const withNativeArrayBuffer = typeof ArrayBuffer === "function";
const decodePacket = (encodedPacket, binaryType) => {
    if (typeof encodedPacket !== "string") {
        return {
            type: "message",
            data: mapBinary(encodedPacket, binaryType)
        };
    }
    const type = encodedPacket.charAt(0);
    if (type === "b") {
        return {
            type: "message",
            data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
        };
    }
    const packetType = _commons_js__WEBPACK_IMPORTED_MODULE_0__.PACKET_TYPES_REVERSE[type];
    if (!packetType) {
        return _commons_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_PACKET;
    }
    return encodedPacket.length > 1
        ? {
            type: _commons_js__WEBPACK_IMPORTED_MODULE_0__.PACKET_TYPES_REVERSE[type],
            data: encodedPacket.substring(1)
        }
        : {
            type: _commons_js__WEBPACK_IMPORTED_MODULE_0__.PACKET_TYPES_REVERSE[type]
        };
};
const decodeBase64Packet = (data, binaryType) => {
    if (withNativeArrayBuffer) {
        const decoded = (0,_contrib_base64_arraybuffer_js__WEBPACK_IMPORTED_MODULE_1__.decode)(data);
        return mapBinary(decoded, binaryType);
    }
    else {
        return { base64: true, data }; // fallback for old browsers
    }
};
const mapBinary = (data, binaryType) => {
    switch (binaryType) {
        case "blob":
            return data instanceof ArrayBuffer ? new Blob([data]) : data;
        case "arraybuffer":
        default:
            return data; // assuming the data is already an ArrayBuffer
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (decodePacket);


/***/ }),

/***/ "./node_modules/engine.io-parser/build/esm/encodePacket.browser.js":
/*!*************************************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/encodePacket.browser.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _commons_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./commons.js */ "./node_modules/engine.io-parser/build/esm/commons.js");

const withNativeBlob = typeof Blob === "function" ||
    (typeof Blob !== "undefined" &&
        Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
const withNativeArrayBuffer = typeof ArrayBuffer === "function";
// ArrayBuffer.isView method is not defined in IE10
const isView = obj => {
    return typeof ArrayBuffer.isView === "function"
        ? ArrayBuffer.isView(obj)
        : obj && obj.buffer instanceof ArrayBuffer;
};
const encodePacket = ({ type, data }, supportsBinary, callback) => {
    if (withNativeBlob && data instanceof Blob) {
        if (supportsBinary) {
            return callback(data);
        }
        else {
            return encodeBlobAsBase64(data, callback);
        }
    }
    else if (withNativeArrayBuffer &&
        (data instanceof ArrayBuffer || isView(data))) {
        if (supportsBinary) {
            return callback(data);
        }
        else {
            return encodeBlobAsBase64(new Blob([data]), callback);
        }
    }
    // plain string
    return callback(_commons_js__WEBPACK_IMPORTED_MODULE_0__.PACKET_TYPES[type] + (data || ""));
};
const encodeBlobAsBase64 = (data, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        const content = fileReader.result.split(",")[1];
        callback("b" + (content || ""));
    };
    return fileReader.readAsDataURL(data);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (encodePacket);


/***/ }),

/***/ "./node_modules/engine.io-parser/build/esm/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "decodePacket": () => (/* reexport safe */ _decodePacket_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "decodePayload": () => (/* binding */ decodePayload),
/* harmony export */   "encodePacket": () => (/* reexport safe */ _encodePacket_js__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   "encodePayload": () => (/* binding */ encodePayload),
/* harmony export */   "protocol": () => (/* binding */ protocol)
/* harmony export */ });
/* harmony import */ var _encodePacket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./encodePacket.js */ "./node_modules/engine.io-parser/build/esm/encodePacket.browser.js");
/* harmony import */ var _decodePacket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./decodePacket.js */ "./node_modules/engine.io-parser/build/esm/decodePacket.browser.js");


const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
const encodePayload = (packets, callback) => {
    // some packets may be added to the array while encoding, so the initial length must be saved
    const length = packets.length;
    const encodedPackets = new Array(length);
    let count = 0;
    packets.forEach((packet, i) => {
        // force base64 encoding for binary packets
        (0,_encodePacket_js__WEBPACK_IMPORTED_MODULE_0__["default"])(packet, false, encodedPacket => {
            encodedPackets[i] = encodedPacket;
            if (++count === length) {
                callback(encodedPackets.join(SEPARATOR));
            }
        });
    });
};
const decodePayload = (encodedPayload, binaryType) => {
    const encodedPackets = encodedPayload.split(SEPARATOR);
    const packets = [];
    for (let i = 0; i < encodedPackets.length; i++) {
        const decodedPacket = (0,_decodePacket_js__WEBPACK_IMPORTED_MODULE_1__["default"])(encodedPackets[i], binaryType);
        packets.push(decodedPacket);
        if (decodedPacket.type === "error") {
            break;
        }
    }
    return packets;
};
const protocol = 4;



/***/ }),

/***/ "./node_modules/socket.io-client/build/esm/contrib/backo2.js":
/*!*******************************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/contrib/backo2.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Backoff": () => (/* binding */ Backoff)
/* harmony export */ });
/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */
function Backoff(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 10000;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
}
/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */
Backoff.prototype.duration = function () {
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
        var rand = Math.random();
        var deviation = Math.floor(rand * this.jitter * ms);
        ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
};
/**
 * Reset the number of attempts.
 *
 * @api public
 */
Backoff.prototype.reset = function () {
    this.attempts = 0;
};
/**
 * Set the minimum duration
 *
 * @api public
 */
Backoff.prototype.setMin = function (min) {
    this.ms = min;
};
/**
 * Set the maximum duration
 *
 * @api public
 */
Backoff.prototype.setMax = function (max) {
    this.max = max;
};
/**
 * Set the jitter
 *
 * @api public
 */
Backoff.prototype.setJitter = function (jitter) {
    this.jitter = jitter;
};


/***/ }),

/***/ "./node_modules/socket.io-client/build/esm/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Manager": () => (/* reexport safe */ _manager_js__WEBPACK_IMPORTED_MODULE_1__.Manager),
/* harmony export */   "Socket": () => (/* reexport safe */ _socket_js__WEBPACK_IMPORTED_MODULE_2__.Socket),
/* harmony export */   "connect": () => (/* binding */ lookup),
/* harmony export */   "default": () => (/* binding */ lookup),
/* harmony export */   "io": () => (/* binding */ lookup),
/* harmony export */   "protocol": () => (/* reexport safe */ socket_io_parser__WEBPACK_IMPORTED_MODULE_3__.protocol)
/* harmony export */ });
/* harmony import */ var _url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./url.js */ "./node_modules/socket.io-client/build/esm/url.js");
/* harmony import */ var _manager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./manager.js */ "./node_modules/socket.io-client/build/esm/manager.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./socket.js */ "./node_modules/socket.io-client/build/esm/socket.js");
/* harmony import */ var socket_io_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! socket.io-parser */ "./node_modules/socket.io-parser/build/esm/index.js");



/**
 * Managers cache.
 */
const cache = {};
function lookup(uri, opts) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }
    opts = opts || {};
    const parsed = (0,_url_js__WEBPACK_IMPORTED_MODULE_0__.url)(uri, opts.path || "/socket.io");
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew ||
        opts["force new connection"] ||
        false === opts.multiplex ||
        sameNamespace;
    let io;
    if (newConnection) {
        io = new _manager_js__WEBPACK_IMPORTED_MODULE_1__.Manager(source, opts);
    }
    else {
        if (!cache[id]) {
            cache[id] = new _manager_js__WEBPACK_IMPORTED_MODULE_1__.Manager(source, opts);
        }
        io = cache[id];
    }
    if (parsed.query && !opts.query) {
        opts.query = parsed.queryKey;
    }
    return io.socket(parsed.path, opts);
}
// so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
// namespace (e.g. `io.connect(...)`), for backward compatibility
Object.assign(lookup, {
    Manager: _manager_js__WEBPACK_IMPORTED_MODULE_1__.Manager,
    Socket: _socket_js__WEBPACK_IMPORTED_MODULE_2__.Socket,
    io: lookup,
    connect: lookup,
});
/**
 * Protocol version.
 *
 * @public
 */

/**
 * Expose constructors for standalone build.
 *
 * @public
 */



/***/ }),

/***/ "./node_modules/socket.io-client/build/esm/manager.js":
/*!************************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/manager.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Manager": () => (/* binding */ Manager)
/* harmony export */ });
/* harmony import */ var engine_io_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! engine.io-client */ "./node_modules/engine.io-client/build/esm/index.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./socket.js */ "./node_modules/socket.io-client/build/esm/socket.js");
/* harmony import */ var socket_io_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! socket.io-parser */ "./node_modules/socket.io-parser/build/esm/index.js");
/* harmony import */ var _on_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./on.js */ "./node_modules/socket.io-client/build/esm/on.js");
/* harmony import */ var _contrib_backo2_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./contrib/backo2.js */ "./node_modules/socket.io-client/build/esm/contrib/backo2.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/index.mjs");






class Manager extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_5__.Emitter {
    constructor(uri, opts) {
        var _a;
        super();
        this.nsps = {};
        this.subs = [];
        if (uri && "object" === typeof uri) {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        opts.path = opts.path || "/socket.io";
        this.opts = opts;
        (0,engine_io_client__WEBPACK_IMPORTED_MODULE_0__.installTimerFunctions)(this, opts);
        this.reconnection(opts.reconnection !== false);
        this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
        this.reconnectionDelay(opts.reconnectionDelay || 1000);
        this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
        this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
        this.backoff = new _contrib_backo2_js__WEBPACK_IMPORTED_MODULE_4__.Backoff({
            min: this.reconnectionDelay(),
            max: this.reconnectionDelayMax(),
            jitter: this.randomizationFactor(),
        });
        this.timeout(null == opts.timeout ? 20000 : opts.timeout);
        this._readyState = "closed";
        this.uri = uri;
        const _parser = opts.parser || socket_io_parser__WEBPACK_IMPORTED_MODULE_2__;
        this.encoder = new _parser.Encoder();
        this.decoder = new _parser.Decoder();
        this._autoConnect = opts.autoConnect !== false;
        if (this._autoConnect)
            this.open();
    }
    reconnection(v) {
        if (!arguments.length)
            return this._reconnection;
        this._reconnection = !!v;
        return this;
    }
    reconnectionAttempts(v) {
        if (v === undefined)
            return this._reconnectionAttempts;
        this._reconnectionAttempts = v;
        return this;
    }
    reconnectionDelay(v) {
        var _a;
        if (v === undefined)
            return this._reconnectionDelay;
        this._reconnectionDelay = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
        return this;
    }
    randomizationFactor(v) {
        var _a;
        if (v === undefined)
            return this._randomizationFactor;
        this._randomizationFactor = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
        return this;
    }
    reconnectionDelayMax(v) {
        var _a;
        if (v === undefined)
            return this._reconnectionDelayMax;
        this._reconnectionDelayMax = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
        return this;
    }
    timeout(v) {
        if (!arguments.length)
            return this._timeout;
        this._timeout = v;
        return this;
    }
    /**
     * Starts trying to reconnect if reconnection is enabled and we have not
     * started reconnecting yet
     *
     * @private
     */
    maybeReconnectOnOpen() {
        // Only try to reconnect if it's the first time we're connecting
        if (!this._reconnecting &&
            this._reconnection &&
            this.backoff.attempts === 0) {
            // keeps reconnection from firing twice for the same reconnection loop
            this.reconnect();
        }
    }
    /**
     * Sets the current transport `socket`.
     *
     * @param {Function} fn - optional, callback
     * @return self
     * @public
     */
    open(fn) {
        if (~this._readyState.indexOf("open"))
            return this;
        this.engine = new engine_io_client__WEBPACK_IMPORTED_MODULE_0__.Socket(this.uri, this.opts);
        const socket = this.engine;
        const self = this;
        this._readyState = "opening";
        this.skipReconnect = false;
        // emit `open`
        const openSubDestroy = (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "open", function () {
            self.onopen();
            fn && fn();
        });
        // emit `error`
        const errorSub = (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "error", (err) => {
            self.cleanup();
            self._readyState = "closed";
            this.emitReserved("error", err);
            if (fn) {
                fn(err);
            }
            else {
                // Only do this if there is no fn to handle the error
                self.maybeReconnectOnOpen();
            }
        });
        if (false !== this._timeout) {
            const timeout = this._timeout;
            if (timeout === 0) {
                openSubDestroy(); // prevents a race condition with the 'open' event
            }
            // set timer
            const timer = this.setTimeoutFn(() => {
                openSubDestroy();
                socket.close();
                // @ts-ignore
                socket.emit("error", new Error("timeout"));
            }, timeout);
            if (this.opts.autoUnref) {
                timer.unref();
            }
            this.subs.push(function subDestroy() {
                clearTimeout(timer);
            });
        }
        this.subs.push(openSubDestroy);
        this.subs.push(errorSub);
        return this;
    }
    /**
     * Alias for open()
     *
     * @return self
     * @public
     */
    connect(fn) {
        return this.open(fn);
    }
    /**
     * Called upon transport open.
     *
     * @private
     */
    onopen() {
        // clear old subs
        this.cleanup();
        // mark as open
        this._readyState = "open";
        this.emitReserved("open");
        // add new subs
        const socket = this.engine;
        this.subs.push((0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "ping", this.onping.bind(this)), (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "data", this.ondata.bind(this)), (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "error", this.onerror.bind(this)), (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "close", this.onclose.bind(this)), (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(this.decoder, "decoded", this.ondecoded.bind(this)));
    }
    /**
     * Called upon a ping.
     *
     * @private
     */
    onping() {
        this.emitReserved("ping");
    }
    /**
     * Called with data.
     *
     * @private
     */
    ondata(data) {
        try {
            this.decoder.add(data);
        }
        catch (e) {
            this.onclose("parse error", e);
        }
    }
    /**
     * Called when parser fully decodes a packet.
     *
     * @private
     */
    ondecoded(packet) {
        // the nextTick call prevents an exception in a user-provided event listener from triggering a disconnection due to a "parse error"
        (0,engine_io_client__WEBPACK_IMPORTED_MODULE_0__.nextTick)(() => {
            this.emitReserved("packet", packet);
        }, this.setTimeoutFn);
    }
    /**
     * Called upon socket error.
     *
     * @private
     */
    onerror(err) {
        this.emitReserved("error", err);
    }
    /**
     * Creates a new socket for the given `nsp`.
     *
     * @return {Socket}
     * @public
     */
    socket(nsp, opts) {
        let socket = this.nsps[nsp];
        if (!socket) {
            socket = new _socket_js__WEBPACK_IMPORTED_MODULE_1__.Socket(this, nsp, opts);
            this.nsps[nsp] = socket;
        }
        return socket;
    }
    /**
     * Called upon a socket close.
     *
     * @param socket
     * @private
     */
    _destroy(socket) {
        const nsps = Object.keys(this.nsps);
        for (const nsp of nsps) {
            const socket = this.nsps[nsp];
            if (socket.active) {
                return;
            }
        }
        this._close();
    }
    /**
     * Writes a packet.
     *
     * @param packet
     * @private
     */
    _packet(packet) {
        const encodedPackets = this.encoder.encode(packet);
        for (let i = 0; i < encodedPackets.length; i++) {
            this.engine.write(encodedPackets[i], packet.options);
        }
    }
    /**
     * Clean up transport subscriptions and packet buffer.
     *
     * @private
     */
    cleanup() {
        this.subs.forEach((subDestroy) => subDestroy());
        this.subs.length = 0;
        this.decoder.destroy();
    }
    /**
     * Close the current socket.
     *
     * @private
     */
    _close() {
        this.skipReconnect = true;
        this._reconnecting = false;
        this.onclose("forced close");
        if (this.engine)
            this.engine.close();
    }
    /**
     * Alias for close()
     *
     * @private
     */
    disconnect() {
        return this._close();
    }
    /**
     * Called upon engine close.
     *
     * @private
     */
    onclose(reason, description) {
        this.cleanup();
        this.backoff.reset();
        this._readyState = "closed";
        this.emitReserved("close", reason, description);
        if (this._reconnection && !this.skipReconnect) {
            this.reconnect();
        }
    }
    /**
     * Attempt a reconnection.
     *
     * @private
     */
    reconnect() {
        if (this._reconnecting || this.skipReconnect)
            return this;
        const self = this;
        if (this.backoff.attempts >= this._reconnectionAttempts) {
            this.backoff.reset();
            this.emitReserved("reconnect_failed");
            this._reconnecting = false;
        }
        else {
            const delay = this.backoff.duration();
            this._reconnecting = true;
            const timer = this.setTimeoutFn(() => {
                if (self.skipReconnect)
                    return;
                this.emitReserved("reconnect_attempt", self.backoff.attempts);
                // check again for the case socket closed in above events
                if (self.skipReconnect)
                    return;
                self.open((err) => {
                    if (err) {
                        self._reconnecting = false;
                        self.reconnect();
                        this.emitReserved("reconnect_error", err);
                    }
                    else {
                        self.onreconnect();
                    }
                });
            }, delay);
            if (this.opts.autoUnref) {
                timer.unref();
            }
            this.subs.push(function subDestroy() {
                clearTimeout(timer);
            });
        }
    }
    /**
     * Called upon successful reconnect.
     *
     * @private
     */
    onreconnect() {
        const attempt = this.backoff.attempts;
        this._reconnecting = false;
        this.backoff.reset();
        this.emitReserved("reconnect", attempt);
    }
}


/***/ }),

/***/ "./node_modules/socket.io-client/build/esm/on.js":
/*!*******************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/on.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "on": () => (/* binding */ on)
/* harmony export */ });
function on(obj, ev, fn) {
    obj.on(ev, fn);
    return function subDestroy() {
        obj.off(ev, fn);
    };
}


/***/ }),

/***/ "./node_modules/socket.io-client/build/esm/socket.js":
/*!***********************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/socket.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Socket": () => (/* binding */ Socket)
/* harmony export */ });
/* harmony import */ var socket_io_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! socket.io-parser */ "./node_modules/socket.io-parser/build/esm/index.js");
/* harmony import */ var _on_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./on.js */ "./node_modules/socket.io-client/build/esm/on.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/index.mjs");



/**
 * Internal events.
 * These events can't be emitted by the user.
 */
const RESERVED_EVENTS = Object.freeze({
    connect: 1,
    connect_error: 1,
    disconnect: 1,
    disconnecting: 1,
    // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
    newListener: 1,
    removeListener: 1,
});
/**
 * A Socket is the fundamental class for interacting with the server.
 *
 * A Socket belongs to a certain Namespace (by default /) and uses an underlying {@link Manager} to communicate.
 *
 * @example
 * const socket = io();
 *
 * socket.on("connect", () => {
 *   console.log("connected");
 * });
 *
 * // send an event to the server
 * socket.emit("foo", "bar");
 *
 * socket.on("foobar", () => {
 *   // an event was received from the server
 * });
 *
 * // upon disconnection
 * socket.on("disconnect", (reason) => {
 *   console.log(`disconnected due to ${reason}`);
 * });
 */
class Socket extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_2__.Emitter {
    /**
     * `Socket` constructor.
     */
    constructor(io, nsp, opts) {
        super();
        /**
         * Whether the socket is currently connected to the server.
         *
         * @example
         * const socket = io();
         *
         * socket.on("connect", () => {
         *   console.log(socket.connected); // true
         * });
         *
         * socket.on("disconnect", () => {
         *   console.log(socket.connected); // false
         * });
         */
        this.connected = false;
        /**
         * Buffer for packets received before the CONNECT packet
         */
        this.receiveBuffer = [];
        /**
         * Buffer for packets that will be sent once the socket is connected
         */
        this.sendBuffer = [];
        this.ids = 0;
        this.acks = {};
        this.flags = {};
        this.io = io;
        this.nsp = nsp;
        if (opts && opts.auth) {
            this.auth = opts.auth;
        }
        if (this.io._autoConnect)
            this.open();
    }
    /**
     * Whether the socket is currently disconnected
     *
     * @example
     * const socket = io();
     *
     * socket.on("connect", () => {
     *   console.log(socket.disconnected); // false
     * });
     *
     * socket.on("disconnect", () => {
     *   console.log(socket.disconnected); // true
     * });
     */
    get disconnected() {
        return !this.connected;
    }
    /**
     * Subscribe to open, close and packet events
     *
     * @private
     */
    subEvents() {
        if (this.subs)
            return;
        const io = this.io;
        this.subs = [
            (0,_on_js__WEBPACK_IMPORTED_MODULE_1__.on)(io, "open", this.onopen.bind(this)),
            (0,_on_js__WEBPACK_IMPORTED_MODULE_1__.on)(io, "packet", this.onpacket.bind(this)),
            (0,_on_js__WEBPACK_IMPORTED_MODULE_1__.on)(io, "error", this.onerror.bind(this)),
            (0,_on_js__WEBPACK_IMPORTED_MODULE_1__.on)(io, "close", this.onclose.bind(this)),
        ];
    }
    /**
     * Whether the Socket will try to reconnect when its Manager connects or reconnects.
     *
     * @example
     * const socket = io();
     *
     * console.log(socket.active); // true
     *
     * socket.on("disconnect", (reason) => {
     *   if (reason === "io server disconnect") {
     *     // the disconnection was initiated by the server, you need to manually reconnect
     *     console.log(socket.active); // false
     *   }
     *   // else the socket will automatically try to reconnect
     *   console.log(socket.active); // true
     * });
     */
    get active() {
        return !!this.subs;
    }
    /**
     * "Opens" the socket.
     *
     * @example
     * const socket = io({
     *   autoConnect: false
     * });
     *
     * socket.connect();
     */
    connect() {
        if (this.connected)
            return this;
        this.subEvents();
        if (!this.io["_reconnecting"])
            this.io.open(); // ensure open
        if ("open" === this.io._readyState)
            this.onopen();
        return this;
    }
    /**
     * Alias for {@link connect()}.
     */
    open() {
        return this.connect();
    }
    /**
     * Sends a `message` event.
     *
     * This method mimics the WebSocket.send() method.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
     *
     * @example
     * socket.send("hello");
     *
     * // this is equivalent to
     * socket.emit("message", "hello");
     *
     * @return self
     */
    send(...args) {
        args.unshift("message");
        this.emit.apply(this, args);
        return this;
    }
    /**
     * Override `emit`.
     * If the event is in `events`, it's emitted normally.
     *
     * @example
     * socket.emit("hello", "world");
     *
     * // all serializable datastructures are supported (no need to call JSON.stringify)
     * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
     *
     * // with an acknowledgement from the server
     * socket.emit("hello", "world", (val) => {
     *   // ...
     * });
     *
     * @return self
     */
    emit(ev, ...args) {
        if (RESERVED_EVENTS.hasOwnProperty(ev)) {
            throw new Error('"' + ev.toString() + '" is a reserved event name');
        }
        args.unshift(ev);
        const packet = {
            type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.EVENT,
            data: args,
        };
        packet.options = {};
        packet.options.compress = this.flags.compress !== false;
        // event ack callback
        if ("function" === typeof args[args.length - 1]) {
            const id = this.ids++;
            const ack = args.pop();
            this._registerAckCallback(id, ack);
            packet.id = id;
        }
        const isTransportWritable = this.io.engine &&
            this.io.engine.transport &&
            this.io.engine.transport.writable;
        const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
        if (discardPacket) {
        }
        else if (this.connected) {
            this.notifyOutgoingListeners(packet);
            this.packet(packet);
        }
        else {
            this.sendBuffer.push(packet);
        }
        this.flags = {};
        return this;
    }
    /**
     * @private
     */
    _registerAckCallback(id, ack) {
        const timeout = this.flags.timeout;
        if (timeout === undefined) {
            this.acks[id] = ack;
            return;
        }
        // @ts-ignore
        const timer = this.io.setTimeoutFn(() => {
            delete this.acks[id];
            for (let i = 0; i < this.sendBuffer.length; i++) {
                if (this.sendBuffer[i].id === id) {
                    this.sendBuffer.splice(i, 1);
                }
            }
            ack.call(this, new Error("operation has timed out"));
        }, timeout);
        this.acks[id] = (...args) => {
            // @ts-ignore
            this.io.clearTimeoutFn(timer);
            ack.apply(this, [null, ...args]);
        };
    }
    /**
     * Sends a packet.
     *
     * @param packet
     * @private
     */
    packet(packet) {
        packet.nsp = this.nsp;
        this.io._packet(packet);
    }
    /**
     * Called upon engine `open`.
     *
     * @private
     */
    onopen() {
        if (typeof this.auth == "function") {
            this.auth((data) => {
                this.packet({ type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.CONNECT, data });
            });
        }
        else {
            this.packet({ type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.CONNECT, data: this.auth });
        }
    }
    /**
     * Called upon engine or manager `error`.
     *
     * @param err
     * @private
     */
    onerror(err) {
        if (!this.connected) {
            this.emitReserved("connect_error", err);
        }
    }
    /**
     * Called upon engine `close`.
     *
     * @param reason
     * @param description
     * @private
     */
    onclose(reason, description) {
        this.connected = false;
        delete this.id;
        this.emitReserved("disconnect", reason, description);
    }
    /**
     * Called with socket packet.
     *
     * @param packet
     * @private
     */
    onpacket(packet) {
        const sameNamespace = packet.nsp === this.nsp;
        if (!sameNamespace)
            return;
        switch (packet.type) {
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.CONNECT:
                if (packet.data && packet.data.sid) {
                    const id = packet.data.sid;
                    this.onconnect(id);
                }
                else {
                    this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                }
                break;
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.EVENT:
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.BINARY_EVENT:
                this.onevent(packet);
                break;
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.ACK:
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.BINARY_ACK:
                this.onack(packet);
                break;
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.DISCONNECT:
                this.ondisconnect();
                break;
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.CONNECT_ERROR:
                this.destroy();
                const err = new Error(packet.data.message);
                // @ts-ignore
                err.data = packet.data.data;
                this.emitReserved("connect_error", err);
                break;
        }
    }
    /**
     * Called upon a server event.
     *
     * @param packet
     * @private
     */
    onevent(packet) {
        const args = packet.data || [];
        if (null != packet.id) {
            args.push(this.ack(packet.id));
        }
        if (this.connected) {
            this.emitEvent(args);
        }
        else {
            this.receiveBuffer.push(Object.freeze(args));
        }
    }
    emitEvent(args) {
        if (this._anyListeners && this._anyListeners.length) {
            const listeners = this._anyListeners.slice();
            for (const listener of listeners) {
                listener.apply(this, args);
            }
        }
        super.emit.apply(this, args);
    }
    /**
     * Produces an ack callback to emit with an event.
     *
     * @private
     */
    ack(id) {
        const self = this;
        let sent = false;
        return function (...args) {
            // prevent double callbacks
            if (sent)
                return;
            sent = true;
            self.packet({
                type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.ACK,
                id: id,
                data: args,
            });
        };
    }
    /**
     * Called upon a server acknowlegement.
     *
     * @param packet
     * @private
     */
    onack(packet) {
        const ack = this.acks[packet.id];
        if ("function" === typeof ack) {
            ack.apply(this, packet.data);
            delete this.acks[packet.id];
        }
        else {
        }
    }
    /**
     * Called upon server connect.
     *
     * @private
     */
    onconnect(id) {
        this.id = id;
        this.connected = true;
        this.emitBuffered();
        this.emitReserved("connect");
    }
    /**
     * Emit buffered events (received and emitted).
     *
     * @private
     */
    emitBuffered() {
        this.receiveBuffer.forEach((args) => this.emitEvent(args));
        this.receiveBuffer = [];
        this.sendBuffer.forEach((packet) => {
            this.notifyOutgoingListeners(packet);
            this.packet(packet);
        });
        this.sendBuffer = [];
    }
    /**
     * Called upon server disconnect.
     *
     * @private
     */
    ondisconnect() {
        this.destroy();
        this.onclose("io server disconnect");
    }
    /**
     * Called upon forced client/server side disconnections,
     * this method ensures the manager stops tracking us and
     * that reconnections don't get triggered for this.
     *
     * @private
     */
    destroy() {
        if (this.subs) {
            // clean subscriptions to avoid reconnections
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs = undefined;
        }
        this.io["_destroy"](this);
    }
    /**
     * Disconnects the socket manually. In that case, the socket will not try to reconnect.
     *
     * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
     *
     * @example
     * const socket = io();
     *
     * socket.on("disconnect", (reason) => {
     *   // console.log(reason); prints "io client disconnect"
     * });
     *
     * socket.disconnect();
     *
     * @return self
     */
    disconnect() {
        if (this.connected) {
            this.packet({ type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.DISCONNECT });
        }
        // remove socket from pool
        this.destroy();
        if (this.connected) {
            // fire events
            this.onclose("io client disconnect");
        }
        return this;
    }
    /**
     * Alias for {@link disconnect()}.
     *
     * @return self
     */
    close() {
        return this.disconnect();
    }
    /**
     * Sets the compress flag.
     *
     * @example
     * socket.compress(false).emit("hello");
     *
     * @param compress - if `true`, compresses the sending data
     * @return self
     */
    compress(compress) {
        this.flags.compress = compress;
        return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
     * ready to send messages.
     *
     * @example
     * socket.volatile.emit("hello"); // the server may or may not receive it
     *
     * @returns self
     */
    get volatile() {
        this.flags.volatile = true;
        return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
     * given number of milliseconds have elapsed without an acknowledgement from the server:
     *
     * @example
     * socket.timeout(5000).emit("my-event", (err) => {
     *   if (err) {
     *     // the server did not acknowledge the event in the given delay
     *   }
     * });
     *
     * @returns self
     */
    timeout(timeout) {
        this.flags.timeout = timeout;
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * @example
     * socket.onAny((event, ...args) => {
     *   console.log(`got ${event}`);
     * });
     *
     * @param listener
     */
    onAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.push(listener);
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * @example
     * socket.prependAny((event, ...args) => {
     *   console.log(`got event ${event}`);
     * });
     *
     * @param listener
     */
    prependAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.unshift(listener);
        return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`got event ${event}`);
     * }
     *
     * socket.onAny(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAny(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAny();
     *
     * @param listener
     */
    offAny(listener) {
        if (!this._anyListeners) {
            return this;
        }
        if (listener) {
            const listeners = this._anyListeners;
            for (let i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return this;
                }
            }
        }
        else {
            this._anyListeners = [];
        }
        return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */
    listenersAny() {
        return this._anyListeners || [];
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.onAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */
    onAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.push(listener);
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.prependAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */
    prependAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.unshift(listener);
        return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`sent event ${event}`);
     * }
     *
     * socket.onAnyOutgoing(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAnyOutgoing(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAnyOutgoing();
     *
     * @param [listener] - the catch-all listener (optional)
     */
    offAnyOutgoing(listener) {
        if (!this._anyOutgoingListeners) {
            return this;
        }
        if (listener) {
            const listeners = this._anyOutgoingListeners;
            for (let i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return this;
                }
            }
        }
        else {
            this._anyOutgoingListeners = [];
        }
        return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */
    listenersAnyOutgoing() {
        return this._anyOutgoingListeners || [];
    }
    /**
     * Notify the listeners for each packet sent
     *
     * @param packet
     *
     * @private
     */
    notifyOutgoingListeners(packet) {
        if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
            const listeners = this._anyOutgoingListeners.slice();
            for (const listener of listeners) {
                listener.apply(this, packet.data);
            }
        }
    }
}


/***/ }),

/***/ "./node_modules/socket.io-client/build/esm/url.js":
/*!********************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/url.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "url": () => (/* binding */ url)
/* harmony export */ });
/* harmony import */ var engine_io_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! engine.io-client */ "./node_modules/engine.io-client/build/esm/index.js");

/**
 * URL parser.
 *
 * @param uri - url
 * @param path - the request path of the connection
 * @param loc - An object meant to mimic window.location.
 *        Defaults to window.location.
 * @public
 */
function url(uri, path = "", loc) {
    let obj = uri;
    // default to window.location
    loc = loc || (typeof location !== "undefined" && location);
    if (null == uri)
        uri = loc.protocol + "//" + loc.host;
    // relative path support
    if (typeof uri === "string") {
        if ("/" === uri.charAt(0)) {
            if ("/" === uri.charAt(1)) {
                uri = loc.protocol + uri;
            }
            else {
                uri = loc.host + uri;
            }
        }
        if (!/^(https?|wss?):\/\//.test(uri)) {
            if ("undefined" !== typeof loc) {
                uri = loc.protocol + "//" + uri;
            }
            else {
                uri = "https://" + uri;
            }
        }
        // parse
        obj = (0,engine_io_client__WEBPACK_IMPORTED_MODULE_0__.parse)(uri);
    }
    // make sure we treat `localhost:80` and `localhost` equally
    if (!obj.port) {
        if (/^(http|ws)$/.test(obj.protocol)) {
            obj.port = "80";
        }
        else if (/^(http|ws)s$/.test(obj.protocol)) {
            obj.port = "443";
        }
    }
    obj.path = obj.path || "/";
    const ipv6 = obj.host.indexOf(":") !== -1;
    const host = ipv6 ? "[" + obj.host + "]" : obj.host;
    // define unique id
    obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
    // define href
    obj.href =
        obj.protocol +
            "://" +
            host +
            (loc && loc.port === obj.port ? "" : ":" + obj.port);
    return obj;
}


/***/ }),

/***/ "./node_modules/socket.io-parser/build/esm/binary.js":
/*!***********************************************************!*\
  !*** ./node_modules/socket.io-parser/build/esm/binary.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "deconstructPacket": () => (/* binding */ deconstructPacket),
/* harmony export */   "reconstructPacket": () => (/* binding */ reconstructPacket)
/* harmony export */ });
/* harmony import */ var _is_binary_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is-binary.js */ "./node_modules/socket.io-parser/build/esm/is-binary.js");

/**
 * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @public
 */
function deconstructPacket(packet) {
    const buffers = [];
    const packetData = packet.data;
    const pack = packet;
    pack.data = _deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length; // number of binary 'attachments'
    return { packet: pack, buffers: buffers };
}
function _deconstructPacket(data, buffers) {
    if (!data)
        return data;
    if ((0,_is_binary_js__WEBPACK_IMPORTED_MODULE_0__.isBinary)(data)) {
        const placeholder = { _placeholder: true, num: buffers.length };
        buffers.push(data);
        return placeholder;
    }
    else if (Array.isArray(data)) {
        const newData = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            newData[i] = _deconstructPacket(data[i], buffers);
        }
        return newData;
    }
    else if (typeof data === "object" && !(data instanceof Date)) {
        const newData = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newData[key] = _deconstructPacket(data[key], buffers);
            }
        }
        return newData;
    }
    return data;
}
/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @public
 */
function reconstructPacket(packet, buffers) {
    packet.data = _reconstructPacket(packet.data, buffers);
    delete packet.attachments; // no longer useful
    return packet;
}
function _reconstructPacket(data, buffers) {
    if (!data)
        return data;
    if (data && data._placeholder === true) {
        const isIndexValid = typeof data.num === "number" &&
            data.num >= 0 &&
            data.num < buffers.length;
        if (isIndexValid) {
            return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        }
        else {
            throw new Error("illegal attachments");
        }
    }
    else if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            data[i] = _reconstructPacket(data[i], buffers);
        }
    }
    else if (typeof data === "object") {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                data[key] = _reconstructPacket(data[key], buffers);
            }
        }
    }
    return data;
}


/***/ }),

/***/ "./node_modules/socket.io-parser/build/esm/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/socket.io-parser/build/esm/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Decoder": () => (/* binding */ Decoder),
/* harmony export */   "Encoder": () => (/* binding */ Encoder),
/* harmony export */   "PacketType": () => (/* binding */ PacketType),
/* harmony export */   "protocol": () => (/* binding */ protocol)
/* harmony export */ });
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/index.mjs");
/* harmony import */ var _binary_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./binary.js */ "./node_modules/socket.io-parser/build/esm/binary.js");
/* harmony import */ var _is_binary_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is-binary.js */ "./node_modules/socket.io-parser/build/esm/is-binary.js");



/**
 * These strings must not be used as event names, as they have a special meaning.
 */
const RESERVED_EVENTS = [
    "connect",
    "connect_error",
    "disconnect",
    "disconnecting",
    "newListener",
    "removeListener", // used by the Node.js EventEmitter
];
/**
 * Protocol version.
 *
 * @public
 */
const protocol = 5;
var PacketType;
(function (PacketType) {
    PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
    PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
    PacketType[PacketType["EVENT"] = 2] = "EVENT";
    PacketType[PacketType["ACK"] = 3] = "ACK";
    PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
    PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
    PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
})(PacketType || (PacketType = {}));
/**
 * A socket.io Encoder instance
 */
class Encoder {
    /**
     * Encoder constructor
     *
     * @param {function} replacer - custom replacer to pass down to JSON.parse
     */
    constructor(replacer) {
        this.replacer = replacer;
    }
    /**
     * Encode a packet as a single string if non-binary, or as a
     * buffer sequence, depending on packet type.
     *
     * @param {Object} obj - packet object
     */
    encode(obj) {
        if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
            if ((0,_is_binary_js__WEBPACK_IMPORTED_MODULE_2__.hasBinary)(obj)) {
                return this.encodeAsBinary({
                    type: obj.type === PacketType.EVENT
                        ? PacketType.BINARY_EVENT
                        : PacketType.BINARY_ACK,
                    nsp: obj.nsp,
                    data: obj.data,
                    id: obj.id,
                });
            }
        }
        return [this.encodeAsString(obj)];
    }
    /**
     * Encode packet as string.
     */
    encodeAsString(obj) {
        // first is type
        let str = "" + obj.type;
        // attachments if we have them
        if (obj.type === PacketType.BINARY_EVENT ||
            obj.type === PacketType.BINARY_ACK) {
            str += obj.attachments + "-";
        }
        // if we have a namespace other than `/`
        // we append it followed by a comma `,`
        if (obj.nsp && "/" !== obj.nsp) {
            str += obj.nsp + ",";
        }
        // immediately followed by the id
        if (null != obj.id) {
            str += obj.id;
        }
        // json data
        if (null != obj.data) {
            str += JSON.stringify(obj.data, this.replacer);
        }
        return str;
    }
    /**
     * Encode packet as 'buffer sequence' by removing blobs, and
     * deconstructing packet into object with placeholders and
     * a list of buffers.
     */
    encodeAsBinary(obj) {
        const deconstruction = (0,_binary_js__WEBPACK_IMPORTED_MODULE_1__.deconstructPacket)(obj);
        const pack = this.encodeAsString(deconstruction.packet);
        const buffers = deconstruction.buffers;
        buffers.unshift(pack); // add packet info to beginning of data list
        return buffers; // write all the buffers
    }
}
// see https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
function isObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}
/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 */
class Decoder extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_0__.Emitter {
    /**
     * Decoder constructor
     *
     * @param {function} reviver - custom reviver to pass down to JSON.stringify
     */
    constructor(reviver) {
        super();
        this.reviver = reviver;
    }
    /**
     * Decodes an encoded packet string into packet JSON.
     *
     * @param {String} obj - encoded packet
     */
    add(obj) {
        let packet;
        if (typeof obj === "string") {
            if (this.reconstructor) {
                throw new Error("got plaintext data when reconstructing a packet");
            }
            packet = this.decodeString(obj);
            const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
            if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
                packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
                // binary packet's json
                this.reconstructor = new BinaryReconstructor(packet);
                // no attachments, labeled binary but no binary data to follow
                if (packet.attachments === 0) {
                    super.emitReserved("decoded", packet);
                }
            }
            else {
                // non-binary full packet
                super.emitReserved("decoded", packet);
            }
        }
        else if ((0,_is_binary_js__WEBPACK_IMPORTED_MODULE_2__.isBinary)(obj) || obj.base64) {
            // raw binary data
            if (!this.reconstructor) {
                throw new Error("got binary data when not reconstructing a packet");
            }
            else {
                packet = this.reconstructor.takeBinaryData(obj);
                if (packet) {
                    // received final buffer
                    this.reconstructor = null;
                    super.emitReserved("decoded", packet);
                }
            }
        }
        else {
            throw new Error("Unknown type: " + obj);
        }
    }
    /**
     * Decode a packet String (JSON data)
     *
     * @param {String} str
     * @return {Object} packet
     */
    decodeString(str) {
        let i = 0;
        // look up type
        const p = {
            type: Number(str.charAt(0)),
        };
        if (PacketType[p.type] === undefined) {
            throw new Error("unknown packet type " + p.type);
        }
        // look up attachments if type binary
        if (p.type === PacketType.BINARY_EVENT ||
            p.type === PacketType.BINARY_ACK) {
            const start = i + 1;
            while (str.charAt(++i) !== "-" && i != str.length) { }
            const buf = str.substring(start, i);
            if (buf != Number(buf) || str.charAt(i) !== "-") {
                throw new Error("Illegal attachments");
            }
            p.attachments = Number(buf);
        }
        // look up namespace (if any)
        if ("/" === str.charAt(i + 1)) {
            const start = i + 1;
            while (++i) {
                const c = str.charAt(i);
                if ("," === c)
                    break;
                if (i === str.length)
                    break;
            }
            p.nsp = str.substring(start, i);
        }
        else {
            p.nsp = "/";
        }
        // look up id
        const next = str.charAt(i + 1);
        if ("" !== next && Number(next) == next) {
            const start = i + 1;
            while (++i) {
                const c = str.charAt(i);
                if (null == c || Number(c) != c) {
                    --i;
                    break;
                }
                if (i === str.length)
                    break;
            }
            p.id = Number(str.substring(start, i + 1));
        }
        // look up json data
        if (str.charAt(++i)) {
            const payload = this.tryParse(str.substr(i));
            if (Decoder.isPayloadValid(p.type, payload)) {
                p.data = payload;
            }
            else {
                throw new Error("invalid payload");
            }
        }
        return p;
    }
    tryParse(str) {
        try {
            return JSON.parse(str, this.reviver);
        }
        catch (e) {
            return false;
        }
    }
    static isPayloadValid(type, payload) {
        switch (type) {
            case PacketType.CONNECT:
                return isObject(payload);
            case PacketType.DISCONNECT:
                return payload === undefined;
            case PacketType.CONNECT_ERROR:
                return typeof payload === "string" || isObject(payload);
            case PacketType.EVENT:
            case PacketType.BINARY_EVENT:
                return (Array.isArray(payload) &&
                    (typeof payload[0] === "number" ||
                        (typeof payload[0] === "string" &&
                            RESERVED_EVENTS.indexOf(payload[0]) === -1)));
            case PacketType.ACK:
            case PacketType.BINARY_ACK:
                return Array.isArray(payload);
        }
    }
    /**
     * Deallocates a parser's resources
     */
    destroy() {
        if (this.reconstructor) {
            this.reconstructor.finishedReconstruction();
            this.reconstructor = null;
        }
    }
}
/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 */
class BinaryReconstructor {
    constructor(packet) {
        this.packet = packet;
        this.buffers = [];
        this.reconPack = packet;
    }
    /**
     * Method to be called when binary data received from connection
     * after a BINARY_EVENT packet.
     *
     * @param {Buffer | ArrayBuffer} binData - the raw binary data received
     * @return {null | Object} returns null if more binary data is expected or
     *   a reconstructed packet object if all buffers have been received.
     */
    takeBinaryData(binData) {
        this.buffers.push(binData);
        if (this.buffers.length === this.reconPack.attachments) {
            // done with buffer list
            const packet = (0,_binary_js__WEBPACK_IMPORTED_MODULE_1__.reconstructPacket)(this.reconPack, this.buffers);
            this.finishedReconstruction();
            return packet;
        }
        return null;
    }
    /**
     * Cleans up binary packet reconstruction variables.
     */
    finishedReconstruction() {
        this.reconPack = null;
        this.buffers = [];
    }
}


/***/ }),

/***/ "./node_modules/socket.io-parser/build/esm/is-binary.js":
/*!**************************************************************!*\
  !*** ./node_modules/socket.io-parser/build/esm/is-binary.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hasBinary": () => (/* binding */ hasBinary),
/* harmony export */   "isBinary": () => (/* binding */ isBinary)
/* harmony export */ });
const withNativeArrayBuffer = typeof ArrayBuffer === "function";
const isView = (obj) => {
    return typeof ArrayBuffer.isView === "function"
        ? ArrayBuffer.isView(obj)
        : obj.buffer instanceof ArrayBuffer;
};
const toString = Object.prototype.toString;
const withNativeBlob = typeof Blob === "function" ||
    (typeof Blob !== "undefined" &&
        toString.call(Blob) === "[object BlobConstructor]");
const withNativeFile = typeof File === "function" ||
    (typeof File !== "undefined" &&
        toString.call(File) === "[object FileConstructor]");
/**
 * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
 *
 * @private
 */
function isBinary(obj) {
    return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
        (withNativeBlob && obj instanceof Blob) ||
        (withNativeFile && obj instanceof File));
}
function hasBinary(obj, toJSON) {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    if (Array.isArray(obj)) {
        for (let i = 0, l = obj.length; i < l; i++) {
            if (hasBinary(obj[i])) {
                return true;
            }
        }
        return false;
    }
    if (isBinary(obj)) {
        return true;
    }
    if (obj.toJSON &&
        typeof obj.toJSON === "function" &&
        arguments.length === 1) {
        return hasBinary(obj.toJSON(), true);
    }
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
            return true;
        }
    }
    return false;
}


/***/ }),

/***/ "./src/base/AnimationEventImageObj.js":
/*!********************************************!*\
  !*** ./src/base/AnimationEventImageObj.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AnimationEventImageObj": () => (/* binding */ AnimationEventImageObj)
/* harmony export */ });
class AnimationEventImageObj {
    #eventName;
    #animationSpriteIndexes;
    #currentSprite;
    #isActive;
    
    constructor(eventName, animationSpriteIndexes, currentSprite, isActive = false) {
        this.#eventName = eventName;
        this.#animationSpriteIndexes = animationSpriteIndexes;
        this.#currentSprite = currentSprite ? currentSprite : animationSpriteIndexes[0];
        this.#isActive = isActive;
    }

    get isActive() {
        return this.#isActive;
    }

    set isActive(value) {
        this.#isActive = value;
    }

    get currentSprite() {
        return this.#currentSprite;
    }

    get isLastSprite() {
        return this.#animationSpriteIndexes[(this.#animationSpriteIndexes.length - 1)] === this.#currentSprite;
    }

    iterateSprite() {
        if (!this.isLastSprite) {
            this.#currentSprite = this.#currentSprite + 1;
        } else {
            this.#currentSprite = this.#animationSpriteIndexes[0];
            this.#isActive = false;
        }
    }

    set currentSprite(value) {
        this.#currentSprite = value;
    }

    activateAnimation = () => {
        this.isActive = true;
    };
}

/***/ }),

/***/ "./src/base/CanvasView.js":
/*!********************************!*\
  !*** ./src/base/CanvasView.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CanvasView": () => (/* binding */ CanvasView)
/* harmony export */ });
/* harmony import */ var _RenderLayer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RenderLayer.js */ "./src/base/RenderLayer.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _WebGlInterface_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./WebGlInterface.js */ "./src/base/WebGlInterface.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _ScreenPageData_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ScreenPageData.js */ "./src/base/ScreenPageData.js");
/* harmony import */ var assetsm__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! assetsm */ "./node_modules/assetsm/dist/assetsm.min.js");








//import { calculateBufferData } from "../wa/release.js";


const INDEX_TOP_LINE = 0,
    INDEX_RIGHT_LINE = 1,
    INDEX_BOTTOM_LINE = 2,
    INDEX_LEFT_LINE = 3;

const INDEX_X1 = 0,
    INDEX_Y1 = 1,
    INDEX_X2 = 2,
    INDEX_Y2 = 3;

/**
 * Canvas view represents each canvas on the page<br> 
 * Should be created via ScreenPage.createCanvasView(),<br>
 * Contains draw logic and holds DrawObjects and Tile
 * Can retrieved by ScreenPage.getView()
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
class CanvasView {
    /**
     * @type {HTMLCanvasElement}
     */
    #canvas;
    /**
     * @type {boolean}
     */
    #isCleared;
    /**
     * @type {boolean}
     */
    #isOffsetTurnedOff
    /**
     * @type {boolean}
     */
    #isWorldBoundariesEnabled;

    #drawContext;
    #webGlInterface;

    /**
     * @type {SystemSettings}
     */
    #systemSettings;
    /**
     * @type {ScreenPageData}
     */
    #screenPageData;
    /**
     * @type {AssetsManager}
     */
    #loader;

    /**
     * @type {Array<DrawShapeObject>}
     */
    #renderObjects;
    /**
     * @type {Array<RenderLayer>}
     */
    #renderLayers;
    
    /**
     * @type {Array<Promise>}
     */
    #bindTileMapPromises;
    /**
     * @type {Array<Promise>}
     */
    #bindRenderObjectPromises;

    constructor(name, systemSettings, screenPageData, loader, isOffsetTurnedOff) {
        this.#canvas = document.createElement("canvas");
        this.#canvas.id = name;
        this.#canvas.style.position = "absolute";
        this.#isCleared = false;
        this.#isOffsetTurnedOff = isOffsetTurnedOff;

        this.#screenPageData = screenPageData;
        this.#systemSettings = systemSettings;
        this.#loader = loader;
        this.#renderObjects = [];
        this.#renderLayers = [];

        this.#bindTileMapPromises = [];
        this.#bindRenderObjectPromises = [];
        this.bindRenderLayerMethod = this.systemSettings.gameOptions.optimization === _constants_js__WEBPACK_IMPORTED_MODULE_3__.CONST.OPTIMIZATION.WEB_ASSEMBLY.ASSEMBLY_SCRIPT ? this._bindRenderLayerWM : this._bindRenderLayer;
    }

    get screenPageData() {
        return this.#screenPageData;
    }

    get systemSettings() {
        return this.#systemSettings;
    }

    get loader() {
        return this.#loader;
    }

    /**
     * a getter to retrieve all attached renderObjects
     */
    get renderObjects() {
        return this.#renderObjects;
    }

    get canvas() {
        return this.#canvas;
    }

    /**
     * Retrieve specific objects instances
     * @param {DrawShapeObject} instance - drawObjectInstance to retrieve 
     * @returns {Array<DrawShapeObject>}
     */
    getObjectsByInstance(instance) {
        return this.#renderObjects.filter((object) => object instanceof instance);
    }

    get _renderLayers() {
        return this.#renderLayers;
    }

    set _renderObject(object) {
        this.#renderObjects.push(object);
    } 

    set _renderObjects(objects) {
        this.#renderObjects = objects;
    } 

    set _renderLayers(layer) {
        this.#renderLayers.push(layer);
    }

    set _isCleared(value) {
        this.#isCleared = value;
    }

    get _isCleared() {
        return this.#isCleared;
    }

    /**
     * @ignore
     */
    _enableMapBoundaries() {
        this.#isWorldBoundariesEnabled = true;
    }

    _initiateWebGlContext(debug = false) {
        const webgl = this.#canvas.getContext("webgl");
        if (webgl) {
            this.#drawContext = webgl;
            this.#webGlInterface = new _WebGlInterface_js__WEBPACK_IMPORTED_MODULE_4__.WebGlInterface(this.#drawContext, debug);
            
            return Promise.all([this.#webGlInterface._initiateImagesDrawProgram(),
                this.#webGlInterface._initPrimitivesDrawProgram()]);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_3__.ERROR_CODES.WEBGL_ERROR, "webgl is not supported in this browser");
        } 
    }

    _clearWebGlContext() {
        this.#webGlInterface._clearView();
        this.#isCleared = true;
    }

    _executeTileImagesDraw() {
        return this.#webGlInterface._executeTileImagesDraw();
    }

    _setCanvasSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.#webGlInterface) {
            this.#webGlInterface._fixCanvasSize(width, height);
        }
    }

    _sortRenderObjectsByZIndex() {
        this.#renderObjects = this.#renderObjects.sort((obj1, obj2) => obj2.zIndex - obj1.zIndex);
    }

    _prepareBindRenderLayerPromises() {
        for (const layer of this.#renderLayers) {
            this.#bindTileMapPromises.push(this.bindRenderLayerMethod(layer).catch((err) => {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_3__.ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
            }));
        }
    }

    _executeBindRenderLayerPromises() {
        return Promise.allSettled(this.#bindTileMapPromises).then((bindResults) => {
            this.#clearTileMapPromises();
            return Promise.resolve(bindResults);
        });
    }

    _bindRenderLayerWM(renderLayer) {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.#getImage(tileset.data.name)),
                layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                setBoundaries = false;//, //renderLayer.setBoundaries,
                //[ worldW, worldH ] = this.screenPageData.worldDimensions,
                //[ canvasW, canvasH ] = this.screenPageData.drawDimensions,
                //[ xOffset, yOffset ] = this.screenPageData.worldOffset;
                
            if (!layerData) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_3__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            for (let i = 0; i <= tilesets.length - 1; i++) {
                const tileset = tilesets[i].data,
                    //tilesetImages = this.loader.getTilesetImageArray(tileset.name),
                    tilewidth = tileset.tilewidth,
                    tileheight = tileset.tileheight,
                    //atlasRows = tileset.imageheight / tileheight,
                    atlasColumns = tileset.imagewidth / tilewidth,
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    //visibleCols = Math.ceil(canvasW / tilewidth),
                    //visibleRows = Math.ceil(canvasH / tileheight),
                    //offsetCols = layerCols - visibleCols,
                    //offsetRows = layerRows - visibleRows,
                    atlasImage = tilesetImages[i],
                    atlasWidth = atlasImage.width,
                    atlasHeight = atlasImage.height;
                    
                const [verticesBufferData, texturesBufferData] = calculateBufferData(layerRows, layerCols, layerData.data, dtwidth, dtheight, tilewidth, tileheight, atlasColumns, atlasWidth, atlasHeight, setBoundaries);
                
                this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tileset.name);
                if (setBoundaries) {
                    this.screenPageData._mergeBoundaries();
                    renderLayer.setBoundaries = false;
                }
                resolve();
            }
        });
    }

    _bindRenderLayer(renderLayer) {
        return new Promise((resolve, reject) => {
            const tilemap = this.loader.getTileMap(renderLayer.tileMapKey),
                tilesets = tilemap.tilesets,
                tilesetImages = tilesets.map((tileset) => this.#getImage(tileset.data.name)),
                layerData = tilemap.layers.find((layer) => layer.name === renderLayer.layerKey),
                { tileheight:dtheight, tilewidth:dtwidth } = tilemap,
                tilewidth = dtwidth,
                tileheight = dtheight,
                setBoundaries = renderLayer.setBoundaries,
                [ settingsWorldWidth, settingsWorldHeight ] = this.screenPageData.worldDimensions,
                //[ canvasW, canvasH ] = this.screenPageData.drawDimensions,
                [ xOffset, yOffset ] = this.#isOffsetTurnedOff === true ? [0,0] : this.screenPageData.worldOffset;
                
            let boundariesRowsIndexes = new Map(),
                boundaries = [];

            if (!layerData) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_3__.WARNING_CODES.NOT_FOUND, "check tilemap and layers name");
                reject();
            }
            
            for (let i = 0; i < tilesets.length; i++) {
                const tileset = tilesets[i].data,
                    firstgid = tilesets[i].firstgid,
                    nextTileset = tilesets[i + 1],
                    nextgid = nextTileset ? nextTileset.firstgid : null,
                    tilesetwidth = tileset.tilewidth,
                    tilesetheight = tileset.tileheight,
                    atlasImage = tilesetImages[i],
                    //atlasWidth = atlasImage.width,
                    //atlasHeight = atlasImage.height,
                    atlasWidth = tileset.imagewidth,
                    atlasHeight = tileset.imageheight,
                    //atlasRows = atlasHeight / tileheight,
                    atlasColumns = Math.floor(atlasWidth / tilesetwidth),
                    layerCols = layerData.width,
                    layerRows = layerData.height,
                    worldW = tilewidth * layerCols,
                    worldH = tileheight * layerRows,
                    moduloTop = yOffset % tileheight,
                    moduleLeft = xOffset % tilewidth,
                    skipRowsTop = yOffset !== 0 ? Math.floor(yOffset / tileheight) : 0,
                    skipColsLeft = xOffset !== 0 ? Math.floor(xOffset / tilewidth) : 0,
                    skipColsRight = Math.floor((worldW - (xOffset + worldW)) / tilewidth),
                    endColLeft = Math.ceil((xOffset + worldW ) / tilewidth),
                    endRowTop = Math.ceil((yOffset + worldH ) / tileheight),
                    
                    verticesBufferData = [],
                    texturesBufferData = [];
                if (setBoundaries) {
                    if (worldW !== settingsWorldWidth || worldH !== settingsWorldHeight) {
                        (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_3__.WARNING_CODES.UNEXPECTED_WORLD_SIZE, " World size from tilemap is different than settings one, fixing...");
                        this.screenPageData._setWorldDimensions(worldW, worldH);
                    }
                    
                    // boundaries cleanups every draw circle, we need to set world boundaries again
                    if (this.#isWorldBoundariesEnabled) {
                        this.screenPageData._setMapBoundaries();
                    }
                }

                let mapIndex = skipRowsTop * layerCols;

                const rowsEnd = endRowTop - skipRowsTop,
                    colsEnd = endColLeft - skipColsLeft;

                for (let row = 0; row < rowsEnd; row++) {
                    mapIndex += skipColsLeft;
                    let currentRowIndexes = new Map();

                    for (let col = 0; col < colsEnd; col++) {
                        let tile = layerData.data[mapIndex];
                        //if (tile !== 0)
                        if (tile >= firstgid && (nextgid === null || tile < nextgid)) {
                            const mapPosX = col * dtwidth - moduleLeft,
                                mapPosY = row * dtheight - moduloTop;

                            tile -= firstgid;
                            const atlasPosX = tile % atlasColumns * tilesetwidth,
                                atlasPosY = Math.floor(tile / atlasColumns) * tilesetheight,
                                vecX1 = mapPosX,
                                vecY1 = mapPosY,
                                vecX2 = mapPosX + tilesetwidth,
                                vecY2 = mapPosY + tilesetheight,
                                texX1 = 1 / atlasWidth * atlasPosX,
                                texY1 = 1 / atlasHeight * atlasPosY,
                                texX2 = texX1 + (1 / atlasWidth * tilesetwidth),
                                texY2 = texY1 + (1 / atlasHeight * tilesetheight);
                            verticesBufferData.push(
                                vecX1, vecY1,
                                vecX2, vecY1,
                                vecX1, vecY2,
                                vecX1, vecY2,
                                vecX2, vecY1,
                                vecX2, vecY2);
                            texturesBufferData.push(
                                texX1, texY1,
                                texX2, texY1,
                                texX1, texY2,
                                texX1, texY2,
                                texX2, texY1,
                                texX2, texY2
                            );
                            
                            if (setBoundaries) {
                                let rightLine = [ mapPosX + tilesetwidth, mapPosY, mapPosX + tilesetwidth, mapPosY + tilesetheight ],
                                    bottomLine = [ mapPosX + tilesetwidth, mapPosY + tilesetheight, mapPosX, mapPosY + tilesetheight ],
                                    topLine = [ mapPosX, mapPosY, mapPosX + tilesetwidth, mapPosY],
                                    leftLine = [ mapPosX, mapPosY + tilesetheight, mapPosX, mapPosY ],
                                    currentAddedCellIndexes = [null, null, null, null];
                                
                                const topRow = row !== 0 ? boundariesRowsIndexes.get(row - 1) : undefined;
                                if (topRow ) {
                                    const topCellIndexes = topRow.get(col);
                                    if (topCellIndexes) {
                                        //remove double lines from top
                                        const bottomTopCellIndex = topCellIndexes[INDEX_BOTTOM_LINE],
                                            bottomTopCell = boundaries[bottomTopCellIndex];
                                        if (bottomTopCell) {
                                            const bottomTopCellX1 = bottomTopCell[INDEX_X1],
                                                bottomTopCellY1 = bottomTopCell[INDEX_Y1],
                                                bottomTopCellX2 = bottomTopCell[INDEX_X2],
                                                bottomTopCellY2 = bottomTopCell[INDEX_Y2],
                                                topX1 = topLine[INDEX_X1],
                                                topY1 = topLine[INDEX_Y1],
                                                topX2 = topLine[INDEX_X2],
                                                topY2 = topLine[INDEX_Y2];
                                            
                                            if (topX1 === bottomTopCellX2 && topY1 === bottomTopCellY2 &&
                                                topX2 === bottomTopCellX1 && topY2 === bottomTopCellY1) {
                                                boundaries[bottomTopCellIndex] = undefined;
                                                topLine = undefined;
                                            }
                                        }

                                        // merge line from top right
                                        const rightTopCellIndex = topCellIndexes[INDEX_RIGHT_LINE],
                                            rightTopCell = boundaries[rightTopCellIndex];
                                        if (rightTopCell) {
                                            const rightTopCellX1 = rightTopCell[INDEX_X1],
                                                rightTopCellY1 = rightTopCell[INDEX_Y1],
                                                rightTopCellX2 = rightTopCell[INDEX_X2],
                                                rightX1 = rightLine[INDEX_X1],
                                                rightX2 = rightLine[INDEX_X2];
                                            if (rightTopCellX1 === rightX2 && rightTopCellX2 === rightX1) {
                                                boundaries[rightTopCellIndex] = undefined;
                                                rightLine[INDEX_X1] = rightTopCellX1;
                                                rightLine[INDEX_Y1] = rightTopCellY1;
                                            }
                                        }
                                        // merge line from top left
                                        const leftTopCellIndex = topCellIndexes[INDEX_LEFT_LINE],
                                            leftTopCell = boundaries[leftTopCellIndex];
                                        if (leftTopCell) {
                                            const leftTopCellX1 = leftTopCell[INDEX_X1],
                                                leftTopCellX2 = leftTopCell[INDEX_X2],
                                                leftTopCellY2 = leftTopCell[INDEX_Y2],
                                                leftX1 = leftLine[INDEX_X1],
                                                leftX2 = leftLine[INDEX_X2];
                                            if (leftTopCellX1 === leftX2 && leftTopCellX2 === leftX1) {
                                                boundaries[leftTopCellIndex] = undefined;
                                                leftLine[INDEX_X2] = leftTopCellX2;
                                                leftLine[INDEX_Y2] = leftTopCellY2;
                                            }
                                        }
                                    }
                                }
                                const leftCellIndexes = col !== 0 ? currentRowIndexes.get(col - 1) : undefined;
                                if (leftCellIndexes) {

                                    //remove double lines from left
                                    const rightLeftCellIndex = leftCellIndexes[INDEX_RIGHT_LINE],
                                        rightLeftCell = boundaries[rightLeftCellIndex],
                                        rightLeftCellX1 = rightLeftCell[INDEX_X1],
                                        rightLeftCellY1 = rightLeftCell[INDEX_Y1],
                                        rightLeftCellX2 = rightLeftCell[INDEX_X2],
                                        rightLeftCellY2 = rightLeftCell[INDEX_Y2],
                                        leftX1 = leftLine[INDEX_X1],
                                        leftY1 = leftLine[INDEX_Y1],
                                        leftX2 = leftLine[INDEX_X2],
                                        leftY2 = leftLine[INDEX_Y2];

                                    if (leftX1 === rightLeftCellX2 && leftY1 === rightLeftCellY2 &&
                                        leftX2 === rightLeftCellX1 && leftY2 === rightLeftCellY1) {
                                        boundaries[rightLeftCellIndex] = undefined;
                                        leftLine = undefined;
                                    }

                                    //merge long lines from left top
                                    const topLeftCellIndex = leftCellIndexes[INDEX_TOP_LINE],
                                        topLeftCell = boundaries[topLeftCellIndex];
                                    if (topLeftCell && topLine) {
                                        const topLeftCellX1 = topLeftCell[INDEX_X1],
                                            topLeftCellY1 = topLeftCell[INDEX_Y1],
                                            topLeftCellY2 = topLeftCell[INDEX_Y2],
                                            topY1 = topLine[INDEX_Y1],
                                            topY2 = topLine[INDEX_Y2];
                                        if (topLeftCellY1 === topY2 && topLeftCellY2 === topY1 ) {
                                            boundaries[topLeftCellIndex] = undefined;
                                            topLine[INDEX_X1] = topLeftCellX1;
                                            topLine[INDEX_Y1] = topLeftCellY1;
                                        }
                                    }

                                    // merge long lines from left bottom
                                    const bottomLeftCellIndex = leftCellIndexes[INDEX_BOTTOM_LINE],
                                        bottomLeftCell = boundaries[bottomLeftCellIndex];
                                    if (bottomLeftCell) {
                                        const bottomLeftCellY1 = bottomLeftCell[INDEX_Y1],
                                            bottomLeftCellX2 = bottomLeftCell[INDEX_X2],
                                            bottomLeftCellY2 = bottomLeftCell[INDEX_Y2],
                                            bottomY1 = bottomLine[INDEX_Y1],
                                            bottomY2 = bottomLine[INDEX_Y2];
                                        if (bottomLeftCellY1 === bottomY2 && bottomLeftCellY2 === bottomY1 ) {
                                            boundaries[bottomLeftCellIndex] = undefined;
                                            //opposite direction
                                            bottomLine[INDEX_X2] = bottomLeftCellX2;
                                            bottomLine[INDEX_Y2] = bottomLeftCellY2;
                                        }
                                    }

                                }

                                if (topLine) {
                                    boundaries.push(topLine);
                                    currentAddedCellIndexes[INDEX_TOP_LINE] = boundaries.length - 1;
                                }
                                boundaries.push(rightLine);
                                currentAddedCellIndexes[INDEX_RIGHT_LINE] = boundaries.length - 1;
                                boundaries.push(bottomLine);
                                currentAddedCellIndexes[INDEX_BOTTOM_LINE] = boundaries.length - 1;
                                if (leftLine) {
                                    boundaries.push(leftLine);
                                    currentAddedCellIndexes[INDEX_LEFT_LINE] = boundaries.length - 1;
                                }
                                //save values indexes cols info
                                currentRowIndexes.set(col, currentAddedCellIndexes);
                            }

                        }
                        mapIndex++;
                    }
                    if (currentRowIndexes.size > 0) {
                        //save values indexes rows info
                        boundariesRowsIndexes.set(row, currentRowIndexes);
                    }
                    mapIndex += skipColsRight;
                }
                if (verticesBufferData.length > 0 && texturesBufferData.length > 0) {
                    this.#bindTileImages(verticesBufferData, texturesBufferData, atlasImage, tileset.name);
                }
            }
            
            if (setBoundaries) {
                const filtered = boundaries.filter(array => array);
                this.screenPageData._addBoundariesArray(filtered);
            }
            resolve();
        });
    }
    
    _prepareBindRenderObjectPromises() {
        for (let i = 0; i < this.#renderObjects.length; i++) {
            const object = this.#renderObjects[i];
            if (object.isRemoved) {
                this.#renderObjects.splice(i, 1);
                i--;
            }
            if (object.isAnimations) {
                object._processActiveAnimations();
            }
            const promise = this.#bindRenderObject(object).catch((err) => {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_3__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, err);
                return Promise.reject(err);
            });
            this.#bindRenderObjectPromises.push(promise);
        }
    }

    _prepareBindBoundariesPromise() {
        this.#bindRenderObjectPromises.push(this.#drawBoundariesWebGl().catch((err) => {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_3__.ERROR_CODES.UNHANDLED_PREPARE_EXCEPTION, err);
        }));
    }

    _executeBindRenderObjectPromises () {
        return Promise.allSettled(this.#bindRenderObjectPromises).then((bindResults) => {
            this.#clearRenderObjectPromises();
            return Promise.resolve(bindResults);
        });
    }

    #getImage(key) {
        return this.loader.getImage(key);
    }

    #bindTileImages(verticesBufferData, texturesBufferData,  atlasImage, image_name, drawMask, rotation, translation) {
        this.#webGlInterface._bindTileImages(verticesBufferData, texturesBufferData, atlasImage, image_name, drawMask, rotation, translation);
    }

    #clearTileMapPromises() {
        this.#bindTileMapPromises = [];
    }

    #bindRenderObject(renderObject) {
        return new Promise((resolve) => {
            const [ xOffset, yOffset ] = this.#isOffsetTurnedOff === true ? [0,0] : this.screenPageData.worldOffset,
                x = renderObject.x - xOffset,
                y = renderObject.y - yOffset;

            if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_3__.CONST.DRAW_TYPE.IMAGE) {
                const atlasImage = this.#getImage(renderObject.key),
                    animationIndex = renderObject.imageIndex;
                let imageX = 0,
                    imageY = 0;
                if (animationIndex !== 0) {
                    const imageColsNumber = atlasImage.width / renderObject.width;
                    imageX = animationIndex % imageColsNumber * renderObject.width,
                    imageY = Math.floor(animationIndex / imageColsNumber) * renderObject.height;
                }
                const posX = x - renderObject.width / 2,
                    posY = y - renderObject.height / 2;
                const vecX1 = posX,
                    vecY1 = posY,
                    vecX2 = vecX1 + renderObject.width,
                    vecY2 = vecY1 + renderObject.height,
                    texX1 = 1 / atlasImage.width * imageX,
                    texY1 = 1 / atlasImage.height * imageY,
                    texX2 = texX1 + (1 / atlasImage.width * renderObject.width),
                    texY2 = texY1 + (1 / atlasImage.height * renderObject.height);
                const verticesBufferData = [
                        vecX1, vecY1,
                        vecX2, vecY1,
                        vecX1, vecY2,
                        vecX1, vecY2,
                        vecX2, vecY1,
                        vecX2, vecY2
                    ],
                    texturesBufferData = [
                        texX1, texY1,
                        texX2, texY1,
                        texX1, texY2,
                        texX1, texY2,
                        texX2, texY1,
                        texX2, texY2
                    ];
                this.#webGlInterface._bindAndDrawTileImages(verticesBufferData, texturesBufferData, atlasImage, renderObject.key, renderObject.rotation, [x, y]);
                //ctx.restore();
            } else if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_3__.CONST.DRAW_TYPE.TEXT) {
                this.#webGlInterface._bindText(x, y, renderObject);
            } else if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_3__.CONST.DRAW_TYPE.CIRCLE) {
                this.#webGlInterface._bindConus(renderObject, renderObject.rotation, [x, y]);
            } else if (renderObject.type === _constants_js__WEBPACK_IMPORTED_MODULE_3__.CONST.DRAW_TYPE.LINE) {
                this.#webGlInterface._drawLines(renderObject.vertices, renderObject.bgColor, this.systemSettings.gameOptions.boundariesWidth);
            } else {
                this.#webGlInterface._bindPrimitives(renderObject, renderObject.rotation, [x, y]);
            }
            if (renderObject.boundaries && this.systemSettings.gameOptions.boundaries.drawObjectBoundaries) {
                const shiftX = x,// - renderObject.boundaries[0],
                    shiftY = y,// - renderObject.boundaries[1],
                rotation = renderObject.rotation ? renderObject.rotation : 0;
                this.#webGlInterface._drawPolygon(renderObject.boundaries, this.systemSettings.gameOptions.boundaries.boundariesColor, this.systemSettings.gameOptions.boundaries.boundariesWidth, rotation, [shiftX, shiftY]);
            }
            return resolve();
        });
    }

    #clearRenderObjectPromises() {
        this.#bindRenderObjectPromises = [];
    }

    #drawBoundariesWebGl() {
        return new Promise((resolve) => {
            const b = this.screenPageData.getBoundaries(),
                len = b.length,
                linesArray = [];
        
            for (let i = 0; i < len; i++) {
                const item = b[i];
                linesArray.push(item[0], item[1]);
                linesArray.push(item[2], item[3]);
            }
            this.#webGlInterface._drawLines(linesArray, this.systemSettings.gameOptions.boundaries.boundariesColor, this.systemSettings.gameOptions.boundaries.boundariesWidth);
            resolve();
        });
    }
}

/***/ }),

/***/ "./src/base/DrawConusObject.js":
/*!*************************************!*\
  !*** ./src/base/DrawConusObject.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawConusObject": () => (/* binding */ DrawConusObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");




/**
 * Conus object to draw
 * @augments DrawShapeObject
 * @ignore
 */
class DrawConusObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {Number}
     */
    #radius;

    /**
     * @type {Array<Vertex>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(x, y, radius, bgColor, angle, subtractProgram) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE, x, y, bgColor, subtractProgram);
        this.#radius = radius;
        this.#vertices = this.#calculateConusVertices(radius, angle);
    }

    /**
     * @type {Array<Vertex>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }

    get radius() {
        return this.#radius;
    }

    #calculateConusVertices(radius, angle = 2*Math.PI, step = Math.PI/12) {
        let conusPolygonCoords = [0, 0];

        for (let r = 0; r <= angle; r += step) {
            let x2 = Math.cos(r) * radius,
                y2 = Math.sin(r) * radius;

            conusPolygonCoords.push(x2, y2);
        }

        return conusPolygonCoords;
    }
}

/***/ }),

/***/ "./src/base/DrawImageObject.js":
/*!*************************************!*\
  !*** ./src/base/DrawImageObject.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawImageObject": () => (/* binding */ DrawImageObject)
/* harmony export */ });
/* harmony import */ var _AnimationEventImageObj_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AnimationEventImageObj.js */ "./src/base/AnimationEventImageObj.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");




/**
 * Image object to draw
 * @augments DrawShapeObject
 * @ignore
 */
class DrawImageObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawShapeObject {
    /**
     * @type {Number}
     */
    #w;
    /**
     * @type {Number}
     */
    #h;
    /**
     * Image sprite key
     * @type {String}
     */
    #key;
    /**
     * @type {EventTarget}
     */
    #emitter;
    /**
     * @type {Map<String, AnimationEventImageObj>}
     */
    #animations;
    /**
     * @type {Number}
     */
    #imageIndex;
    /**
     * @type {Array<Vertex> | null}
     */
    #boundaries = null;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, width, height, key, imageIndex = 0, boundaries) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.DRAW_TYPE.IMAGE, mapX, mapY);
        this.#key = key;
        this.#emitter = new EventTarget();
        this.#animations = new Map();
        this.#imageIndex = imageIndex;
        this.#boundaries = boundaries;
        this.#w = width;
        this.#h = height;
    }

    /**
     * @type {Number}
     */
    get width() {
        return this.#w;
    }

    /**
     * @type {Number}
     */
    get height() {
        return this.#h;
    }

    set width(w) {
        this.#w = w;
    }

    set height(h) {
        this.#h = h;
    }

    /**
     * A key should match an image loaded through AssetsManager
     * @type {String}
     */
    get key() {
        return this.#key;
    }

    /**
     * Current image index
     * @type {Number}
     */
    get imageIndex() {
        return this.#imageIndex;
    }

    /**
     * Determines if image is animated or not
     * @type {Boolean}
     */
    get isAnimations() {
        return this.#animations.size > 0;
    }

     /**
     * @type {Array<Vertex>}
     */
    get boundaries() {
        return this.#boundaries;
    }

    _processActiveAnimations() {
        for (let animationEvent of this.#animations.values()) {
            if (animationEvent.isActive) {
                animationEvent.iterateSprite();
                this.#imageIndex = animationEvent.currentSprite;
            }
        }
    }

    /**
     * Emit event
     * @param {String} eventName 
     * @param  {...any} eventParams 
     */
    emit(eventName, ...eventParams) {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    }

    /**
     * Subscribe
     * @param {String} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    addEventListener(eventName, listener, options) {
        this.#emitter.addEventListener(eventName, listener, options);
    }

    /**
     * Unsubscribe
     * @param {String} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    removeEventListener(eventName, listener, options) {
        this.#emitter.removeEventListener(eventName, listener, options);
    }

    /**
     * Adds image animations
     * @param { String } eventName -animation name
     * @param { Number[] } animationSpriteIndexes - animation image indexes
     */
    addAnimation (eventName, animationSpriteIndexes) {
        const animationEvent = new _AnimationEventImageObj_js__WEBPACK_IMPORTED_MODULE_0__.AnimationEventImageObj(eventName, animationSpriteIndexes);
        this.#animations.set(eventName, animationEvent);
        this.addEventListener(eventName, animationEvent.activateAnimation);
    }

    /**
     * Removes animations
     */
    removeAllAnimations() {
        for (let [eventName, animationEvent] of this.#animations.entries()) {
            this.removeEventListener(eventName, animationEvent.activateAnimation);
        }
        this.#animations.clear();
        this.#animations - undefined;
    }
}

/***/ }),

/***/ "./src/base/DrawLineObject.js":
/*!************************************!*\
  !*** ./src/base/DrawLineObject.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawLineObject": () => (/* binding */ DrawLineObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");




/**
 * Line object to draw
 * @augments DrawShapeObject
 * @ignore
 */
class DrawLineObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {Array<Number>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(vertices, bgColor) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.LINE, vertices[0][0], vertices[0][1], bgColor);
        this.#vertices = vertices;
    }

    /**
     * @type {Array<Vertex>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }
}

/***/ }),

/***/ "./src/base/DrawObjectFactory.js":
/*!***************************************!*\
  !*** ./src/base/DrawObjectFactory.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawObjectFactory": () => (/* binding */ DrawObjectFactory)
/* harmony export */ });
/* harmony import */ var _DrawRectObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DrawRectObject.js */ "./src/base/DrawRectObject.js");
/* harmony import */ var _DrawTextObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawTextObject.js */ "./src/base/DrawTextObject.js");
/* harmony import */ var _DrawConusObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DrawConusObject.js */ "./src/base/DrawConusObject.js");
/* harmony import */ var _DrawImageObject_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./DrawImageObject.js */ "./src/base/DrawImageObject.js");
/* harmony import */ var _DrawLineObject_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./DrawLineObject.js */ "./src/base/DrawLineObject.js");
/* harmony import */ var _DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./DrawPolygonObject.js */ "./src/base/DrawPolygonObject.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");








/**
 * Creates drawObjects instances.<br>
 * accessible via ScreenPage.draw <br>
 * @see {@link ScreenPage} a part of ScreenPage
 */
class DrawObjectFactory {

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {String} backgroundColor - rgba(r,g,b,a)
     * @param {String} subtractProgram
     * @returns {DrawRectObject}
     */
    rect(x, y, width, height, backgroundColor, subtractProgram) {
        return new _DrawRectObject_js__WEBPACK_IMPORTED_MODULE_0__.DrawRectObject(x, y, width, height, backgroundColor, subtractProgram); 
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} text 
     * @param {String} font - size fontFamily
     * @param {String} color - rgba(r,g,b,a)
     * @returns {DrawTextObject}
     */
    text(x, y, text, font, color) {
        return new _DrawTextObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawTextObject(x, y, text, font, color);
    }

    /**
     * 
     * @param {Number} radius 
     * @param {String} bgColor - rgba(r,g,b,a)
     * @param {Number=} angle
     * @param {String=} subtractProgram 
     * @returns {DrawConusObject}
     */
    conus(x, y, radius, bgColor, angle, subtractProgram) {
        return new _DrawConusObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawConusObject(x, y, radius, bgColor, angle, subtractProgram);
    }

    /**
     * 
     * @param {Number} radius 
     * @param {String} bgColor - rgba(r,g,b,a)
     * @param {String=} subtractProgram 
     * @returns {DrawConusObject}
     */
    circle(x, y, radius, bgColor, subtractProgram) {
        return new _DrawConusObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawConusObject(x, y, radius, bgColor, 2*Math.PI, subtractProgram);
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {String} key 
     * @param {Number} [imageIndex = 0]
     * @param {Array<Vertex>=} boundaries 
     * @returns {DrawImageObject}
     */
    image(x, y, width, height, key, imageIndex = 0, boundaries) {
        return new _DrawImageObject_js__WEBPACK_IMPORTED_MODULE_3__.DrawImageObject(x, y, width, height, key, imageIndex, boundaries);
    }

    /**
     * @param {Array<Vertex>} vertices 
     * @param {String} bgColor - rgba(r,g,b,a)
     * @returns {DrawLineObject}
     */
    line(vertices, bgColor) {
        return new _DrawLineObject_js__WEBPACK_IMPORTED_MODULE_4__.DrawLineObject(vertices, bgColor);
    }

    /**
     * @param {Array<Vertex>} vertices - should go in anticlockwise order
     * @param {String} bgColor - rgba(r,g,b,a) 
     * @param {String=} subtractProgram 
     * @returns {DrawPolygonObject}
     */
    polygon(vertices, bgColor, subtractProgram) {
        return new _DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_5__.DrawPolygonObject(vertices, bgColor, subtractProgram);
    }
}

/***/ }),

/***/ "./src/base/DrawPolygonObject.js":
/*!***************************************!*\
  !*** ./src/base/DrawPolygonObject.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawPolygonObject": () => (/* binding */ DrawPolygonObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");




/**
 * @augments DrawShapeObject
 * @ignore
 */
class DrawPolygonObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {Array<Vertex>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(vertices, bgColor, subtractProgram) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.POLYGON, vertices[0].x, vertices[0].y, bgColor, subtractProgram);
        this.#vertices = vertices;
    }

    /**
     * @type {Array<Vertex>}
     */
    get vertices () {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }
}

/***/ }),

/***/ "./src/base/DrawRectObject.js":
/*!************************************!*\
  !*** ./src/base/DrawRectObject.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawRectObject": () => (/* binding */ DrawRectObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");



/**
 * @augments DrawShapeObject
 * @ignore
 */
class DrawRectObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_1__.DrawShapeObject {
    /**
     * @type {Number}
     */
    #w;
    /**
     * @type {Number}
     */
    #h;
    /**
     * @type {Array<Vertex>}
     */
    #vertices;

    /**
     * @hideconstructor
     */
    constructor(x, y, w, h, bgColor, subtractProgram) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE, x, y, bgColor, subtractProgram);
        this.#w = w;
        this.#h = h;
    }

    /**
     * @type {Array<Vertex>}
     */
    get vertices () {
        return this.#vertices;
    }
    /**
     * @type {Number}
     */
    get width() {
        return this.#w;
    }

    /**
     * @type {Number}
     */
    get height() {
        return this.#h;
    }

    set width(w) {
        this.#w = w;
    }

    set height(h) {
        this.#h = h;
    }
}

/***/ }),

/***/ "./src/base/DrawShapeObject.js":
/*!*************************************!*\
  !*** ./src/base/DrawShapeObject.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawShapeObject": () => (/* binding */ DrawShapeObject)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./src/utils.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");




/**
 * A base draw object
 * @ignore
 */
class DrawShapeObject {
    #x;
    #y;
    #bg;
    /**
     * @type {CONST.DRAW_TYPE}
     */
    #type;
    #subtract;
    /**
     * Is used for blending pixel arithmetic
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
     * @type {Array<WebGL_API.Types>}
     */
    #blendFunc;
    
    /**
     * @type {Number}
     */
    #zIndex = 0;
    /**
     * @type {Number}
     */
    #rotation = 0;
    /**
     * @type {Number}
     */
    #id = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.generateUniqId)();
    /**
     * @type {Boolean}
     */
    #isRemoved = false;

    /**
     * @hideconstructor
     */
    constructor(type, mapX, mapY, bgColor, subtractProgram) {
        this.#x = mapX;
        this.#y = mapY;
        this.#bg = bgColor;
        this.#type = type;
        this.#subtract = subtractProgram;
    }

    /**
     * background color as rgba(r,g,b,a)
     * @type {String}
     */
    get bgColor() {
        return this.#bg;
    }

    set bgColor(value) {
        this.#bg = value;
    }

    /**
     * @type {CONST.DRAW_TYPE}
     */
    get type() {
        return this.#type;
    }

    /**
     * @type {Number}
     */
    get x() {
        return this.#x;
    }

    /**
     * @type {Number}
     */
    get y () {
        return this.#y;
    }

    set x(posX) {
        this.#x = posX;
    }

    set y(posY) {
        this.#y = posY;
    }

    /**
     * @type {String}
     */
    get subtract() {
        return this.#subtract;
    }

    /**
     * @type {Number}
     */
    get zIndex () {
        return this.#zIndex;
    }

    set zIndex(value) {
        this.#zIndex = value;
    }

    get blendFunc () {
        return this.#blendFunc;
    }

    set blendFunc(value) {
        this.#blendFunc = value;
    }

    /**
     * @type {Number}
     */
    get rotation() {
        return this.#rotation;
    }

    set rotation(value) {
        this.#rotation = value;
    }

    /**
     * @type {Number}
     */
    get id() {
        return this.#id;
    }

    /**
     * @type {Boolean}
     */
    get isRemoved() {
        return this.#isRemoved;
    }

    /**
     * Destroy object on next render iteration
     */
    destroy() {
        this.#isRemoved = true;
    }
}

/***/ }),

/***/ "./src/base/DrawTextObject.js":
/*!************************************!*\
  !*** ./src/base/DrawTextObject.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DrawTextObject": () => (/* binding */ DrawTextObject)
/* harmony export */ });
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");




/**
 * @augments DrawShapeObject
 * @ignore
 */
class DrawTextObject extends _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_0__.DrawShapeObject {
    #font;
    #textAlign;
    #textBaseline;
    #fillStyle;
    #strokeStyle;
    #direction;
    #text;
    #textMetrics;

    /**
     * @hideconstructor
     */
    constructor(mapX, mapY, text, font, fillStyle) {
        super(_constants_js__WEBPACK_IMPORTED_MODULE_2__.CONST.DRAW_TYPE.TEXT, mapX, mapY);
        this.#text = text;
        this.#font = font;
        this.#fillStyle = fillStyle;
        this.#textMetrics;
    }

    /**
     * Rectangle text box
     * @type {Rectangle}
     */
    get boundariesBox() {
        const width = this.textMetrics ? this.textMetrics.width : 300,
            height = this.textMetrics ? this.textMetrics.actualBoundingBoxAscent + /*this.textMetrics.actualBoundingBoxDescent*/ 5: 30;
        return new _Primitives_js__WEBPACK_IMPORTED_MODULE_1__.Rectangle(this.x, this.y - height, width, height);
    }

    /**
     * @type {String}
     */
    get text() {
        return this.#text;
    }

    set text(value) {
        this.#text = value;
    }

    /**
     * @type {String}
     */
    get font() {
        return this.#font;
    }

    set font(value) {
        this.#font = value;
    }

    /**
     * @type {String}
     */
    get textAlign() {
        return this.#textAlign;
    }

    set textAlign(value) {
        this.#textAlign = value;
    }

    /**
     * @type {String}
     */
    get textBaseline() {
        return this.#textBaseline;
    }

    set textBaseline(value) {
        this.#textBaseline = value;
    }

    /**
     * @type {String}
     */
    get fillStyle() {
        return this.#fillStyle;
    }

    set fillStyle(value) {
        this.#fillStyle = value;
    }

    /**
     * @type {String}
     */
    get strokeStyle() {
        return this.#strokeStyle;
    }

    set strokeStyle(value) {
        this.#strokeStyle = value;
    }

    /**
     * @type {String}
     */
    get textMetrics() {
        return this.#textMetrics;
    }

    set textMetrics(value) {
        this.#textMetrics = value;
    }
}

/***/ }),

/***/ "./src/base/Events/SystemEvent.js":
/*!****************************************!*\
  !*** ./src/base/Events/SystemEvent.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemEvent": () => (/* binding */ SystemEvent)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Exception.js */ "./src/base/Exception.js");



class SystemEvent extends Event {
    #data;
    constructor(eventValue, data){
        super(eventValue);
        if (!this.#isEventExist(eventValue)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.UNEXPECTED_EVENT_NAME, ", Please check if event is exist");
        }
        this.#data = data;
    }

    #isEventExist(eventValue) {
        return Object.values(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT).find(eventVal => eventVal === eventValue);
    }

    get data () {
        return this.#data;
    }
}

/***/ }),

/***/ "./src/base/Exception.js":
/*!*******************************!*\
  !*** ./src/base/Exception.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Exception": () => (/* binding */ Exception),
/* harmony export */   "Warning": () => (/* binding */ Warning)
/* harmony export */ });
function Exception (code, message) {
    throw new Error(code + ": " + message);
}

function Warning (code, message) {
    console.warn(code, message);
}

/***/ }),

/***/ "./src/base/Logger.js":
/*!****************************!*\
  !*** ./src/base/Logger.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Logger": () => (/* binding */ Logger)
/* harmony export */ });
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");



class Logger {
    static debug(...args) {
        if (_configs_js__WEBPACK_IMPORTED_MODULE_0__.SystemSettings.mode === _constants_js__WEBPACK_IMPORTED_MODULE_1__.CONST.MODE.DEBUG)
            args.forEach(message => console.log(message));
    }
}

/***/ }),

/***/ "./src/base/Primitives.js":
/*!********************************!*\
  !*** ./src/base/Primitives.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Rectangle": () => (/* binding */ Rectangle),
/* harmony export */   "Vector": () => (/* binding */ Vector),
/* harmony export */   "Vertex": () => (/* binding */ Vertex)
/* harmony export */ });
class Vertex {
    #x;
    #y;
    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }
}

class Rectangle {
    #x;
    #y;
    #w;
    #h;
    constructor(x, y, w, h) {
       this.#x = x;
       this.#y = y;
       this.#w = w;
       this.#h = h; 
    }
    /**
     * @type {Number}
     */
    get x() {
        return this.#x;
    }
    /**
     * @type {Number}
     */
    get y() {
        return this.#y;
    }
    /**
     * @type {Number}
     */
    get width() {
        return this.#w;
    }
    /**
     * @type {Number}
     */
    get height() {
        return this.#h;
    }
}

class Vector {
    #x;
    #y;
    constructor(x1, y1, x2, y2) {
        this.#x = x2 - x1;
        this.#y = y2 - y1;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get length() {
        return Math.sqrt(Math.pow(this.#x, 2) + Math.pow(this.#y, 2));
    }

    get tetaAngle() {
        return Math.atan2(this.#y, this.#x);
    }
}



/***/ }),

/***/ "./src/base/RenderLayer.js":
/*!*********************************!*\
  !*** ./src/base/RenderLayer.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RenderLayer": () => (/* binding */ RenderLayer)
/* harmony export */ });
class RenderLayer {
    #layerKey;
    #tileMapKey;
    #setBoundaries;
    #drawBoundaries;

    constructor(layerKey, tileMapKey, setBoundaries = false) {
        this.#layerKey = layerKey;
        this.#tileMapKey = tileMapKey;
        this.#setBoundaries = setBoundaries;
        this.#drawBoundaries = setBoundaries ? setBoundaries : false;
    }

    /**
     * A layer name
     * @type {String}
     */
    get layerKey() {
        return this.#layerKey;
    }

    /**
     * A tilemap layer key, should match key from the tilemap
     * @type {String}
     */
    get tileMapKey() {
        return this.#tileMapKey;
    }

    /**
     * Should the layer borders used as boundaries, or not
     * Can be set in ScreenPage.addRenderLayer() method
     * @type {Boolean}
     */
    get setBoundaries() {
        return this.#setBoundaries;
    }

    /**
     * Should draw a boundaries helper, or not
     * Can be set in SystemSettings
     * @type {Boolean}
     */
    get drawBoundaries() {
        return this.#drawBoundaries;
    }

    set drawBoundaries(value) {
        this.#drawBoundaries = value;
    }
}


/***/ }),

/***/ "./src/base/ScreenPage.js":
/*!********************************!*\
  !*** ./src/base/ScreenPage.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ScreenPage": () => (/* binding */ ScreenPage)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _ScreenPageData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ScreenPageData.js */ "./src/base/ScreenPageData.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Logger.js */ "./src/base/Logger.js");
/* harmony import */ var assetsm__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! assetsm */ "./node_modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _RenderLayer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./RenderLayer.js */ "./src/base/RenderLayer.js");
/* harmony import */ var _CanvasView_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./CanvasView.js */ "./src/base/CanvasView.js");
/* harmony import */ var _System_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./System.js */ "./src/base/System.js");
/* harmony import */ var _DrawObjectFactory_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./DrawObjectFactory.js */ "./src/base/DrawObjectFactory.js");
/* harmony import */ var _DrawConusObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./DrawConusObject.js */ "./src/base/DrawConusObject.js");
/* harmony import */ var _DrawImageObject_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./DrawImageObject.js */ "./src/base/DrawImageObject.js");
/* harmony import */ var _DrawLineObject_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./DrawLineObject.js */ "./src/base/DrawLineObject.js");
/* harmony import */ var _DrawPolygonObject_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./DrawPolygonObject.js */ "./src/base/DrawPolygonObject.js");
/* harmony import */ var _DrawRectObject_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./DrawRectObject.js */ "./src/base/DrawRectObject.js");
/* harmony import */ var _DrawShapeObject_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./DrawShapeObject.js */ "./src/base/DrawShapeObject.js");
/* harmony import */ var _DrawTextObject_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./DrawTextObject.js */ "./src/base/DrawTextObject.js");
/* harmony import */ var _SystemInterface_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./SystemInterface.js */ "./src/base/SystemInterface.js");
/* harmony import */ var _SystemAudioInterface_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./SystemAudioInterface.js */ "./src/base/SystemAudioInterface.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../utils.js */ "./src/utils.js");
/* harmony import */ var _Primitives_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./Primitives.js */ "./src/base/Primitives.js");






















/**
 * Represents the page of the game,<br>
 * Register and holds CanvasView.<br>
 * Contains pages logic.<br>
 * Instances should be created and registered with System.registerPage() factory method
 * 
 * @see {@link System} instances of this class holds by the System class
 * @hideconstructor
 */
class ScreenPage {
    /**
     * @type {String}
     */
    #name;
    /**
     * @type {boolean}
     */
    #isInitiated = false;
    /**
     * @type {boolean}
     */
    #isActive;
    /**
     * @type {System}
     */
    #system;
    /**
     * @type {Map<CanvasView>}
     */
    #views;
    /**
     * @type {AssetsManager}
     */
    #loader;
    /**
     * @type {ScreenPageData}
     */
    #screenPageData;
    /**
     * @type {DrawObjectFactory}
     */
    #drawObjectFactory = new _DrawObjectFactory_js__WEBPACK_IMPORTED_MODULE_8__.DrawObjectFactory();
    /**
     * @type {Number[]}
     */
    #tempFPStime;
    /**
     * @type {Function}
     */
    #fpsAverageCountTimer;
    /**
     * @type {EventTarget}
     */
    #emitter = new EventTarget();

    constructor() {
        this.#isActive = false;
        this.#views = new Map();
        this.#loader = new assetsm__WEBPACK_IMPORTED_MODULE_4__["default"]();
        this.#screenPageData = new _ScreenPageData_js__WEBPACK_IMPORTED_MODULE_1__.ScreenPageData();
        this.#tempFPStime = [];
    }

    /**
     * 
     * @param {String} eventName 
     * @param  {...any} eventParams 
     */
    emit = (eventName, ...eventParams) => {
        const event = new Event(eventName);
        event.data = [...eventParams];
        this.#emitter.dispatchEvent(event);
    }

    /**
     * 
     * @param {String} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    addEventListener = (eventName, listener, options) => {
        this.#emitter.addEventListener(eventName, listener, options);
    }

    /**
     * 
     * @param {String} eventName 
     * @param {*} listener 
     * @param {*} options 
     */
    removeEventListener = (eventName, listener, options) => {
        this.#emitter.removeEventListener(eventName, listener, options);
    }

    /**
     * Register stage
     * @param {String} name
     * @param {SystemInterface} system 
     * @protected
     */
    _register(name, system) {
        this.#name = name;
        this.#system = system;
        this.#setWorldDimensions();
        this.#setCanvasSize();
        this.register();
    }

    /**
     * Initialization stage
     * @protected
     */
    _init() {
        this.init();
        this.#isInitiated = true;
    }

    /**
     * @tutorial screen_pages_stages
     * Custom logic for register stage
     */
    register() {}
    /**
     * @tutorial screen_pages_stages
     * Custom logic for init stage
     */
    init() {}
    /**
     * Custom logic for start stage
     */
    start() {}
    /**
     * @tutorial screen_pages_stages
     * Custom logic for stop stage
     */
    stop() {}
    /**
     * Custom logic for resize stage
     */
    resize() {}

    /**
     * @tutorial assets_manager
     * @type {AssetsManager}
     */
    get loader() {
        return this.#loader;
    }

    /**
     * @type {DrawObjectFactory}
     */
    get draw() {
        return this.#drawObjectFactory;
    }

    /**
     * Creates new canvas layer
     * and set it to the #views
     * @param {string} name
     * @param {boolean} [isOffsetTurnedOff = false] - determines if offset is affected on this layer or not
     */
    createCanvasView = (name, isOffsetTurnedOff = false) => {
        if (name && name.trim().length > 0) {
            const newView = new _CanvasView_js__WEBPACK_IMPORTED_MODULE_6__.CanvasView(name, this.#system.systemSettings, this.#screenPageData, this.#loader, isOffsetTurnedOff);
            this.#views.set(name, newView);
        } else
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.UNEXPECTED_INPUT_PARAMS);
    }

    /**
     * Attach all canvas elements from the #views to container
     * @param {HTMLDivElement} container
     * @protected
     * @ignore
     */
    _attachViewsToContainer(container) {
        for (const view of this.#views.values()) {
            this.#attachElementToContainer(view.canvas, container);
        }
    }

    /**
     * Add render object to the view
     * @param {String} canvasKey 
     * @param { DrawConusObject | DrawImageObject | 
     *          DrawLineObject | DrawPolygonObject | 
     *          DrawRectObject | DrawShapeObject | 
     *          DrawTextObject } renderObject 
     */
    addRenderObject = (canvasKey, renderObject) => {
        if (!canvasKey) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        } else if (!this.#views.has(canvasKey)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
        } else {
            const view = this.#views.get(canvasKey);
            view._renderObject = renderObject;
            view._sortRenderObjectsByZIndex();
        }
    }

    /**
     * Add render layer to the view
     * @param {String} canvasKey 
     * @param {String} layerKey 
     * @param {String} tileMapKey 
     * @param {Boolean} setBoundaries 
     */
    addRenderLayer = (canvasKey, layerKey, tileMapKey, setBoundaries) => {
        if (!canvasKey) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_KEY_NOT_SPECIFIED, ", should pass canvasKey as 3rd parameter");
        } else if (!this.#views.has(canvasKey)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", should create canvas view, with " + canvasKey + " key first");
        } else {
            const view = this.#views.get(canvasKey);
            view._renderLayers = new _RenderLayer_js__WEBPACK_IMPORTED_MODULE_5__.RenderLayer(layerKey, tileMapKey, setBoundaries);
            if (setBoundaries && this.systemSettings.gameOptions.render.mapBoundariesEnabled) {
                view._enableMapBoundaries();
            }
        }
    }

    /**
     * Determines if this page render is Active or not
     * @type {Boolean}
     */
    get isActive() {
        return this.#isActive;
    }

    /**
     * Determines if this page is initialized or not
     * @type {Boolean}
     */
    get isInitiated() {
        return this.#isInitiated;
    }

    /**
     * Current page name
     * @type {String}
     */
    get name () {
        return this.#name;
    }

    /**
     * Determines if all added files was loaded or not
     * @returns {Boolean}
     */
    isAllFilesLoaded = () => {
        return this.#loader.filesWaitingForUpload === 0;
    }

    /**
     * @type {ScreenPageData}
     */
    get screenPageData() {
        return this.#screenPageData;
    }

    /**
     * @type {SystemSettings}
     */
    get systemSettings() {
        return this.#system.systemSettings;
    }

    /**
     * @type {SystemAudioInterface}
     */
    get audio() {
        return this.#system.audio;
    }

    /**
     * @type {SystemInterface}
     */
    get system() {
        return this.#system;
    }

    /**
     * @method
     * @param {String} key 
     * @returns {CanvasView}
     */
    getView = (key) => {
        const ctx = this.#views.get(key);
        if (ctx) {
            return this.#views.get(key);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CANVAS_WITH_KEY_NOT_EXIST, ", cannot find canvas with key " + key);
        }
    };

    /**
     * Load all assets,
     * previously added to a loader query
     * @returns {Promise}
     * @protected
     * @ignore
     */
    _loadPageAssets() {
        return this.#loader.preload();
    }

    /** 
     * @returns {Promise}
     * @protected 
     * @ignore
     */
    _registerPageAudio() {
        return this.audio._registerAllAudio(this.#loader);
    }

    /**
     * Start page render
     * @param {*} options 
     * @protected
     * @ignore
     */
    _start(options) {
        this.#isActive = true;
        window.addEventListener("resize", this._resize);
        this._resize();
        if (this.#views.size > 0) {
            requestAnimationFrame(this.#render);
        }
        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.START_PAGE);
        this.start(options);
    }

    /**
     * Stop page render
     * @protected
     * @ignore
     */
    _stop() {
        this.#isActive = false;
        window.removeEventListener("resize", this._resize);
        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.STOP_PAGE);
        this.#removeCanvasFromDom();
        clearInterval(this.#fpsAverageCountTimer);
        this.stop();
    }

    /**
     * Resize event
     * @protected
     * @ignore
     */
    _resize = () => {
        this.#setCanvasSize();
        this.resize();
    }

    /**
     * 
     * @param {HTMLDivElement} htmlElement 
     * @param {HTMLDivElement} container 
     */
    #attachElementToContainer(htmlElement, container) {
        container.appendChild(htmlElement);
    }

    #removeCanvasFromDom() {
        for (const view of this.#views.values()) {
            document.getElementById(view.canvas.id).remove();
        }
    }

    #setWorldDimensions() {
        const width = this.systemSettings.worldSize ? this.systemSettings.worldSize.width : 0,
            height = this.systemSettings.worldSize ? this.systemSettings.worldSize.height : 0;
            
        this.screenPageData._setWorldDimensions(width, height);
    }

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @returns {boolean}
     */
    #isPointToBoundariesCollision(x, y) {
        const mapObjects = this.screenPageData.getBoundaries(),
            [mapOffsetX, mapOffsetY] = this.screenPageData.worldOffset,
            len = mapObjects.length;

        for (let i = 0; i < len; i+=1) {
            const item = mapObjects[i],
                object = {
                    x1: item[0],
                    y1: item[1],
                    x2: item[2],
                    y2: item[3]
                };
            if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_19__.isPointLineIntersect)({x: x - mapOffsetX, y: y - mapOffsetY}, object)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Array<Vertex>} polygon
     * @param {Number} rotation 
     * @returns {boolean}
     */
    #isPolygonToBoundariesCollision(x, y, polygon, rotation) {
        //console.log("angle: ", rotation);
        //console.log("boundaries before calculations: ");
        //console.log(polygon);
        const mapObjects = this.screenPageData.getBoundaries(),
            [mapOffsetX, mapOffsetY] = this.screenPageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            polygonWithOffsetAndRotation = polygon.map((vertex) => (this.#calculateShiftedVertexPos(vertex, xWithOffset, yWithOffset, rotation))),
            len = mapObjects.length;
            
        for (let i = 0; i < len; i+=1) {
            const item = mapObjects[i],
                object = {
                    x1: item[0],
                    y1: item[1],
                    x2: item[2],
                    y2: item[3]
                },
                intersect = (0,_utils_js__WEBPACK_IMPORTED_MODULE_19__.isPolygonLineIntersect)(polygonWithOffsetAndRotation, object);
            if (intersect) {
                //console.log("rotation: ", rotation);
                //console.log("polygon: ", polygonWithOffsetAndRotation);
                //console.log("intersect: ", intersect);
                return intersect;
            }
        }
        return false;
    }

    #calculateShiftedVertexPos(vertex, centerX, centerY, rotation) {
        const vector = new _Primitives_js__WEBPACK_IMPORTED_MODULE_20__.Vector(0, 0, vertex.x, vertex.y),
            vertexAngle = (0,_utils_js__WEBPACK_IMPORTED_MODULE_19__.angle_2points)(0, 0, vertex.x, vertex.y),
            len = vector.length;
        //console.log("coords without rotation: ");
        //console.log(x + vertex.x);
        //console.log(y + vertex.y);
        //console.log("len: ", len);
        //console.log("angle: ", rotation);
        const newX = centerX + (len * Math.cos(rotation + vertexAngle)),
            newY = centerY + (len * Math.sin(rotation + vertexAngle));
        return { x: newX, y: newY };
    }

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {DrawShapeObject} drawObject 
     */
    isBoundariesCollision = (x, y, drawObject) => {
        const drawObjectType = drawObject.type;
        switch(drawObjectType) {
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
                return this.#isPolygonToBoundariesCollision(x, y, drawObject.boundaries, drawObject.rotation);
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.LINE:
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
            default:
                if (drawObject.boundaries && drawObject.boundaries.length > 0) {
                    return this.#isPolygonToBoundariesCollision(x, y, drawObject.boundaries, drawObject.rotation);
                 } else {
                     return this.#isPointToBoundariesCollision(x, y);
                 }
        }
    }

    #checkCollisions(renderObjects) {
        const boundaries = this.screenPageData.getBoundaries(),
            boundariesLen = boundaries.length,
            objectsLen = renderObjects.length;
        //console.log(this.screenPageData.worldOffset);
        for (let i = 0; i < objectsLen; i++) {
            const renderObject = renderObjects[i];
            for (let j = 0; j < objectsLen; j++) {
                if (i === j) {
                    continue;
                }
                const renderObjectCheck = renderObjects[j];
                // check object - object collisions
            }

            for (let k = 0; k < boundariesLen; k+=1) {
                const item = boundaries[k],
                    object = {
                        x1: item[0],
                        y1: item[1],
                        x2: item[2],
                        y2: item[3]
                    };
                const objectBoundaries = object.boundaries;
                if (objectBoundaries) {
                    if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_19__.isPolygonLineIntersect)(objectBoundaries, object)) {
                        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.GAME.BOUNDARIES_COLLISION, renderObject);
                    }
                } else {
                    if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_19__.isPointLineIntersect)({ x: renderObject.x, y: renderObject.y }, object)) {
                        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.GAME.BOUNDARIES_COLLISION, renderObject);
                        console.log("boundaries collision detected");
                    }
                }
            }
        }
    }

    #setCanvasSize() {
        const canvasWidth = this.systemSettings.canvasMaxSize.width && (this.systemSettings.canvasMaxSize.width < window.innerWidth) ? this.systemSettings.canvasMaxSize.width : window.innerWidth,
            canvasHeight = this.systemSettings.canvasMaxSize.height && (this.systemSettings.canvasMaxSize.height < window.innerHeight) ? this.systemSettings.canvasMaxSize.height : window.innerHeight;
        this.screenPageData._setCanvasDimensions(canvasWidth, canvasHeight);
        for (const view of this.#views.values()) {
            view._setCanvasSize(canvasWidth, canvasHeight);
        }
    }

    #countFPSaverage() {
        const timeLeft = this.systemSettings.gameOptions.render.averageFPStime,
            steps = this.#tempFPStime.length;
        let fullTime = 0;

        for(let i = 0; i < steps; i++) {
            const timeStep = this.#tempFPStime[i];
            fullTime += timeStep;
        }
        console.log("FPS average for ", timeLeft/1000, "sec, is ", fullTime / steps);

        // cleanup
        this.#tempFPStime = [];
    }

    #render = async (/*time*/) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("_render " + this.name + " class");
        if (this.#isActive) {
            switch (this.systemSettings.gameOptions.library) {
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.LIBRARY.WEBGL:
                if (this.isAllFilesLoaded()) {
                    //render
                    await this.#prepareViews();
                } else {
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.ASSETS_NOT_READY, "Is page initialization phase missed?");
                    this.#isActive = false;
                }
                // wait for the end of the execution stack, before start next iteration
                setTimeout(() => requestAnimationFrame(this.#drawViews));
                break;
            }
            this.#fpsAverageCountTimer = setInterval(() => this.#countFPSaverage(), this.systemSettings.gameOptions.render.averageFPStime);
        }
    };

    #prepareViews() {
        return new Promise((resolve, reject) => {
            let viewPromises = [];
            for (const view of this.#views.values()) {
                viewPromises.push(view._initiateWebGlContext(this.systemSettings.gameOptions.debugWebGl));
            }
            Promise.allSettled(viewPromises).then((drawingResults) => {
                drawingResults.forEach((result) => {
                    if (result.status === "rejected") {
                        const error = result.reason || result.value;
                        (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, error);
                        reject(error);
                    }
                });
                resolve();
            });
        });
    }

    #drawViews = (/*drawTime*/) => {
        const pt0 = performance.now(),
            minCircleTime = this.systemSettings.gameOptions.render.minCircleTime;
        let viewPromises = [];
        this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.RENDER.START);
        this.screenPageData._clearBoundaries();
        for (const [key, view] of this.#views.entries()) {
            viewPromises.push(this.#executeRender(key, view));
        }
        Promise.allSettled(viewPromises).then((drawingResults) => {
            drawingResults.forEach((result) => {
                if (result.status === "rejected") {
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason || result.value);
                }
            });
            const r_time = performance.now() - pt0,
                r_time_less = minCircleTime - r_time,
                wait_time = r_time_less > 0 ? r_time_less : 0,
                fps = 1000 / (r_time + wait_time);
            //console.log("draw circle done, take: ", (r_time), " ms");
            //console.log("fps: ", fps);
            this.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.SYSTEM.RENDER.END);
            this.#tempFPStime.push(fps);
            if (this.#isActive) {
                setTimeout(() => requestAnimationFrame(this.#drawViews), wait_time);
            }
        });
    };

    #executeRender (key, view) {
        return new Promise((resolve, reject) => {
            if (!view._isCleared) {
                view._clearWebGlContext();
            }
            if (view._renderLayers.length !== 0) {
                view._prepareBindRenderLayerPromises();
            }
            view._executeBindRenderLayerPromises()
                .then((bindResults) => {
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason || result.value);
                            this.#isActive = false;
                            return reject(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason);
                        }
                    });
                    return view._executeTileImagesDraw();
                })
                .then(() => {
                    if (view.renderObjects.length !== 0) {
                        //this.#checkCollisions(view.renderObjects);
                        view._prepareBindRenderObjectPromises();
                    }
                    if (key === _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.LAYERS.BOUNDARIES) {
                        view._prepareBindBoundariesPromise();
                    }
                    return view._executeBindRenderObjectPromises();
                })
                .then((bindResults) => {
                    bindResults.forEach((result) => {
                        if (result.status === "rejected") {
                            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.UNHANDLED_DRAW_ISSUE, result.reason || result.value);
                            this.#isActive = false;
                        }
                    });
                    
                    view._isCleared = false;
                    resolve();
                });
        });
    }
}

/***/ }),

/***/ "./src/base/ScreenPageData.js":
/*!************************************!*\
  !*** ./src/base/ScreenPageData.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ScreenPageData": () => (/* binding */ ScreenPageData)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _Logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Logger.js */ "./src/base/Logger.js");



/**
 * An interface for common views data such as
 * boundaries, world dimensions, options
 * accessible via ScreenPage.screenPageData 
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
class ScreenPageData {
    #worldWidth;
    #worldHeight;
    #viewWidth;
    #viewHeight;
    #xOffset = 0;
    #yOffset = 0;
    #centerX = 0;
    #centerY = 0;
    #rotate = 0;
    /**
     * @type {Array.<Number[]>}
     */
    #boundaries = [];

    /**
     * Add a Boundaries line
     * @param {*} boundaries 
     */
    #addBoundaries(boundaries) {
        this.#boundaries.push([boundaries.x1, boundaries.y1, boundaries.x2, boundaries.y2]);
    }

    /**
     * Add array of boundaries lines
     * @param {Array} boundaries 
     */
    _addBoundariesArray(boundaries) {
        this.#boundaries.push(...boundaries);
    }

    /**
     * Clear map boundaries
     */
    _clearBoundaries() {
        this.#boundaries = [];
    }

    /**
     * 
     * @param {Number} width 
     * @param {Number} height 
     */
    _setWorldDimensions(width, height) {
        this.#worldWidth = width;
        this.#worldHeight = height;
    }

    set mapRotate(value) {
        this.#rotate = value;
    }

    /**
     * 
     * @param {Number} width 
     * @param {Number} height 
     */
    _setCanvasDimensions(width, height) {
        this.#viewWidth = width;
        this.#viewHeight = height;
    }

    /**
     * Set map borders
     */
    _setMapBoundaries() {
        const [w, h] = [this.#worldWidth, this.#worldHeight];
        if (!w || !h) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.WORLD_DIMENSIONS_NOT_SET, "Can't set map boundaries.");
        }
        this.#addBoundaries({x1: 0, y1: 0, x2: w, y2: 0});
        this.#addBoundaries({x1: w, y1: 0, x2: w, y2: h});
        this.#addBoundaries({x1: w, y1: h, x2: 0, y2: h});
        this.#addBoundaries({x1: 0, y1: h, x2: 0, y2: 0});
    }

    /**
     * Merge same boundaries
     */
    _mergeBoundaries() {
        const boundaries = this.getBoundaries(),
            boundariesSet = new Set(boundaries);
        for (const line of boundariesSet.values()) {
            const lineX1 = line[0],
                lineY1 = line[1],
                lineX2 = line[2],
                lineY2 = line[3];
            for (const line2 of boundariesSet.values()) {
                const line2X1 = line2[0],
                    line2Y1 = line2[1],
                    line2X2 = line2[2],
                    line2Y2 = line2[3];
                if (lineX1 === line2X2 && lineY1 === line2Y2 &&
                    lineX2 === line2X1 && lineY2 === line2Y1) {
                    //remove double lines
                    boundariesSet.delete(line);
                    boundariesSet.delete(line2);
                }
                if (lineX2 === line2X1 && lineY2 === line2Y1 && (lineX1 === line2X2 || lineY1 === line2Y2)) {
                    //merge lines
                    line2[0] = lineX1;
                    line2[1] = lineY1;
                    boundariesSet.delete(line);
                }
            }
        }

        this.#boundaries = Array.from(boundariesSet);
        boundariesSet.clear();
    }

    /**
     * 
     * @returns {Array}
     */
    getBoundaries() {
        return this.#boundaries;
    }

    /**
     * @type {Array<Number>}
     */
    get canvasDimensions() {
        return [this.#viewWidth, this.#viewHeight];
    }

    /**
     * @type {Array<Number>}
     */
    get worldDimensions() {
        return [this.#worldWidth, this.#worldHeight];
    }
    
    /**
     * @type {Array<Number>}
     */
    get worldOffset() {
        return [this.#xOffset, this.#yOffset];
    }

    /**
     * @type {Array<Number>}
     */
    get mapCenter() {
        return [this.#centerX, this.#centerY];
    }

    /**
     * @type {Number}
     */
    get mapRotate() {
        return this.#rotate;
    }

    /**
     * @method
     * @param {Number} x 
     * @param {Number} y 
     */
    centerCameraPosition = (x, y) => {
        let [mapOffsetX, mapOffsetY] = this.worldOffset;
        const [canvasWidth, canvasHeight] = this.canvasDimensions,
            [mapWidth, mapHeight] = this.worldDimensions,
            halfScreenWidth = canvasWidth/2,
            halfScreenHeight = canvasHeight/2,
            currentCenterX = halfScreenWidth - mapOffsetX,
            currentCenterY = halfScreenHeight - mapOffsetY;
        if (currentCenterX < x) {
            if (x < mapWidth - halfScreenWidth) {
                const newXOffset = x - halfScreenWidth;
                if (newXOffset >= 0)
                    this.#xOffset = Math.round(newXOffset);
            } else if (mapWidth > canvasWidth) {
                const newXOffset = mapWidth - canvasWidth;
                this.#xOffset = Math.round(newXOffset);
            }
        }
        if (currentCenterY < y) {
            if (y < mapHeight - halfScreenHeight) {
                const newYOffset = y - halfScreenHeight;
                if (newYOffset >= 0)
                    this.#yOffset = Math.round(newYOffset);
            } else if (mapHeight > canvasHeight) {
                const newYOffset = mapHeight - canvasHeight;
                this.#yOffset = Math.round(newYOffset);
            }
        }

        this.#centerX = x;
        this.#centerY = y;
        //Logger.debug("center camera position, offset: ", this.worldOffset);
        //Logger.debug("center: ", this.mapCenter);   
    }

    personRotatedCenterCamera = (x, y, rotationAngle) => {
        console.log("new centering algorithm");
        /*
        let [mapOffsetX, mapOffsetY] = this.worldOffset;
        const [canvasWidth, canvasHeight] = this.canvasDimensions,
            [mapWidth, mapHeight] = this.worldDimensions,
            halfScreenWidth = canvasWidth/2,
            halfScreenHeight = canvasHeight/2,
            currentCenterX = halfScreenWidth - mapOffsetX,
            currentCenterY = halfScreenHeight - mapOffsetY;
        if (currentCenterX < x) {
            if (x < mapWidth - halfScreenWidth) {
                const newXOffset = x - halfScreenWidth;
                if (newXOffset >= 0)
                    this.#xOffset = Math.round(newXOffset);
            } else if (mapWidth > canvasWidth) {
                const newXOffset = mapWidth - canvasWidth;
                this.#xOffset = Math.round(newXOffset);
            }
        }
        if (currentCenterY < y) {
            if (y < mapHeight - halfScreenHeight) {
                const newYOffset = y - halfScreenHeight;
                if (newYOffset >= 0)
                    this.#yOffset = Math.round(newYOffset);
            } else if (mapHeight > canvasHeight) {
                const newYOffset = mapHeight - canvasHeight;
                this.#yOffset = Math.round(newYOffset);
            }
        }

        this.#centerX = x;
        this.#centerY = y;
        Logger.debug("center camera position, offset: ", this.worldOffset);
        Logger.debug("center: ", this.mapCenter);   
        */
    }
}

/***/ }),

/***/ "./src/base/System.js":
/*!****************************!*\
  !*** ./src/base/System.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "System": () => (/* binding */ System)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _ScreenPage_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ScreenPage.js */ "./src/base/ScreenPage.js");
/* harmony import */ var _SystemInterface_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SystemInterface.js */ "./src/base/SystemInterface.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");





/**
 * A main app class, <br>
 * Holder class for ScreenPage,<br>
 * can register new ScreenPages,<br>
 * init and preload data for them,<br>
 */
class System {
    #registeredPages;
    #system;
    /**
     * @param {SystemSettings} systemSettings - holds system settings
     * @param {HTMLDivElement} [canvasContainer] - If it is not passed, system will create div element and attach it to body
     */
    constructor(systemSettings, canvasContainer) {
        if (!systemSettings) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#registeredPages = new Map();

        if (!canvasContainer) {
            canvasContainer = document.createElement("div");
            document.body.appendChild(canvasContainer);
        }

        this.#system = new _SystemInterface_js__WEBPACK_IMPORTED_MODULE_3__.SystemInterface(systemSettings, canvasContainer, this.#registeredPages);
    }

    /**
     * @type {SystemInterface}
     */
    get system() {
        return this.#system;
    }

    /**
     * A main factory method for create ScreenPage instances, <br>
     * register them in a System and call ScreenPage.register() stage
     * @param {String} screenPageName
     * @param {ScreenPage} screen 
     */
    registerPage(screenPageName, screen) {
        if (screenPageName && typeof screenPageName === "string" && screenPageName.trim().length > 0) {
            const page = new screen();
            page._register(screenPageName, this.system);
            this.#registeredPages.set(screenPageName, page);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "valid class name should be provided");
        }
    }

    /**
     * Preloads assets for all registered pages
     * @return {Promise}
     */
    preloadAllData() {
        const promises = [];
        for (const key of this.#registeredPages.keys()) {
            promises.push(this.preloadPageData(key));
        }
        return Promise.all(promises);
    }

    /**
     * Preloads assets data for specific page
     * @param {String} screenPageName
     * @return {Promise}
     */
    preloadPageData(screenPageName) {
        return this.#registeredPages.get(screenPageName)._loadPageAssets();
    }
}

/***/ }),

/***/ "./src/base/SystemAudioInterface.js":
/*!******************************************!*\
  !*** ./src/base/SystemAudioInterface.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemAudioInterface": () => (/* binding */ SystemAudioInterface)
/* harmony export */ });
/* harmony import */ var assetsm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! assetsm */ "./node_modules/assetsm/dist/assetsm.min.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");




/**
 * An audio interface, <br>
 * controls all application audio,<br>
 * holds and retrieves audio, changes volume<br> 
 * accessible via ScreenPage.audio
 * @see {@link ScreenPage} a part of ScreenPage
 * @hideconstructor
 */
class SystemAudioInterface {
    #volume = 0.5;
    #audio = new Map();

    /**
     * Original track
     * @param {String} name 
     * @returns {HTMLAudioElement}
     */
    getAudio(name) {
        const audio = this.#audio.get(name);
        if (audio) {
            return audio;
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.WARNING_CODES.AUDIO_NOT_REGISTERED);
            return null;
        }
    }

    /**
     * Clone of original track
     * @param {String} name 
     * @returns {HTMLAudioElement}
     */
    getAudioCloned(name) {
        const audio = this.#audio.get(name).cloneNode();
        if (audio) {
            audio.volume = this.#volume;
            return audio;
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.WARNING_CODES.AUDIO_NOT_REGISTERED);
            return null;
        }
    }

    /**
     * Used to register audio in system after downloading
     * @param {String} name 
     * @param {AssetsManager} loader 
     */
    registerAudio(name, loader) {
        let mediaElement = this.#audio.get(name);
        if (!mediaElement) {
            const audioEl = loader.getAudio(name);
            if (!audioEl) {
                (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.ERROR_CODES.FILE_NOT_EXIST, "can't get audio," + name);
            }
            //mediaElement = this.#audioContext.createMediaElementSource(audioEl);
            audioEl.volume = this.#volume;
            mediaElement = audioEl;
            this.#audio.set(name, mediaElement);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_1__.WARNING_CODES.AUDIO_ALREADY_REGISTERED, "");
        }
    }

    set volume(value) {
        this.#volume = value;
        this.#updateTracksVolumes(value);
    }
    /**
     * Used to set or get audio volume, 
     * value should be from 0 to 1
     * @type {Number}
     */
    get volume() {
        return this.#volume;
    }

    #updateTracksVolumes(value) {
        for (const track of this.#audio.values()) {
            track.volume = value;
        }
    }
}

/***/ }),

/***/ "./src/base/SystemInterface.js":
/*!*************************************!*\
  !*** ./src/base/SystemInterface.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemInterface": () => (/* binding */ SystemInterface)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _SystemSocketConnection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SystemSocketConnection.js */ "./src/base/SystemSocketConnection.js");
/* harmony import */ var _SystemAudioInterface_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SystemAudioInterface.js */ "./src/base/SystemAudioInterface.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../configs.js */ "./src/configs.js");





/**
 * Public interface for a System<br>
 * Can be used to start/stop ScreenPage render, <br>
 * And provides access to SystemSettings, SystemSocketConnection and SystemAudioInterface <br>
 * accessible via ScreenPage.system and System.system
 * @see {@link System} a part of System class instance
 * @see {@link ScreenPage} a part of ScreenPage class instance
 */
class SystemInterface {
    #systemSettings;
    #canvasContainer;
    #registeredPages;
    #systemServerConnection;
    #systemAudioInterface;

    /**
     * @hideconstructor
     */
    constructor(systemSettings, canvasContainer, registeredPages) {
        if (!systemSettings) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
        this.#canvasContainer = canvasContainer;
        this.#registeredPages = registeredPages;
        this.#systemAudioInterface = new _SystemAudioInterface_js__WEBPACK_IMPORTED_MODULE_3__.SystemAudioInterface();
        this.#systemServerConnection = new _SystemSocketConnection_js__WEBPACK_IMPORTED_MODULE_2__.SystemSocketConnection(systemSettings);
    }

    /**
     * @type { SystemSocketConnection }
     */
    get network () {
        return this.#systemServerConnection;
    }

    /**
     * @type { SystemSettings }
     */
    get systemSettings() {
        return this.#systemSettings;
    }

    /**
     * @type { SystemAudioInterface }
     */
    get audio() {
        return this.#systemAudioInterface;
    }

    /**
     * @method
     * @param {String} screenPageName
     * @param {Object} [options] - options
     */
    startScreenPage = (screenPageName, options) => {
        if (this.#registeredPages.has(screenPageName)) {
            const page = this.#registeredPages.get(screenPageName);
            if (page.isInitiated === false) {
                page._init();
            }
            page._attachViewsToContainer(this.#canvasContainer);
            page._start(options);
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };

    /**
     * @method
     * @param {String} screenPageName
     */
    stopScreenPage = (screenPageName) => {
        if (this.#registeredPages.has(screenPageName)) {
            this.#registeredPages.get(screenPageName)._stop();
        } else {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.VIEW_NOT_EXIST, "View " + screenPageName + " is not registered!");
        }
    };
}

/***/ }),

/***/ "./src/base/SystemSocketConnection.js":
/*!********************************************!*\
  !*** ./src/base/SystemSocketConnection.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemSocketConnection": () => (/* binding */ SystemSocketConnection)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! socket.io-client */ "./node_modules/socket.io-client/build/esm/index.js");
/* harmony import */ var _Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Logger.js */ "./src/base/Logger.js");
/* harmony import */ var _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Events/SystemEvent.js */ "./src/base/Events/SystemEvent.js");






/**
 * Represents Socket connection
 */
class SystemSocketConnection extends EventTarget {
    #systemSettings;
    #socket;

    /**
     * @hideconstructor
     */
    constructor(systemSettings) {
        super();
        if (!systemSettings) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_1__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.CREATE_INSTANCE_ERROR, "systemSettings should be passed to class instance");
        }
        this.#systemSettings = systemSettings;
    }

    init() {
        this.#socket = (0,socket_io_client__WEBPACK_IMPORTED_MODULE_2__.io)(this.#systemSettings.network.address, {withCredentials: true});
        
        this.#registerSocketListeners();
    }

    get isServerConnected () {
        if (this.#socket && this.#socket.connected) {
            return true;
        } else {
            return false;
        }
    }
    
    get playerId() {
        return this.#socket.id;
    }

    sendGatherRoomsInfo() {
        this.#socket.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.ROOMS_INFO_REQUEST);
    }

    sendCreateOrJoinRoom(roomName, map) {
        this.#socket.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.CREATE_OR_JOIN, roomName , map);
    }

    sendMessage(message) {
        this.#socket.emit(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.CLIENT_SERVER.CLIENT_MESSAGE, message);
    }

    #onConnect = () => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("connected, socket id: " + this.#socket.id);
        this.dispatchEvent(new Event(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CONNECTION_STATUS_CHANGED));
    };

    #onDisconnect = (reason) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("server disconnected, reason: " + reason);
        this.dispatchEvent(new Event(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CONNECTION_STATUS_CHANGED));
    };

    #onData = (event) => {
        console.warn("server data: ", event);
    };

    #onMessage = (message) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("received new message from server: " + message);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_4__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.SERVER_MESSAGE, message));
    };

    #onRoomsInfo = (rooms) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("received roomsInfo " + rooms);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_4__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.ROOMS_INFO, rooms));
    };

    #onCreateNewRoom = (room, map) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("CLIENT SOCKET: Created room  " + room);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_4__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.CREATED, {room, map}));
    };

    #onRoomIsFull = (room) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("CLIENT SOCKET: Room is full, can't join: " + room);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_4__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.FULL, {room}));
    };

    #onJoinedToRoom = (room, map) => {
        _Logger_js__WEBPACK_IMPORTED_MODULE_3__.Logger.debug("CLIENT SOCKET: Joined to room: " + room, ", map: ", map);
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_4__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.JOINED, {room, map}));
    };

    #onUnjoinedFromRoom = (playerId) => {
        this.dispatchEvent(new _Events_SystemEvent_js__WEBPACK_IMPORTED_MODULE_4__.SystemEvent(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT.DISCONNECTED, {playerId}));
    }

    #registerSocketListeners() {
        this.#socket.on("connect", this.#onConnect);
        this.#socket.on("disconnect", this.#onDisconnect);
        this.#socket.on("data", this.#onData);

        this.#socket.on("roomsInfo", this.#onRoomsInfo);
    
        this.#socket.on("created", this.#onCreateNewRoom);
    
        this.#socket.on("full", this.#onRoomIsFull);
    
        this.#socket.on("joined", this.#onJoinedToRoom);
    
        this.#socket.on("log", function(array) {
            console.log.apply(console, array);
        });
    
        this.#socket.on("message", this.#onMessage);
    
        this.#socket.on("removed", function(message) {
            console.log("removed message");
            console.log(message);
        });

        this.#socket.on("disconnected", this.#onUnjoinedFromRoom);

        addEventListener("beforeunload", this.#disconnect);
    }

    #disconnect = () => {
        this.#socket.disconnect();
    }

    #isServerEventExist(eventValue) {
        let isExist = false;
        if (Object.values(_constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.EVENTS.WEBSOCKET.SERVER_CLIENT).find(eventVal => eventVal === eventValue)) {
            isExist = true;
        }
        return isExist;
    }
}

/***/ }),

/***/ "./src/base/WebGlDrawProgramData.js":
/*!******************************************!*\
  !*** ./src/base/WebGlDrawProgramData.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebGlDrawProgramData": () => (/* binding */ WebGlDrawProgramData)
/* harmony export */ });
class WebGlDrawProgramData {
    /**
     * @type {String}
     */
    #programName;
    /**
     * @type {Number[]}
     */
    #vectors;
    /**
     * @type {Number[]}
     */ 
    #textures;
    /**
     * @type {}
     */ 
    #image;
    /**
     * @type {String}
     */ 
    #imageName;
    /**
     * @type {String[]}
     */
    #drawMask;
    /**
     * @type {Number}
     */ 
    #rotation;
    /**
     * @type {Number[]}
     */ 
    #translation;
    /**
     * @type {Number[]}
     */ 
    #scale;
    /**
     * @type {Number}
     */ 
    #programVerticesNum;

    constructor(programName, vectors, textures, image, imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0,0], scale = [1, 1]) {
        this.#programName = programName;
        this.#vectors = vectors;
        this.#textures = textures;
        this.#image = image;
        this.#imageName = imageName;
        this.#drawMask = drawMask;
        this.#rotation = rotation;
        this.#translation = translation;
        this.#scale = scale;
        this.#programVerticesNum = vectors.length / 2; 
    }

    get programName() {
        return this.#programName;
    }
    
    get vectors() {
        return this.#vectors;
    }
    
    get textures() {
        return this.#textures;
    }
    
    get image() {
        return this.#image;
    }
    
    get imageName() {
        return this.#imageName;
    }
    
    get drawMask() {
        return this.#drawMask;
    }
    
    get rotation() {
        return this.#rotation;
    }
    
    get translation() {
        return this.#translation;
    }
    
    get scale() {
        return this.#scale;
    }

    get programVerticesNum() {
        return this.#programVerticesNum;
    }
    
    isProgramDataCanBeMerged(imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0,0], scale = [1, 1]) {

        if (this.imageName === imageName 
            && this.drawMask[0] === drawMask[0] 
            && this.drawMask[1] === drawMask[1]
            && this.rotation === rotation
            && this.translation[0] === translation[0]
            && this.translation[1] === translation[1]
            && this.scale[0] === scale[0]
            && this.scale[1] === scale[1]) {
            return true;
        } else {
            return false;
        }
    }
    
    mergeProgramData(vectors, textures) {
        this.#vectors.push(...vectors);
        this.#textures.push(...textures);
        this.#programVerticesNum = this.#vectors.length / 2; 
    }

}


/***/ }),

/***/ "./src/base/WebGlInterface.js":
/*!************************************!*\
  !*** ./src/base/WebGlInterface.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebGlInterface": () => (/* binding */ WebGlInterface)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./src/constants.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./src/utils.js");
/* harmony import */ var _Exception_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Exception.js */ "./src/base/Exception.js");
/* harmony import */ var _WebGlDrawProgramData_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./WebGlDrawProgramData.js */ "./src/base/WebGlDrawProgramData.js");





class WebGlInterface {
    #vertexShaderSource;
    #fragmentShaderSource;
    /**
     * @type {Map<String, WebGLProgram>}
     */
    #programs;
    /**
     * @type {Map<String, WebGLProgram>}
     */
    #programsData;
    /**
     * @type {WebGlDrawProgramData[]}
     */
    #coordsLocations;
    /**
     * @type {Map<String, ArrayBuffer>}
     */
    #buffers;
    /**
     * @type {Number}
     */
    #verticesNumber;
    /**
     * @type {WebGLRenderingContext}
     */
    #gl;
    /**
     * @type {boolean}
     */
    #debug;
    /**
     * @param  {Map<String, Number>}
     */
    #images_bind;
    /**
     * @param {Map<String, WebGLBuffer>}
     */
    #positionBuffer;
    /**
     * @param {Map<String, WebGLBuffer>}
     */
    #texCoordBuffer;

    constructor(context, debug) {
        if (!context || !(context instanceof WebGLRenderingContext)) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.UNEXPECTED_INPUT_PARAMS, " context parameter should be specified and equal to WebGLRenderingContext");
        }
        
        this.#gl = context;
        this.#debug = debug;
        this.#programs = new Map();
        this.#programsData = [];
        this.#coordsLocations = new Map();
        this.#images_bind = new Map();
        this.#buffers = [];
        this.#verticesNumber = 0;
        this.#positionBuffer = this.#gl.createBuffer();
        this.#texCoordBuffer = this.#gl.createBuffer();
    }

    _fixCanvasSize(width, height) {
        this.#gl.viewport(0, 0, width, height);
    }

    _initiateImagesDrawProgram() {
        this.#vertexShaderSource = `
        attribute vec2 a_texCoord;

        attribute vec2 a_position;

        uniform vec2 u_translation;
        uniform float u_rotation;
        uniform vec2 u_scale;

        uniform vec2 u_resolution;

        varying vec2 v_texCoord;

        void main(void) {
            float c = cos(-u_rotation);
            float s = sin(-u_rotation);

            mat3 translationMatrix1 = mat3(
                1, 0, 0,
                0, 1, 0,
                u_translation.x, u_translation.y, 1
            );

            mat3 translationMatrix2 = mat3(
                1, 0, 0,
                0, 1, 0,
                -u_translation.x, -u_translation.y, 1
            );
            
            mat3 rotationMatrix = mat3(
                c, -s, 0,
                s, c, 0,
                0, 0, 1
            );

            mat3 scalingMatrix = mat3(
                u_scale.x, 0, 0,
                0, u_scale.y, 0,
                0, 0, 1
            );

            mat3 matrix = translationMatrix1 * rotationMatrix * translationMatrix2 * scalingMatrix;
            //Scale
            // vec2 scaledPosition = a_position * u_scale;
            // Rotate the position
            // vec2 rotatedPosition = vec2(
            //    scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
            //    scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
            //);
            
            //vec2 position = rotatedPosition + u_translation;
            vec2 position = (matrix * vec3(a_position, 1)).xy;

            //convert position from pixels to 0.0 to 1.0
            vec2 zeroToOne = position / u_resolution;

            //convert from 0->1 to 0->2
            vec2 zeroToTwo = zeroToOne * 2.0;

            //convert from 0->2 to -1->+1
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            
            v_texCoord = a_texCoord;
        }
        `;
        this.#fragmentShaderSource = `
        precision mediump float;

        uniform sampler2D u_image;

        //texCoords passed in from the vertex shader
        varying vec2 v_texCoord;

        void main() {
            vec4 color = texture2D(u_image, v_texCoord);
            gl_FragColor = color;
        }
        `;
        const program = this.#initProgram(),
            programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES;

        this.#setProgram(programName, program);

        const gl = this.#gl,
            translationLocation = gl.getUniformLocation(program, "u_translation"),
            rotationRotation = gl.getUniformLocation(program, "u_rotation"),
            scaleLocation = gl.getUniformLocation(program, "u_scale"),
            resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"),
            positionAttributeLocation = gl.getAttribLocation(program, "a_position"),
            texCoordLocation = gl.getAttribLocation(program, "a_texCoord"),
            u_imageLocation = gl.getUniformLocation(program, "u_image");

        gl.enable(gl.BLEND);
        // turn attribute on

        this.#coordsLocations.set(programName, {
            translationLocation,
            rotationRotation,
            scaleLocation,
            resolutionUniformLocation,
            positionAttributeLocation,
            texCoordLocation,
            u_imageLocation
        });
        return Promise.resolve();
    }

    _initPrimitivesDrawProgram() {
        this.#vertexShaderSource = `
        attribute vec2 a_position;

        uniform vec2 u_translation;
        uniform float u_rotation;
        uniform vec2 u_scale;

        uniform vec2 u_resolution;

        void main(void) {
            float c = cos(-u_rotation);
            float s = sin(-u_rotation);

            mat3 translationMatrix1 = mat3(
                1, 0, 0,
                0, 1, 0,
                u_translation.x, u_translation.y, 1
            );

            //mat3 translationMatrix2 = mat3(
            //    1, 0, 0,
            //    0, 1, 0,
            //    -u_translation.x, -u_translation.y, 1
            //);
            
            mat3 rotationMatrix = mat3(
                c, -s, 0,
                s, c, 0,
                0, 0, 1
            );

            mat3 scalingMatrix = mat3(
                u_scale.x, 0, 0,
                0, u_scale.y, 0,
                0, 0, 1
            );

            //mat3 matrix = translationMatrix1 * rotationMatrix * translationMatrix2 * scalingMatrix;

            mat3 matrix = translationMatrix1 * rotationMatrix * scalingMatrix;

            //Scale
            // vec2 scaledPosition = a_position * u_scale;
            // Rotate the position
            // vec2 rotatedPosition = vec2(
            //    scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
            //    scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
            //);
            
            //vec2 position = rotatedPosition + u_translation;
            vec2 position = (matrix * vec3(a_position, 1)).xy;

            //convert position from pixels to 0.0 to 1.0
            vec2 zeroToOne = position / u_resolution;

            //convert from 0->1 to 0->2
            vec2 zeroToTwo = zeroToOne * 2.0;

            //convert from 0->2 to -1->+1
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        }
        `;
        this.#fragmentShaderSource = `
        precision mediump float;

        uniform vec4 u_color;
        void main(void) {
            gl_FragColor = u_color;
        }
        `;
        const program = this.#initProgram(),
            programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES;
        this.#setProgram(programName, program);

        const gl = this.#gl,
            translationLocation = gl.getUniformLocation(program, "u_translation"),
            rotationRotation = gl.getUniformLocation(program, "u_rotation"),
            scaleLocation = gl.getUniformLocation(program, "u_scale"),
            resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"),
            colorUniformLocation = gl.getUniformLocation(program, "u_color"),
            positionAttributeLocation = gl.getAttribLocation(program, "a_position");

        this.#coordsLocations.set(programName, {
            translationLocation,
            rotationRotation,
            scaleLocation,
            resolutionUniformLocation,
            colorUniformLocation,
            positionAttributeLocation
        });
        return Promise.resolve();
    }
    
    _bindTileImages(vectors, textures, image, imageName, drawMask = ["SRC_ALPHA", "ONE_MINUS_SRC_ALPHA"], rotation = 0, translation = [0, 0], scale = [1, 1]) {
        return new Promise((resolve) => {
            const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
                existingProgramData = this.#programsData.filter((data) => data.programName === programName);
                
            let isProgramDataMerged = false;

            for(let i = 0; i < existingProgramData.length; i++) {
                const data = existingProgramData[i];
                if (data.isProgramDataCanBeMerged(imageName, drawMask)) {
                    data.mergeProgramData(vectors, textures);
                    isProgramDataMerged = true;
                }
            }

            if (!isProgramDataMerged) {
                this.#programsData.push(new _WebGlDrawProgramData_js__WEBPACK_IMPORTED_MODULE_3__.WebGlDrawProgramData(programName, vectors, textures, image, imageName, drawMask, rotation, translation, scale));
            }

            resolve();
        });
    }
    
    _executeTileImagesDraw() {
        return new Promise((resolve) => {
            const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
                program = this.#getProgram(programName),
                { translationLocation,
                    rotationRotation,
                    scaleLocation,
                    resolutionUniformLocation,
                    positionAttributeLocation,
                    texCoordLocation,
                    u_imageLocation } = this.#coordsLocations.get(programName),
                gl = this.#gl,
                programsData = this.#programsData.filter(programData => programData.programName === programName);
                
            gl.useProgram(program);

            for (let i = 0; i < programsData.length; i++) {
                const data = programsData[i];
                // set the resolution
                gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
                gl.uniform2f(translationLocation, data.translation[0], data.translation[1]);
                gl.uniform2f(scaleLocation, data.scale[0], data.scale[1]);
                gl.uniform1f(rotationRotation, data.rotation);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vectors), gl.STATIC_DRAW);

                gl.enableVertexAttribArray(positionAttributeLocation);
                //Tell the attribute how to get data out of positionBuffer
                const size = 2,
                    type = gl.FLOAT, // data is 32bit floats
                    normalize = false,
                    stride = 0, // move forward size * sizeof(type) each iteration to get next position
                    offset = 0; // start of beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                //textures buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.textures), gl.STATIC_DRAW);

                gl.enableVertexAttribArray(texCoordLocation);
                gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, offset);

                let bind_number  = this.#images_bind.get(data.imageName);

                if (!bind_number ) {
                    bind_number  = this.#images_bind.size + 1;
                    gl.activeTexture(gl["TEXTURE" + bind_number]);
                    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data.image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    this.#images_bind.set(data.imageName, bind_number);
                } else {
                    gl.activeTexture(gl["TEXTURE" + bind_number]);
                }
                gl.uniform1i(u_imageLocation, bind_number);
                gl.blendFunc(gl[data.drawMask[0]], gl[data.drawMask[1]]);
                this.#verticesNumber = data.programVerticesNum;
                // Upload the image into the texture.
                this.#executeGlslProgram();
            }

            resolve();
        });
    }

    _bindAndDrawTileImages(vectors, textures, image, image_name, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
            program = this.#getProgram(programName),
            { translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                positionAttributeLocation,
                texCoordLocation,
                u_imageLocation } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vectors), gl.STATIC_DRAW);

        this.#verticesNumber += vectors.length / 2;
        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        //textures buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        let bind_number  = this.#images_bind.get(image_name);

        if (!bind_number ) {
            bind_number  = this.#images_bind.size + 1;

            gl.activeTexture(gl["TEXTURE" + bind_number]);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            this.#images_bind.set(image_name, bind_number);
        } else {
            gl.activeTexture(gl["TEXTURE" + bind_number]);
        }
        gl.uniform1i(u_imageLocation, bind_number );
        // make image transparent parts transparent
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // Upload the image into the texture.
        this.#executeGlslProgram();
    }

    _bindText(x, y, renderObject) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.IMAGES,
            program = this.#getProgram(programName),
            { translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                positionAttributeLocation,
                texCoordLocation,
                u_imageLocation } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        //@toDo: add additional info to the #images_bind and avoid this call, if image is already created
        const { boxWidth, boxHeight, ctx } = this.#createCanvasText(renderObject),
            texture = ctx.canvas,
            image_name = renderObject.text;

        y = y - boxHeight;

        const rotation = 0, 
            translation = [0, 0], 
            scale = [1, 1];
        const vecX1 = x,
            vecY1 = y,
            vecX2 = vecX1 + boxWidth,
            vecY2 = vecY1 + boxHeight;
        const verticesBufferData = [
                vecX1, vecY1,
                vecX2, vecY1,
                vecX1, vecY2,
                vecX1, vecY2,
                vecX2, vecY1,
                vecX2, vecY2
            ],
            texturesBufferData = [
                0, 0,
                1, 0,
                0, 1,
                0, 1,
                1, 0,
                1, 1
            ];

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesBufferData), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        //textures buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturesBufferData), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        this.#verticesNumber += 6;
        // remove box
        // fix text edges
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        //gl.depthMask(false);
        let bind_number = this.#images_bind.get(image_name);
        if (!bind_number) {
            bind_number  = this.#images_bind.size + 1;

            gl.activeTexture(gl["TEXTURE" + bind_number]);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            // As image properties such as text stroke changes, image_name still the same,
            // and image won't replaced
            //this.#images_bind.set(image_name, bind_number);
        } else {
            gl.activeTexture(gl["TEXTURE" + bind_number]);
        }
        gl.uniform1i(u_imageLocation, bind_number);
        //console.log("vertex attrib 1 :", gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING));
        this.#executeGlslProgram();
    }

    _bindPrimitives(renderObject, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { 
                translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation 
            } = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        switch (renderObject.type) {
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.RECTANGLE:
                this.#setSingleRectangle(renderObject.width, renderObject.height);
                this.#verticesNumber += 6;
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.TEXT:
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.CIRCLE:
                const coords = renderObject.vertices;
                gl.bufferData(this.#gl.ARRAY_BUFFER, 
                    new Float32Array(coords), this.#gl.STATIC_DRAW);
                this.#verticesNumber += coords.length / 2;
                break;
            case _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.DRAW_TYPE.POLYGON: {
                const triangles = this.#triangulatePolygon(renderObject.vertices);
                this.#bindPolygon(triangles);
                const len = triangles.length;
                if (len % 3 !== 0) {
                    (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygons ${renderObject.id}, vertices are not correct, skip drawing`);
                    return;
                }
                this.#verticesNumber += len / 2;
                break;
            }
        }
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(renderObject.bgColor);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        if (renderObject.blendFunc) {
            gl.blendFunc(renderObject.blendFunc[0], renderObject.blendFunc[1]);
        }
        if (renderObject.subtract) {
            gl.blendEquation(gl.FUNC_SUBTRACT);
        }
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //gl.disableVertexAttribArray(1);
        //}
        this.#executeGlslProgram(0, null, true);
    }

    _drawLines(linesArray, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
            
                translationLocation,
                rotationRotation,
                scaleLocation} = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER, 
            new Float32Array(linesArray),
            this.#gl.STATIC_DRAW);

        this.#verticesNumber += linesArray.length / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(color);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        gl.lineWidth(lineWidth);

        //gl.blendFunc(gl.ONE, gl.DST_COLOR );
        
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //    gl.disableVertexAttribArray(1);
        //}
        this.#executeGlslProgram(0, gl.LINES);
    }

    _drawPolygon(vertices, color, lineWidth = 1, rotation = 0, translation = [0, 0]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation,
            
                translationLocation,
                rotationRotation,
                scaleLocation} = this.#coordsLocations.get(programName),
            gl = this.#gl;

        gl.useProgram(program);
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, 1, 1);
        gl.uniform1f(rotationRotation, rotation);

        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        const triangles = this.#triangulatePolygon(vertices);
        
        const polygonVerticesNum = triangles.length;
        if (polygonVerticesNum % 3 !== 0) {
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Warning)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.WARNING_CODES.POLYGON_VERTICES_NOT_CORRECT, `polygon boundaries vertices are not correct, skip drawing`);
            return;
        }
        this.#bindPolygon(triangles);
        this.#verticesNumber += polygonVerticesNum / 2;
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const colorArray = this.#rgbaToArray(color);
        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);

        this.#executeGlslProgram(0, null);
    }

    _bindConus(renderObject, rotation = 0, translation = [0, 0], scale = [1, 1]) {
        const programName = _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.WEBGL.DRAW_PROGRAMS.PRIMITIVES,
            program = this.#getProgram(programName),
            { 
                translationLocation,
                rotationRotation,
                scaleLocation,
                resolutionUniformLocation,
                colorUniformLocation,
                positionAttributeLocation 
            } = this.#coordsLocations.get(programName),
            gl = this.#gl,
            coords = renderObject.vertices,
            fillStyle = renderObject.bgColor;
            
        gl.useProgram(program);
        
        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(translationLocation, translation[0], translation[1]);
        gl.uniform2f(scaleLocation, scale[0], scale[1]);
        gl.uniform1f(rotationRotation, rotation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer);

        gl.bufferData(this.#gl.ARRAY_BUFFER, 
            new Float32Array(coords), this.#gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionAttributeLocation);
        //Tell the attribute how to get data out of positionBuffer
        const size = 2,
            type = gl.FLOAT, // data is 32bit floats
            normalize = false,
            stride = 0, // move forward size * sizeof(type) each iteration to get next position
            offset = 0; // start of beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        this.#verticesNumber += coords.length / 2;

        if (renderObject.blendFunc) {
            gl.blendFunc(renderObject.blendFunc[0], renderObject.blendFunc[1]);
        }

        if (renderObject.subtract) {
            // cut bottom 
            gl.blendEquation(gl.FUNC_SUBTRACT);
            //gl.blendFunc( gl.ONE, gl.ONE );
            //gl.blendFunc(gl.ONE, gl.DST_COLOR);
        } //else {
            //gl.disable(gl.BLEND);
            // make transparent
            //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //}

        const colorArray = this.#rgbaToArray(fillStyle);

        gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
        
        //disable attribute which is not used in this program
        //if (gl.getVertexAttrib(1, gl.VERTEX_ATTRIB_ARRAY_ENABLED)) {
        //gl.disableVertexAttribArray(1);
        //}
        this.#executeGlslProgram(0, gl.TRIANGLE_FAN, true);
    }

    _clearView() {
        const gl = this.#gl;
        // Set clear color to black, fully opaque
        this.#programsData = [];
        gl.clearColor(0, 0, 0, 0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    #setProgram(name, program) {
        this.#programs.set(name, program);
    }

    #getProgram(name) {
        return this.#programs.get(name);
    }

    #bindPolygon(vertices) {
        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER, 
            new Float32Array(vertices),
            this.#gl.STATIC_DRAW);
    }

    #randomInt(range) {
        return Math.floor(Math.random() * range);
    } 

    #setSingleRectangle(width, height) {
        const x1 = 0,
            x2 = 0 + width,
            y1 = 0,
            y2 = 0 + height;
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, 
            new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2]), this.#gl.STATIC_DRAW);
    }
    
    #executeGlslProgram(offset = 0, primitiveType, resetEquation) {
        const primitiveTypeValue = primitiveType ? primitiveType : this.#gl.TRIANGLES,
            gl = this.#gl;
            
        const err = this.#debug ? gl.getError() : 0;
        if (err !== 0) {
            console.error(err);
            throw new Error("Error num: " + err);
        } else {
            gl.drawArrays(primitiveTypeValue, offset, this.#verticesNumber);
            this.#verticesNumber = 0;
            // set blend to default
            if (resetEquation) {
                gl.blendEquation(  gl.FUNC_ADD );
            }
        }
    }

    #initProgram() {
        const gl = this.#gl,
            program = gl.createProgram();

        gl.attachShader(program, this.#compileShader(this.#vertexShaderSource, gl.VERTEX_SHADER));
        gl.attachShader(program, this.#compileShader(this.#fragmentShaderSource, gl.FRAGMENT_SHADER));

        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, `Could not compile WebGL program. \n\n${info}`);
        }
        return program;
    }

    #createCanvasText(renderObject) {
        const ctx = document.createElement("canvas").getContext("2d");

        ctx.font = renderObject.font;
        renderObject.textMetrics = ctx.measureText(renderObject.text);
        const boxWidth = renderObject.boundariesBox.width, 
            boxHeight = renderObject.boundariesBox.height;
        ctx.canvas.width = boxWidth;
        ctx.canvas.height = boxHeight;
        ctx.font = renderObject.font;
        ctx.textBaseline = "bottom";// bottom
        if (renderObject.fillStyle) {
            ctx.fillStyle = renderObject.fillStyle;
            ctx.fillText(renderObject.text, 0, boxHeight);
        } 
        if (renderObject.strokeStyle) {
            ctx.strokeStyle = renderObject.strokeStyle;
            ctx.strokeText(renderObject.text, 0, boxHeight);
        }

        return { boxWidth, boxHeight, ctx };
    }

    #compileShader(shaderSource, shaderType) {
        const shader = this.#gl.createShader(shaderType);
        this.#gl.shaderSource(shader, shaderSource);
        this.#gl.compileShader(shader);

        if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
            const info = this.#gl.getShaderInfoLog(shader);
            (0,_Exception_js__WEBPACK_IMPORTED_MODULE_2__.Exception)(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_CODES.WEBGL_ERROR, "Couldn't compile webGl program. \n\n" + info);
        }
        return shader;
    }

    #rgbaToArray (rgbaColor) {
        return rgbaColor.replace("rgba(", "").replace(")", "").split(",").map((item) => Number(item.trim()));
    }

    #triangulatePolygon(vertices) {
        return this.#triangulate(vertices);
    }

    #triangulate (polygonVertices, triangulatedPolygon = []) {
        const len = polygonVertices.length,
            vectorsCS = (a, b, c) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.crossProduct)({x:c.x - a.x, y: c.y - a.y}, {x:b.x - a.x, y: b.y - a.y});

        if (len <= 3) {
            polygonVertices.forEach(vertex => {
                triangulatedPolygon.push(vertex.x);
                triangulatedPolygon.push(vertex.y);
            });
            return triangulatedPolygon;
        }
        const verticesSortedByY = [...polygonVertices].sort((curr, next) => next.y - curr.y);
        const topVertexIndex = polygonVertices.indexOf(verticesSortedByY[0]),
            startVertexIndex = topVertexIndex !== len - 1 ? topVertexIndex + 1 : 0;
        
        let processedVertices = polygonVertices,
            processedVerticesLen = processedVertices.length,
            skipCount = 0,
            i = startVertexIndex;
        
        while(processedVertices.length > 2) {
            // if overflowed, start from beginning
            const currLen = processedVertices.length;
            if (i >= currLen) {
                i -= currLen;
            }
    
            const prevVertex = i === 0 ? processedVertices[currLen - 1] : processedVertices[i - 1],
                currentVertex = processedVertices[i],
                nextVertex = currLen === i + 1 ? processedVertices[0] : processedVertices[i + 1];
    
            
            const cs = vectorsCS(prevVertex, currentVertex, nextVertex);
    
            if (cs < 0) {
                triangulatedPolygon.push(prevVertex.x);
                triangulatedPolygon.push(prevVertex.y);
                triangulatedPolygon.push(currentVertex.x);
                triangulatedPolygon.push(currentVertex.y);
                triangulatedPolygon.push(nextVertex.x);
                triangulatedPolygon.push(nextVertex.y);
                processedVertices = processedVertices.filter((val, index) => index !== i);
            } else {
                skipCount += 1;
                if (skipCount > processedVerticesLen) {
                    console.warn("Can\'t extract triangles. Probably vertices input is not correct");
                    return;
                }
            }
            i++;
        }
        
        return triangulatedPolygon;
    }
}

/***/ }),

/***/ "./src/configs.js":
/*!************************!*\
  !*** ./src/configs.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SystemSettings": () => (/* binding */ SystemSettings)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants.js */ "./src/constants.js");


/**
 * Settings object, should be passed as a parameter to System.constructor()
 */
const SystemSettings = {
    mode: _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.MODE.DEBUG,
    
    gameOptions: {
        library: _constants_js__WEBPACK_IMPORTED_MODULE_0__.CONST.LIBRARY.WEBGL,
        debugWebGl: false,
        debugMobileTouch: false,
        optimization: null,
        boundaries: {
            drawLayerBoundaries: false,
            drawObjectBoundaries: false,
            boundariesColor: "rgba(224, 12, 21, 1)",
            boundariesWidth: 2
        },
        render: {
            averageFPStime: 10000,
            minCircleTime: 16, //ms which is ~60 FPS
            mapBoundariesEnabled: true
        }
    },

    network: {
        address: "https://gameserver.reslc.ru:9009",
        gatherRoomsInfoInterval: 5000
    },

    canvasMaxSize: {
        width: 900,
        height: 960
    },

    worldSize: {
        width: 960,
        height: 960
    },

    defaultCanvasKey: "default"
}

/***/ }),

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CONST": () => (/* binding */ CONST),
/* harmony export */   "ERROR_CODES": () => (/* binding */ ERROR_CODES),
/* harmony export */   "WARNING_CODES": () => (/* binding */ WARNING_CODES)
/* harmony export */ });
const CONST = {
    MODE: {
        DEBUG: "DEBUG",
        PRODUCTION: "PRODUCTION"
    },
    SCREENS: {},
    AUDIO: {},
    CONNECTION_STATUS: {
        DISCONNECTED: "disconnected",
        CONNECTED: "connected",
        CONNECTION_LOST: "connection lost"
    },
    EVENTS: {
        SYSTEM: {
            START_PAGE:"START_PAGE",
            STOP_PAGE: "STOP_PAGE",
            RENDER: {
                START: "start",
                END: "end"
            }
        },
        GAME: {
            BOUNDARIES_COLLISION: "BOUNDARIES_COLLISION",
            OBJECTS_COLLISION: "OBJECTS_COLLISION"
        },
        WEBSOCKET: {
            SERVER_CLIENT: {
                CONNECTION_STATUS_CHANGED: "CONNECTION_STATUS_CHANGED",
                ROOMS_INFO: "roomsInfo",
                CREATED: "created",
                JOINED: "joined",
                FULL: "full",
                DISCONNECTED: "disconnected",
                SERVER_MESSAGE: "message",
                RESTARTED: "restarted",
            },
            CLIENT_SERVER: {
                ROOMS_INFO_REQUEST: "gatherRoomsInfo",
                CREATE_OR_JOIN: "create or join",
                RESTART_REQUEST: "restart",
                CLIENT_MESSAGE: "message"
            }
        }
    },
    WEBGL: {
        DRAW_PROGRAMS: {
            PRIMITIVES: "drawPrimitives",
            IMAGES: "drawImages"
        }
    },
    DRAW_TYPE: {
        RECTANGLE: "rect",
        CIRCLE: "circle",
        POLYGON: "polygon",
        LINE: "line",
        TEXT: "text",
        IMAGE: "image"
    },
    LAYERS: {
        DEFAULT: "default-view-layer",
        BOUNDARIES: "boundaries-view-layer"
    },
    GAME_OPTIONS: {},
    LIBRARY: {
        WEBGL: "webgl"
    },
    OPTIMIZATION: {
        WEB_ASSEMBLY: {
            ASSEMBLY_SCRIPT: "ASSEMBLY_SCRIPT",
            NATIVE_C: "NATIVE_C"
        }
    }
};

const ERROR_CODES = {
    CREATE_INSTANCE_ERROR: "CREATE_INSTANCE_ERROR",
    VIEW_NOT_EXIST: "VIEW_NOT_EXIST", 
    ELEMENT_NOT_EXIST: "ELEMENT_NOT_EXIST",
    FILE_NOT_EXIST: "FILE_NOT_EXIST",
    UNEXPECTED_INPUT_PARAMS: "UNEXPECTED_INPUT_PARAMS",
    UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
    UNHANDLED_PREPARE_EXCEPTION: "UNHANDLED_PREPARE_EXCEPTION",
    CANVAS_KEY_NOT_SPECIFIED: "CANVAS_KEY_NOT_SPECIFIED",
    CANVAS_WITH_KEY_NOT_EXIST: "CANVAS_WITH_KEY_NOT_EXIST",
    WRONG_TYPE_ERROR: "WRONG_TYPE_ERROR",
    UNEXPECTED_WS_MESSAGE: "UNEXPECTED_WS_MESSAGE",
    UNEXPECTED_PLAYER_ID: "UNEXPECTED_PLAYER_ID",
    UNEXPECTED_BULLET_ID: "UNEXPECTED_BULLET_ID",
    UNEXPECTED_EVENT_NAME: "UNEXPECTED_EVENT_NAME",
    WEBGL_ERROR: "WEBGL_ERROR",
    UNEXPECTED_TOUCH_AREA: "UNEXPECTED_TOUCH_AREA",
};

const WARNING_CODES =  {
    FILE_LOADING_ISSUE: "FILE_LOADING_ISSUE",
    ASSETS_NOT_READY: "ASSETS_NOT_READY",
    NOT_FOUND: "NOT_FOUND",
    NOT_TESTED: "NOT_TESTED",
    WORLD_DIMENSIONS_NOT_SET: "WORLD_DIMENSIONS_NOT_SET",
    UNHANDLED_DRAW_ISSUE: "UNHANDLED_DRAW_ISSUE",
    UNEXPECTED_WORLD_SIZE: "UNEXPECTED_WORLD_SIZE",
    AUDIO_ALREADY_REGISTERED: "AUDIO_ALREADY_REGISTERED",
    AUDIO_NOT_REGISTERED: "AUDIO_NOT_REGISTERED",
    POLYGON_VERTICES_NOT_CORRECT: "POLYGON_VERTICES_NOT_CORRECT"
};

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "angle_2points": () => (/* binding */ angle_2points),
/* harmony export */   "angle_3points": () => (/* binding */ angle_3points),
/* harmony export */   "arrayNumbersToVerticesArray": () => (/* binding */ arrayNumbersToVerticesArray),
/* harmony export */   "countClosestTraversal": () => (/* binding */ countClosestTraversal),
/* harmony export */   "countClosestTraversal2": () => (/* binding */ countClosestTraversal2),
/* harmony export */   "crossProduct": () => (/* binding */ crossProduct),
/* harmony export */   "dotProduct": () => (/* binding */ dotProduct),
/* harmony export */   "dotProductWithAngle": () => (/* binding */ dotProductWithAngle),
/* harmony export */   "generateUniqId": () => (/* binding */ generateUniqId),
/* harmony export */   "isLineShorter": () => (/* binding */ isLineShorter),
/* harmony export */   "isMobile": () => (/* binding */ isMobile),
/* harmony export */   "isPointCircleIntersect": () => (/* binding */ isPointCircleIntersect),
/* harmony export */   "isPointLineIntersect": () => (/* binding */ isPointLineIntersect),
/* harmony export */   "isPointOnTheLine": () => (/* binding */ isPointOnTheLine),
/* harmony export */   "isPointPolygonIntersect": () => (/* binding */ isPointPolygonIntersect),
/* harmony export */   "isPointRectIntersect": () => (/* binding */ isPointRectIntersect),
/* harmony export */   "isPolygonLineIntersect": () => (/* binding */ isPolygonLineIntersect),
/* harmony export */   "isSafari": () => (/* binding */ isSafari),
/* harmony export */   "pointToCircleDistance": () => (/* binding */ pointToCircleDistance)
/* harmony export */ });
/* harmony import */ var _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base/Primitives.js */ "./src/base/Primitives.js");


function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) ;
}

function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function pointToCircleDistance(x, y, circle) {
    const pointToCircleCenterDistance = new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(x, y, circle.x, circle.y).length;
    return pointToCircleCenterDistance - circle.r;
}

function countClosestTraversal(line, sight) {
    const x1 = sight.x1,
        y1 = sight.y1,
        x2 = sight.x2,
        y2 = sight.y2;
    const x3 = line.x1,
        y3 = line.y1,
        x4 = line.x2,
        y4 = line.y2;

    const r_px = x1,
        r_py = y1,
        r_dx = x2-x1,
        r_dy = y2-y1;

    const s_px = x3,
        s_py = y3,
        s_dx = x4-x3,
        s_dy = y4-y3;

    const r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy),
        s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
    if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag){
        return null;
    }

    const T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx),
        T1 = (s_px+s_dx*T2-r_px)/r_dx;

    if(T1<0 || isNaN(T1)) return null;
    if(T2<0 || T2>1) return null;

    return {
        x: r_px+r_dx*T1,
        y: r_py+r_dy*T1,
        p: T1
    };
}

function countClosestTraversal2(line1, line2) {
    const x1 = line2.x1,
        y1 = line2.y1,
        x2 = line2.x2,
        y2 = line2.y2;
    const x3 = line1.x1,
        y3 = line1.y1,
        x4 = line1.x2,
        y4 = line1.y2;

    const det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    // lines are parallel, or coincident
    if (det === 0){
        return;
    }
    let x = ((x1*y2 - y1*x2) * (x3 - x4) - (x1 - x2) * (x3*y4 - y3*x4)) / det;
    let y = ((x1*y2 - y1*x2) * (y3 - y4) - (y1 - y2) * (x3*y4 - y3*x4)) / det;
    const point = {x, y};
    
    if (isPointOnTheLine(point, line1, 0.0000000000001) && isPointOnTheLine(point, line2, 0.0000000000001)) {
        const p = Math.sqrt(Math.pow((x - x1), 2) + Math.pow((y - y1), 2));
        return {x, y, p};
    } else {
        return;
    }
}

function angle_2points(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function angle_3points(a, b, c) {
    const x1 = a.x - b.x,
        x2 = c.x - b.x,
        y1 = a.y - b.y,
        y2 = c.y - b.y,
        d1 = Math.sqrt(x1 * x1 + y1 * y1),
        d2 = Math.sqrt(x2 * x2 + y2 * y2);
    //console.log("angle: ", (Math.acos((x1* x2 + y1 * y2) / (d1 * d2))* 180) / Math.PI);
    return Math.acos((x1* x2 + y1 * y2) / (d1 * d2));
}

function dotProductWithAngle(lenA, lenB, angle) {
    return lenA * lenB * Math.cos(angle);
}

function dotProduct(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
}

function crossProduct(a, b) {
    return (a.x * b.y - b.x * a.y);
}

function isPointOnTheLine(point, line, m_error = 0) {
    return  (
                ((point.x >= (line.x1 - m_error)) && (point.x <= (line.x2 + m_error))) || 
                ((point.x <= (line.x1 + m_error)) && (point.x >= (line.x2 - m_error)))
            ) && (
                ((point.y >= (line.y1 - m_error)) && (point.y <= (line.y2 + m_error))) || 
                ((point.y <= (line.y1 + m_error)) && (point.y >= (line.y2 - m_error)))
            );
}

function isLineShorter(line1, line2) {
    return (new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line1.x1, line1.y1, line1.x2, line1.y2)).length < (new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line2.x1, line2.y1, line2.x2, line2.y2)).length;
}

function isPointLineIntersect(point, line) {
    const lineL = new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x1, line.y1, line.x2, line.y2).length,
        lengthAB = new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x1, line.y1, point.x, point.y).length + new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(line.x2, line.y2, point.x, point.y).length;

    if (lengthAB <= lineL + 0.2) {
        //Logger.debug("point to line intersect. line len: " + lineL + ", line AB len: " + lengthAB);
        return true;
    }
    return false;
}

function isPolygonLineIntersect(polygon, line) {
    const len = polygon.length;
    for (let i = 0; i < len; i+=1) {
        let curr = polygon[i],
            next = polygon[i+1];
        //if next item not exist and current is not first
        if (!next) {
            // if current vertex is not the first one
            if (!(curr.x === polygon[0].x && curr.y === polygon[0].y)) {
                next = polygon[0];
            } else {
                continue;
            }
        }
        const edge = { x1: curr.x, y1: curr.y, x2: next.x, y2: next.y };
        const intersection = countClosestTraversal2(edge, line);
        if (intersection) {
            return intersection;
        }
    }
    if (polygon[len-1] !== polygon[0]) {
        //check one last item
        const curr = polygon[len - 1],
            next = polygon[0];
        const edge = { x1: curr.x, y1: curr.y, x2: next.x, y2: next.y };
        const intersection = countClosestTraversal2(edge, line);
        if (intersection) {
            return intersection;
        }
    }
    return false;
}

function isPointPolygonIntersect(/*x, y, polygon*/) {
    //const vertices = polygon.vertices;

    return false;
}

function isPointRectIntersect(x, y, rect) {
    if (x >= rect.x && x <= rect.width + rect.x && y >= rect.y && y <= rect.y + rect.height) {
        return true;
    } else {
        return false;
    }
}

function isPointCircleIntersect(x, y, circle) {
    const radius = circle.width,
        lineToCircleCenter = new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vector(x, y, circle.x, circle.y),
        pointCircleLineLength = lineToCircleCenter.length;
    if (pointCircleLineLength < radius)
        return true;
    else
        return false;
}

function generateUniqId() {
    return Math.round(Math.random() * 1000000); 
}

function arrayNumbersToVerticesArray(array) {
    const len = array.length,
        vertices = [];
    for (let i = 0; i < len; i+=2) {
        const x = array[i],
            y = array[i + 1];
        vertices.push(new _base_Primitives_js__WEBPACK_IMPORTED_MODULE_0__.Vertex(x, y));
    }
    return vertices;
}



/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CONST": () => (/* reexport safe */ _constants_js__WEBPACK_IMPORTED_MODULE_5__.CONST),
/* harmony export */   "DrawImageObject": () => (/* reexport safe */ _base_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_2__.DrawImageObject),
/* harmony export */   "Primitives": () => (/* reexport module object */ _base_Primitives_js__WEBPACK_IMPORTED_MODULE_3__),
/* harmony export */   "ScreenPage": () => (/* reexport safe */ _base_ScreenPage_js__WEBPACK_IMPORTED_MODULE_1__.ScreenPage),
/* harmony export */   "System": () => (/* reexport safe */ _base_System_js__WEBPACK_IMPORTED_MODULE_0__.System),
/* harmony export */   "SystemSettings": () => (/* reexport safe */ _configs_js__WEBPACK_IMPORTED_MODULE_4__.SystemSettings),
/* harmony export */   "utils": () => (/* reexport module object */ _utils_js__WEBPACK_IMPORTED_MODULE_6__)
/* harmony export */ });
/* harmony import */ var _base_System_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base/System.js */ "./src/base/System.js");
/* harmony import */ var _base_ScreenPage_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base/ScreenPage.js */ "./src/base/ScreenPage.js");
/* harmony import */ var _base_DrawImageObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./base/DrawImageObject.js */ "./src/base/DrawImageObject.js");
/* harmony import */ var _base_Primitives_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./base/Primitives.js */ "./src/base/Primitives.js");
/* harmony import */ var _configs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./configs.js */ "./src/configs.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants.js */ "./src/constants.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils.js */ "./src/utils.js");









})();

var __webpack_exports__CONST = __webpack_exports__.CONST;
var __webpack_exports__DrawImageObject = __webpack_exports__.DrawImageObject;
var __webpack_exports__Primitives = __webpack_exports__.Primitives;
var __webpack_exports__ScreenPage = __webpack_exports__.ScreenPage;
var __webpack_exports__System = __webpack_exports__.System;
var __webpack_exports__SystemSettings = __webpack_exports__.SystemSettings;
var __webpack_exports__utils = __webpack_exports__.utils;
export { __webpack_exports__CONST as CONST, __webpack_exports__DrawImageObject as DrawImageObject, __webpack_exports__Primitives as Primitives, __webpack_exports__ScreenPage as ScreenPage, __webpack_exports__System as System, __webpack_exports__SystemSettings as SystemSettings, __webpack_exports__utils as utils };

//# sourceMappingURL=index.es6.js.map