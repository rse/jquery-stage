/*!
**  jQuery Stage -- jQuery Stage Information
**  Copyright (c) 2013-2015 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* global jQuery: false */
/* global window: false */
/* global document: false */
(function ($) {
    /* jshint -W014 */

    /*  internal stage information (defaults)  */
    var stage_default = {
        "w":           0,   /* stage width           (px)     */
        "h":           0,   /* stage height          (px)     */
        "dp":          0,   /* stage diagonal length (px)     */
        "dppx":        1.0, /* stage dots per pixel  (factor) */
        "ppi":         0.0, /* stage pixel per inch  (factor) */
        "di":          0.0, /* stage diagonal length (inch)   */
        "size":        "",  /* stage size            (string) */
        "orientation": ""   /* stage orientation     (string) */
    };

    /*  internal stage information  */
    var stage    = $.extend({}, stage_default);
    var stageOld = $.extend({}, stage);

    /*  hook into jQuery (globally)  */
    $.extend({
        /*  API: return the current stage information  */
        stage: function () {
            return stage;
        }
    });

    /*  hook into jQuery (locally)  */
    $.fn.extend({
        /*  API: subscribe to a stage event  */
        stage: function (callback) {
            return this.each(function () {
                if ($(this).get(0) !== window)
                    throw new Error("jquery: stage: you can only bind 'stage' events onto the 'window' object");
                $(this).bind("stage", callback);
            });
        }
    });

    /*  plugin version number  */
    $.stage.version = "1.1.8";

    /*  debug level  */
    $.stage.debug = 0;
    var debug = function (level, msg) {
        /* global console: true */
        if (   $.stage.debug >= level
            && typeof console !== "undefined"
            && typeof console.log === "function")
            console.log("jquery: stage: DEBUG[" + level + "]: " + msg);
    };

    /*  internal settings storage  */
    var settings = {
        ppi: null,
        size: null,
        orientation: null
    };

    /*  API: allow settings to be imported  */
    var prefix = "var";
    $.each(stage, function (name /*, value */) {
        if (prefix !== "var")
            prefix += ",";
        prefix += " " + name + " = stage." + name;
    });
    prefix += "; return (";
    var postfix = ");";
    $.stage.settings = function (_settings) {
        $.each(settings, function (key1 /*, val */) {
            settings[key1] = {};
            if (typeof _settings[key1] === "undefined")
                throw new Error("jquery: stage: no such field " + key1 + " in provided settings");
            $.each(_settings[key1], function (key2, val) {
                if (val === "*")
                    settings[key1][key2] = val;
                else
                    /* jshint -W054 */
                    settings[key1][key2] = new Function("stage", prefix + val + postfix);
            });
        });
    };

    /*  provide default settings  */
    $.stage.settings({
        ppi: {
            "100": "dp > 1024 && dppx <= 1.0",     /*  large screens with low device pixel ratio   */
            "130": "*",                            /*  the reasonable average value                */
            "160": "dp < 1024 && dppx >= 2.0"      /*  small screens with high device pixel ratio  */
        },
        size: {
            "phone":   "0.0 <= di && di <  6.5",   /*  phone   devices usually have a diagonal of up to  6.5in       */
            "tablet":  "6.5 <= di && di < 12.0",   /*  tablet  devices usually have a diagonal of up to 12.0in       */
            "desktop": "*"                         /*  desktop devices usually have a diagonal of 12.0in and higher  */
        },
        orientation: {
            "portrait":  "h > w * 1.2",            /*  portrait  means height is 20% higher than width   */
            "square":    "*",                      /*  everything else is nearly square                  */
            "landscape": "w > h * 1.2"             /*  landscape means width  is 20% higher than height  */
        }
    });

    /*  calculate one single result value  */
    var calculate_one = function (name, options, stage) {
        debug(2, "(re)calculating the stage " + name + " parameter");
        var res = null;
        var def = null;
        $.each(options, function (value, fn) {
            if (fn === "*")
                def = value;
            else if (fn.call(null, stage) === true) {
                res = value;
                return false;
            }
            return true;
        });
        if (res === null && def !== null)
            res = def;
        return res;
    };

    /*  calculate all result values  */
    var calculate_all = function () {
        debug(1, "(re)calculating all stage parameters");
        var S         = $.extend({}, stage_default);
        S.w           = parseInt($(window).width());
        S.h           = parseInt($(window).height());
        S.dp          = Math.round(10 * Math.sqrt(S.w * S.w + S.h * S.h)) / 10;
        S.dppx        = (typeof S.dppx !== "undefined" ? parseFloat(window.devicePixelRatio) : 1.0);
        S.ppi         = parseFloat(calculate_one("ppi", settings.ppi, S));
        S.di          = Math.round(10 * (S.dp / S.ppi)) / 10;
        S.size        = calculate_one("size", settings.size, S);
        S.orientation = calculate_one("orientation", settings.orientation, S);

        /*  determine whether an actual parameter change happended  */
        var difference = false;
        $.each(stage, function (key, val) {
            if (val !== S[key]) {
                difference = true;
                return false;
            }
        });
        if (difference) {
            stageOld = stage;
            stage = S;
        }
        return difference;
    };

    /*  update stage information  */
    var update_stage = function (forced) {
        /*  recalculate stage information  */
        var difference = calculate_all();

        if (difference || forced) {
            /*  optionally notify all subscribers  */
            $(window).trigger("stage", [ stage, stageOld ]);
        }
    };

    /*  bind to the window object for resizing and orientation changes  */
    $(window).bind("resize", function (ev) {
        if (ev.target !== this)
            return;
        update_stage(false);
    });
    $(window).bind("orientationchange", function (ev) {
        if (ev.target !== this)
            return;
        update_stage(false);
    });

    /*  initialize the stage once  */
    $(document).ready(function () {
        update_stage(true);
    });
})(jQuery);

