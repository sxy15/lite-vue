var Vue = (function (exports) {
    'use strict';

    function normalizeClass(value) {
        var res = '';
        if (isString(value)) {
            res = value;
        }
        else if (isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var normalized = normalizeClass(value[i]);
                if (normalized) {
                    res += normalized + ' ';
                }
            }
        }
        else {
            for (var name_1 in value) {
                if (value[name_1]) {
                    res += name_1 + ' ';
                }
            }
        }
        return res.trim();
    }

    var isArray = Array.isArray;
    var isObject = function (value) {
        return value !== null && typeof value === 'object';
    };
    var hasChanged = function (value, oldValue) {
        return !Object.is(value, oldValue);
    };
    var isFunction = function (value) {
        return typeof value === 'function';
    };
    var isString = function (value) {
        return typeof value === 'string';
    };
    var extend = Object.assign;
    var EMPTY_OBJ = {};
    var onRE = /^on[^a-z]/;
    var isOn = function (key) { return onRE.test(key); };

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var createDep = function (effects) {
        var dep = new Set(effects);
        return dep;
    };

    var targetMap = new WeakMap();
    function effect(fn, options) {
        var _effect = new ReactiveEffect(fn);
        if (options) {
            extend(_effect, options); // 把 options 的scheduler添加到 _effect 上
        }
        if (!options || !options.lazy) {
            _effect.run();
        }
    }
    var activeEffect;
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn, scheduler) {
            if (scheduler === void 0) { scheduler = null; }
            this.fn = fn;
            this.scheduler = scheduler;
        }
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        ReactiveEffect.prototype.stop = function () {
        };
        return ReactiveEffect;
    }());
    function track(target, key) {
        if (!activeEffect)
            return;
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep); // 将当前的 activeEffect 添加到 dep 中
    }
    function trackEffects(dep) {
        dep.add(activeEffect);
    }
    function trigger(target, key, value) {
        var depsMap = targetMap.get(target);
        if (!depsMap)
            return;
        var dep = depsMap.get(key);
        if (!dep)
            return;
        triggerEffects(dep); // 依次执行 dep 中的 effect
    }
    function triggerEffects(dep) {
        var e_1, _a, e_2, _b;
        var effects = isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        try {
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effect_1 = effects_1_1.value;
                if (effect_1.computed) {
                    triggerEffect(effect_1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var effects_2 = __values(effects), effects_2_1 = effects_2.next(); !effects_2_1.done; effects_2_1 = effects_2.next()) {
                var effect_2 = effects_2_1.value;
                if (!effect_2.computed) {
                    triggerEffect(effect_2);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (effects_2_1 && !effects_2_1.done && (_b = effects_2.return)) _b.call(effects_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    function triggerEffect(effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }

    var get = createGetter();
    function createGetter() {
        return function get(target, key, receiver) {
            var res = Reflect.get(target, key, receiver);
            // track
            track(target, key);
            return res;
        };
    }
    var set = createSetter();
    function createSetter() {
        return function set(target, key, value, receiver) {
            var res = Reflect.set(target, key, value, receiver);
            // trigger
            trigger(target, key);
            return res;
        };
    }
    var mutableHandlers = {
        get: get,
        set: set,
    };

    var reactiveMap = new WeakMap();
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, baseHandlers, proxyMap) {
        var existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        var proxy = new Proxy(target, baseHandlers);
        proxy["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */] = true;
        proxyMap.set(target, proxy);
        return proxy;
    }
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };
    var isReactive = function (v) {
        return !!(v && v["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]);
    };

    function isRef(r) {
        return r ? r.__v_isRef === true : false;
    }
    function ref(val) {
        return createRef(val, false);
    }
    function createRef(rawValue, shallow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shallow);
    }
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v__isShallow) {
            this.__v__isShallow = __v__isShallow;
            this.dep = undefined;
            this.__v_isRef = true;
            this._rawValue = value;
            this._value = __v__isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            set: function (newVal) {
                if (hasChanged(newVal, this._rawValue)) {
                    this._rawValue = newVal;
                    this._value = toReactive(newVal);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    function triggerRefValue(ref) {
        if (ref.dep) {
            triggerEffects(ref.dep);
        }
    }

    var ComputedRefImpl = /** @class */ (function () {
        function ComputedRefImpl(getter) {
            var _this = this;
            this.dep = undefined;
            this.__v_isRef = true;
            this._dirty = true;
            this.effect = new ReactiveEffect(getter, function () {
                if (!_this._dirty) {
                    _this._dirty = true;
                    triggerRefValue(_this); // 触发的没有scheduler的effect
                }
            });
            this.effect.computed = this;
        }
        Object.defineProperty(ComputedRefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this); // 收集的没有scheduler的effect
                if (this._dirty) {
                    this._dirty = false;
                    this._value = this.effect.run(); // run的执行会让reactive 收集到带scheduler的effect
                }
                return this._value;
            },
            enumerable: false,
            configurable: true
        });
        return ComputedRefImpl;
    }());
    function computed(getterOrOptions) {
        var getter;
        var onlyGetter = isFunction(getterOrOptions);
        if (onlyGetter) {
            getter = getterOrOptions;
        }
        var cRef = new ComputedRefImpl(getter);
        return cRef;
    }

    var isFlushPending = false;
    var resolvedPromise = Promise.resolve();
    var pendingPreFlushCbs = [];
    function queuePreFlushCb(cb) {
        queueCb(cb, pendingPreFlushCbs);
    }
    function queueCb(cb, pendingQueue) {
        pendingQueue.push(cb);
        queuePreFlush();
    }
    function queuePreFlush() {
        if (!isFlushPending) {
            isFlushPending = true;
            resolvedPromise.then(flushJobs);
        }
    }
    function flushJobs() {
        isFlushPending = false;
        flushPreFlushCbs();
    }
    function flushPreFlushCbs() {
        if (pendingPreFlushCbs.length) {
            var activePreFlushCbs = __spreadArray([], __read(new Set(pendingPreFlushCbs)), false);
            pendingPreFlushCbs.length = 0;
            for (var i = 0; i < activePreFlushCbs.length; i++) {
                activePreFlushCbs[i]();
            }
        }
    }

    function watch(source, cb, options) {
        return doWatch(source, cb, options);
    }
    function doWatch(source, cb, _a) {
        var _b = _a === void 0 ? EMPTY_OBJ : _a, immediate = _b.immediate, deep = _b.deep;
        var getter;
        if (isReactive(source)) {
            getter = function () { return source; };
            deep = true;
        }
        else {
            getter = function () { };
        }
        if (cb && deep) {
            var baseGetter_1 = getter;
            getter = function () { return traverse(baseGetter_1()); };
        }
        var oldValue = {};
        var job = function () {
            if (cb) {
                var newValue = effect.run();
                if (deep || hasChanged(newValue, oldValue)) {
                    cb(newValue, oldValue);
                    oldValue = newValue;
                }
            }
        };
        var scheduler = function () { return queuePreFlushCb(job); };
        var effect = new ReactiveEffect(getter, scheduler);
        if (cb) {
            if (immediate) {
                job();
            }
            else {
                oldValue = effect.run();
            }
        }
        else {
            effect.run();
        }
        return function () {
            effect.stop();
        };
    }
    // 主动触发收集
    function traverse(value) {
        if (!isObject(value)) {
            return value;
        }
        for (var key in value) {
            traverse(value[key]);
        }
        return value;
    }

    var Fragment = Symbol('Fragment');
    var Text$1 = Symbol('Text');
    var Comment = Symbol('Comment');
    function isVNode(v) {
        return v ? v.__v_isVNode === true : false;
    }
    function createVNode(type, props, children) {
        if (props) {
            var klass = props.class; props.style;
            if (klass && !isString(klass)) {
                props.class = normalizeClass(klass);
            }
        }
        var shapeFlag = isString(type)
            ? 1 /* ShapeFlags.ELEMENT */
            : isObject(type)
                ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
                : 0;
        return createBaseVNode(type, props, children, shapeFlag);
    }
    function createBaseVNode(type, props, children, shapeFlag) {
        var vnode = {
            __v_isVNode: true,
            type: type,
            props: props,
            children: children,
            shapeFlag: shapeFlag
        };
        normalizeChildren(vnode, children);
        return vnode;
    }
    function normalizeChildren(vnode, children) {
        var type = 0;
        if (children == null) {
            children = null;
        }
        else if (isArray(children)) {
            type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
        }
        else if (typeof children === 'object') ;
        else if (isFunction(children)) ;
        else {
            // string 
            children = String(children);
            type = 8 /* ShapeFlags.TEXT_CHILDREN */;
        }
        vnode.children = children;
        vnode.shapeFlag |= type;
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }

    function h(type, propsOrChildren, children) {
        var l = arguments.length;
        if (l === 2) {
            if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
                if (isVNode(propsOrChildren)) {
                    return createVNode(type, null, [propsOrChildren]);
                }
                return createVNode(type, propsOrChildren);
            }
            else {
                // propsOrChildren is children
                return createVNode(type, null, propsOrChildren);
            }
        }
        else {
            if (l > 3) {
                children = Array.prototype.slice.call(arguments, 2);
            }
            else if (l === 3 && isVNode(children)) {
                children = [children];
            }
            return createVNode(type, propsOrChildren, children);
        }
    }

    function normalizeVNode(child) {
        if (typeof child === 'object') {
            return cloneIfMounted(child);
        }
        else {
            return createVNode(Text, null, String(child));
        }
    }
    /**
     * clone VNode
     */
    function cloneIfMounted(child) {
        return child;
    }

    function createRenderer(options) {
        return baseCreateRenderer(options);
    }
    function baseCreateRenderer(options) {
        var hostInsert = options.insert, hostPatchProp = options.patchProp, hostSetElementText = options.setElementText, hostCreateElement = options.createElement, hostRemove = options.remove, hostCreateText = options.createText, hostSetText = options.setText, hostCreateComment = options.createComment;
        var processFragment = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                mountChildren(newVNode.children, container, anchor);
            }
            else {
                patchChildren(oldVNode, newVNode, container);
            }
        };
        var processCommentNode = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                newVNode.el = hostCreateComment(newVNode.children);
                hostInsert(newVNode.el, container, anchor);
            }
            else {
                newVNode.el = oldVNode.el;
            }
        };
        var processText = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                newVNode.el = hostCreateText(newVNode.children);
                hostInsert(newVNode.el, container, anchor);
            }
            else {
                var el = (newVNode.el = oldVNode.el);
                if (newVNode.children !== oldVNode.children) {
                    hostSetText(el, newVNode.children);
                }
            }
        };
        var processElement = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                // 直接挂载
                mountElement(newVNode, container, anchor);
            }
            else {
                // 更新
                patchElement(oldVNode, newVNode);
            }
        };
        var mountElement = function (vnode, container, anchor) {
            var type = vnode.type, props = vnode.props, shapeFlag = vnode.shapeFlag;
            var el = (vnode.el = hostCreateElement(type));
            if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(el, vnode.children);
            }
            if (props) {
                for (var key in props) {
                    hostPatchProp(el, key, null, props[key]);
                }
            }
            hostInsert(el, container, anchor);
        };
        var patchElement = function (oldVNode, newVNode) {
            var el = (newVNode.el = oldVNode.el);
            var oldProps = oldVNode.props || EMPTY_OBJ;
            var newProps = newVNode.props || EMPTY_OBJ;
            patchChildren(oldVNode, newVNode, el);
            patchProps(el, newVNode, oldProps, newProps);
        };
        var mountChildren = function (children, container, anchor) {
            // 处理 Cannot assign to read only property '0' of string 'xxx'
            if (isString(children)) {
                children = children.split('');
            }
            for (var i = 0; i < children.length; i++) {
                var child = (children[i] = normalizeVNode(children[i]));
                console.log(child);
                patch(null, child, container, anchor);
            }
        };
        var patchChildren = function (oldVNode, newVNode, container, anchor) {
            var c1 = oldVNode && oldVNode.children;
            var prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0;
            var c2 = newVNode && newVNode.children;
            var shapeFlag = newVNode.shapeFlag;
            if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                if (c2 !== c1) {
                    // 挂载新子节点的文本
                    hostSetElementText(container, c2);
                }
            }
            else {
                if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) ;
                else {
                    if (prevShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                        // 移除旧的 children
                        hostSetElementText(container, '');
                    }
                }
            }
        };
        var patchProps = function (el, key, oldProps, newProps) {
            if (oldProps !== newProps) {
                for (var key_1 in newProps) {
                    var prev = oldProps[key_1];
                    var next = newProps[key_1];
                    if (prev !== next) {
                        hostPatchProp(el, key_1, prev, next);
                    }
                }
                // 移除旧的 & 不在新的 props 中的 props
                if (oldProps !== EMPTY_OBJ) {
                    for (var key_2 in oldProps) {
                        if (!(key_2 in newProps)) {
                            hostPatchProp(el, key_2, oldProps[key_2], null);
                        }
                    }
                }
            }
        };
        var patch = function (oldVNode, newVNode, container, anchor) {
            if (anchor === void 0) { anchor = null; }
            if (oldVNode === newVNode) {
                return;
            }
            if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
                unmount(oldVNode);
                oldVNode = null;
            }
            var type = newVNode.type, shapeFlag = newVNode.shapeFlag;
            switch (type) {
                case Text$1:
                    processText(oldVNode, newVNode, container, anchor);
                    break;
                case Comment:
                    processCommentNode(oldVNode, newVNode, container, anchor);
                    break;
                case Fragment:
                    processFragment(oldVNode, newVNode, container, anchor);
                    break;
                default:
                    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                        processElement(oldVNode, newVNode, container, anchor);
                    }
            }
        };
        var unmount = function (vnode) {
            hostRemove(vnode.el);
        };
        var render = function (vnode, container) {
            if (vnode === null) {
                // unmount
                if (container._vnode) {
                    unmount(container._vnode);
                }
            }
            else {
                patch(container._vnode || null, vnode, container);
            }
            container._vnode = vnode; // 把 vnode 保存为老的 vnode
        };
        return {
            render: render
        };
    }

    var doc = document;
    var nodeOps = {
        insert: function (child, parent, anchor) {
            parent.insertBefore(child, anchor || null);
        },
        createElement: function (tag) {
            var el = doc.createElement(tag);
            return el;
        },
        setElementText: function (el, text) {
            el.textContent = text;
        },
        remove: function (child) {
            var parent = child.parentNode;
            if (parent) {
                parent.removeChild(child);
            }
        },
        createText: function (text) {
            return doc.createTextNode(text);
        },
        setText: function (node, text) {
            node.nodeValue = text;
        },
        createComment: function (text) {
            return doc.createComment(text);
        }
    };

    function patchClass(el, value) {
        if (value === null) {
            el.removeAttribute('class');
        }
        else {
            el.className = value;
        }
    }

    function patchDomProp(el, key, value) {
        try {
            el[key] = value;
        }
        catch (e) { }
    }

    function patchAttr(el, key, value) {
        if (value == null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, value);
        }
    }

    function patchStyle(el, prev, next) {
        var style = el.style;
        var isCssString = isString(next);
        if (next && !isCssString) {
            for (var key in next) {
                setStyle(style, key, next[key]);
            }
            if (prev && !isString(prev)) {
                for (var key in prev) {
                    if (next[key] == null) {
                        setStyle(style, key, '');
                    }
                }
            }
        }
    }
    function setStyle(style, name, value) {
        style[name] = value;
    }

    function patchEvent(el, rawName, prevValue, nextValue) {
        var invokers = el._vei || (el._vei = {});
        var existingInvoker = invokers[rawName];
        if (nextValue && existingInvoker) {
            existingInvoker.value = nextValue;
        }
        else {
            var name_1 = parseName(rawName);
            if (nextValue) {
                var invoker = invokers[rawName] = createInvoker(nextValue);
                el.addEventListener(name_1, invoker);
            }
            else if (existingInvoker) {
                el.removeEventListener(name_1, existingInvoker);
                invokers[rawName] = undefined;
            }
        }
    }
    function parseName(name) {
        return name.slice(2).toLowerCase();
    }
    function createInvoker(initialValue) {
        var invoker = function (e) {
            invoker.value && invoker.value(e);
        };
        invoker.value = initialValue;
        return invoker;
    }

    var patchProp = function (el, key, prevValue, nextValue) {
        if (key === 'class') {
            patchClass(el, nextValue);
        }
        else if (key === 'style') {
            patchStyle(el, prevValue, nextValue);
        }
        else if (isOn(key)) {
            patchEvent(el, key, prevValue, nextValue);
        }
        else if (shouldSetAsProp(el, key)) {
            patchDomProp(el, key, nextValue);
        }
        else {
            patchAttr(el, key, nextValue);
        }
    };
    function shouldSetAsProp(el, key) {
        if (key === 'form') {
            return false;
        }
        if (key === 'list' && el.tagName === 'INPUT') {
            return false;
        }
        if (key === 'type' && el.tagName === 'TEXTAREA') {
            return false;
        }
        return key in el;
    }

    var renderer;
    var rendererOptions = extend({ patchProp: patchProp }, nodeOps);
    function ensureRenderer() {
        return renderer || (renderer = createRenderer(rendererOptions));
    }
    var render = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = ensureRenderer()).render.apply(_a, __spreadArray([], __read(args), false));
    };

    exports.Comment = Comment;
    exports.Fragment = Fragment;
    exports.Text = Text$1;
    exports.computed = computed;
    exports.effect = effect;
    exports.h = h;
    exports.queuePreFlushCb = queuePreFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.render = render;
    exports.watch = watch;

    return exports;

})({});
//# sourceMappingURL=vue.js.map
