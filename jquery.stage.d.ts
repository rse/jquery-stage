/*!
**  jQuery Stage -- jQuery Stage Information
**  Copyright (c) 2013-2017 Ralf S. Engelschall <rse@engelschall.com>
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

/// <reference path="../jquery/jquery.d.ts"/>

/*  the jQuery Stage Callback function type  */
interface JQueryStageCB {
    (ev: JQueryEventObject, stage: JQueryStageInfo, stageOld: JQueryStageInfo): any;
}

/*  the jQuery Stage Information structure type  */
interface JQueryStageInfo {
    w:           number;
    h:           number;
    dp:          number;
    dppx:        number;
    ppi:         number;
    di:          number;
    size:        string;
    orientation: string;
}

/*  the jQuery Stage Settings structure type  */
interface JQueryStageSettings {
    ppi:         { [ key: string ]: string; };
    size:        { [ key: string ]: string; };
    orientation: { [ key: string ]: string; };
}

/*  extend the static jQuery API extension (provided by jquery.d.ts)  */
interface JQueryStatic {
    stage: {
        /*  fetch current stage information  */
        (): JQueryStageInfo;

        /*  global version number  */
        version: string;

        /*  global debug level  */
        debug: number;

        /*  configure the stage settings  */
        settings(settings: JQueryStageSettings): void;
    };
}

/*  extend the dynamic jQuery result object API extension (provided by jquery.d.ts)  */
interface JQuery {
    stage(cb: JQueryStageCB): JQuery;
}

