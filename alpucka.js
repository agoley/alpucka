/**
 * ALPUCKAJS
 * alpucka is a lightweight JavaScript framework for common web interfaces. Compatible with most browsers.
 * 
 * DEPENDENCIES
 * 1. alpucka-animate
 * 
 */

// VARIABLES
var alpucka = {}; // Initialize the alpucka object.

// CLASSES
/**
 * 
 * @param { HTMLElement[] } mems - Members of the carousel. Each must share the same parent and have position set to absolute.
 * @param { number } milliseconds- Time to wait for each turn.
 * @param { Function } callback - Function to be called on each turn.
 * @param { boolean } auto - If true auto starts the carousel. Defaults to true.
 */
function AlCarousel(mems, milliseconds, callback, auto) {
    this.members = mems;
    this.callback = callback;
    this.milliseconds = milliseconds;
    this.auto = auto;

    this.currId = 0; // currId: number
    this.originalOffsetLeft = this.members[0].offsetLeft;
    this.isRunning = false;

    // CAROUSEL FUNCTIONS
    this.start = function () {
        if (this.isRunning || this.blurred) {
            return;
        }
        if (!alanimate) {
            console.error('alpucka: missing dependency alpucka-animate.js');
            return;
        }
        this.paused = false;
        this.isRunning = true;

        // Function to progress the carousel.
        var next = function () {

            if (that.paused || that.blurred) return; // Exit first if paused.

            var nextId = (that.currId == (that.members.length - 1)) ? 0 : (that.currId + 1);
            var currEl = that.members[that.currId];
            var nextEl = that.members[nextId];
            that.currId = nextId;

            if (!currEl) return;

            // Position the next Element to be animated.
            nextEl.style.top = currEl.clientTop + 'px';
            nextEl.style.left = currEl.clientWidth + 'px';
            nextEl.style.display = 'inline';

            // Animate the current and next Elements.
            alanimate.move(currEl, 'left', null, 2); // Moves the current element out of its container.
            alanimate.move(nextEl, 'left', null, 2); // Moves the next element into the container.

            var me = that;
            setTimeout(function () {
                if (!me.paused && !me.blurred) {
                    if (me.callback) me.callback(me); // Pass the object into the callback.
                    next.apply(me);
                } else {
                    me.isRunning = false;
                    return;
                }
            }, me.milliseconds);
        }

        var that = this;
        if (that.callback) that.callback(that); // Pass the object into the callback.
        next.apply(that);
    }

    this.stop = function () {
        this.paused = true;
    }

    this.automatic = function () {
        var autostart = (typeof this.auto === 'undefined') ? true : this.auto;
        var that = this;
        if (autostart && !that.blurred) {
            // Auto start the carousel
            var me = that;
            setTimeout(function () {
                if (!me.blurred) {
                    that.start();
                }
            }, that.milliseconds)
        }
    }

    this.goTo = function (id, callback) {
        if (this.currId === id) return;

        var currEl = this.members[this.currId];
        var targetMember = this.members[id];

        // Don't do anything if the current element is moving.
        var x1 = currEl.style.left;
        var that = this;
        setTimeout(function () {
            var x2 = currEl.style.left;

            if (x1 != x2) {
                return;
            } else {
                that.stop();

                that.currId = id;

                targetMember.style.top = currEl.clientTop + 'px';
                targetMember.style.left = that.originalOffsetLeft + 'px';

                currEl.style.top = currEl.clientTop + 'px';
                currEl.style.left = currEl.clientWidth + 'px';

                callback(id);
                if (!that.blurred) {
                    that.automatic();
                }
            }
        }, 10);
    }

    // CAROUSEL ON INIT
    this.paused = (typeof this.auto === 'undefined') ? false : this.auto;
    var that = this;
    // Starts the carousel based on auto parameter.
    setTimeout(that.automatic(), that.milliseconds);

    var waitTime = (that.milliseconds * 2);
    // Handle window focus.
    window.onblur = function () { that.blurred = true; that.paused = true; }; // Stop on blur.
    window.onfocus = function () { that.blurred = false; that.automatic(); }; // Start on focus.
}

/**
 * 
 * @param { HTMLElement } element 
 * @param { boolean } viewable 
 */
function AlIf(element, viewable, display) {
    if (!element) {
        console.debug('alpucka: AlIf failed, element doesnt exist.');
        return;        
    }

    this.element = element;
    this.viewable = viewable;
    this.display = display || this.element.style.display || this.element.style.display || '';

    this.hide = function () {
        this.viewable = false;
        this.element.style.display = 'none';
    }

    this.show = function () {
        this.viewable = true;
        this.element.style.display = this.display;
    }

    this.reconcile = function () {
        if (this.viewable) {
            this.show();
        } else {
            this.hide();
        }
    }

    // init
    this.reconcile();
}

function AlFor(element, arr, name) {
    if (!element) {
        console.debug('alpucka: AlFor failed, element doesnt exist.');
        return;        
    }
    this.parent = element.parentNode;
    this.element = element;
    this.arr = arr;

    this.reconcile = function () {
        var clone = this.element.cloneNode(true);

        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }

        if (!this.arr) return;

        for (var i = 0; i < this.arr.length; i++) {
            var currNode = clone.cloneNode(clone);
            alpucka.fillNode(currNode, this.arr[i], name)
            this.parent.appendChild(currNode);
        }
    }
}

function AlBind(element, obj) {
    if (!element) {
        console.debug('alpucka: SkBind failed, element doesnt exist.');
        return;        
    }
    this.parent = element.parentNode;
    this.element = element;
    this.obj = obj;

    this.reconcile = function () {
        var clone = this.element.cloneNode(true);

        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }
        
        alpucka.fillNode(clone, this.obj, name);
        this.parent.appendChild(clone);
    }
}


// FUNCTIONS

alpucka.fillNode = function (template, data, name) {
    var finalHTML = template.innerHTML;

    if (typeof data === 'object') {

        for (var f in data) {
            finalHTML = alpucka.insert(finalHTML, f, data[f]);
        }
    }
    template.innerHTML = finalHTML;
}

alpucka.insert = function (html, name, value) {
    var res = html;

    if (typeof value === 'boolean') {
        var start = html.indexOf('{{if ' + name);
        var end = html.substring(start).indexOf('}}') + 2;
        var target = html.substring(start, (start + end));
        var insert;
        var matchStart;
        var matchEnd

        if (value) {
            matchStart = target.indexOf('(+') + 2;
            matchEnd = target.indexOf('+)');
            insert = target.substring(matchStart, matchEnd);
        } else {
            matchStart = target.indexOf('(-') + 2;
            matchEnd = target.indexOf('-)');
            insert = target.substring(matchStart, matchEnd);
        }

        res = html.substring(0, start) + insert + html.substring((start + end));
    }

    var regex = new RegExp("\{\{" + name + "\}\}", 'g');
    res = res.replace(regex, value);

    return res;
}