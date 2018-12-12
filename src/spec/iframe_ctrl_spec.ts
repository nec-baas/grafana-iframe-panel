import * as prunk from 'prunk';
import * as sinon from "sinon";
import * as moment from "moment";
import { describe, it } from "mocha";
import { assert, expect } from "chai";

export class EmitterMock {
    on(name, handler, scope?) {};
}

export class PanelCtrlMock {
    events = new EmitterMock();
    panel = {};
    constructor($scope: any, $injector: any) {};
    refresh(payload?) {};
    addEditorTab(title, directiveFn, index?, icon?) {};
}

prunk.mock('app/plugins/sdk', {
    PanelCtrl: PanelCtrlMock
});

prunk.mock('lodash', {
    default: {
        defaults: (obj, value) => {
            Object.assign(obj, value);
        }
    }
});

import { IframePanelCtrl } from "../iframe_ctrl";

describe('IframePanelCtrl', () => {
    const createFrame = () => {
        return { 
            contentWindow: {
                postMessage: (range, target) => {}
            },
            onload: () => {}
        };
    };

    const createTimeRange = () => {
        return {
            from: moment("2018-12-10T18:25:12.111Z"),
            to: moment("2018-12-11T18:25:12.111Z"),
            raw: {
                from: "now-24h",
                 to: "now"
            }
        }
    }

    const timeRangeStr = JSON.stringify({from: "2018-12-10T18:25:12.111Z", to: "2018-12-11T18:25:12.111Z", raw: {from: "now-24h", to: "now"}});

    const $scope = {
        $on: () => { },
    };

    const $injector = {
        get: () => { },
    };

    const TemplateSrv = {
        replace: (s): string => { return s; },
    };

    const TimeSrv = {
        timeRange: () => {return {from: null, to: null, raw: null};},
    };

    const $sce = {
        trustAsResourceUrl: (reqURL: string): string => {
            return "[trusted]" + reqURL;
        },
        getTrustedResourceUrl: (url) => {
            return url.substring("[trusted]".length);
        }
    };

    it('constructor', () => {
        const ctrl = new IframePanelCtrl($scope, $injector, TimeSrv, TemplateSrv, $sce);
        assert.deepEqual(ctrl.timeRange, {from: null, to: null, raw: null});
        assert.equal(ctrl.inputURL, '');
        assert.deepEqual(ctrl.panel, {url: '', syncType: 'window.postMessage'});
    });

    it('doRefresh: PostMessage, change url', () => {
        const ctrl = new IframePanelCtrl($scope, $injector, TimeSrv, TemplateSrv, $sce)
        ctrl.panel.syncType = "window.postMessage";
        ctrl.panel.url = "http://test.example.com/api";
        ctrl.inputURL = "";
        ctrl.timeRange = createTimeRange();

        const frame = createFrame();
        const spy = sinon.spy(frame.contentWindow, 'postMessage');

        ctrl.doRefresh(frame as any as HTMLIFrameElement);
        assert.isTrue(spy.notCalled);
        assert.equal(ctrl.inputURL, "[trusted]" + "http://test.example.com/api");

        frame.onload();
        assert.equal(spy.callCount, 1);
        assert.equal(spy.args[0][0], timeRangeStr);
        assert.equal(spy.args[0][1], "http://test.example.com/api");
    });

    it('doRefresh: PostMessage, same url', () => {
        const ctrl = new IframePanelCtrl($scope, $injector, TimeSrv, TemplateSrv, $sce)
        ctrl.panel.syncType = "window.postMessage";
        ctrl.panel.url = "http://test.example.com/api";
        ctrl.inputURL = "[trusted]" + "http://test.example.com/api"
        ctrl.timeRange = createTimeRange();

        const frame = createFrame();
        const spy = sinon.spy(frame.contentWindow, 'postMessage');

        ctrl.doRefresh(frame as any as HTMLIFrameElement);
        assert.equal(spy.callCount, 1);                                                                                assert.equal(spy.args[0][0], timeRangeStr);
        assert.equal(spy.args[0][1], "http://test.example.com/api");
        assert.equal(ctrl.inputURL, "[trusted]" + "http://test.example.com/api");
    });

    it('doRefresh: QueryParameter, change url', () => {
        const ctrl = new IframePanelCtrl($scope, $injector, TimeSrv, TemplateSrv, $sce)
        ctrl.panel.syncType = "Query Parameter";
        ctrl.panel.url = "http://test.example.com/api?from={{from}}&to={{to}}";
        ctrl.inputURL = "";
        ctrl.timeRange = createTimeRange();

        const frame = createFrame();
        const spy = sinon.spy(frame.contentWindow, 'postMessage');

        ctrl.doRefresh(frame as any as HTMLIFrameElement);
        assert.isTrue(spy.notCalled);
        assert.equal(ctrl.inputURL, "[trusted]" + "http://test.example.com/api?from=2018-12-10T18:25:12.111Z&to=2018-12-11T18:25:12.111Z");
        assert.equal(frame.onload, null);
    });

    it('doRefresh: QueryParameter, same url', () => {
        const ctrl = new IframePanelCtrl($scope, $injector, TimeSrv, TemplateSrv, $sce)
        ctrl.panel.syncType = "Query Parameter";
        ctrl.panel.url = "http://test.example.com/api?from=[[from]]&to=[[to]]";
        ctrl.inputURL = "[trusted]" + "http://test.example.com/api?from=[[from]]&to=[[to]]";
        ctrl.timeRange = createTimeRange();

        const frame = createFrame();
        const spy = sinon.spy(frame.contentWindow, 'postMessage');

        ctrl.doRefresh(frame as any as HTMLIFrameElement);
        assert.isTrue(spy.notCalled);
        assert.equal(ctrl.inputURL, "[trusted]" + "http://test.example.com/api?from=[[from]]&to=[[to]]");
        assert.equal(frame.onload, null);
    });

    it('doRefresh: URL not set', () => {
        const ctrl = new IframePanelCtrl($scope, $injector, TimeSrv, TemplateSrv, $sce)
        ctrl.panel.syncType = "Query Parameter";
        ctrl.panel.url = "";
        ctrl.inputURL = "[trusted]" + "http://test.example.com/api?from=[[from]]&to=[[to]]";

        const frame = createFrame();
        const spy = sinon.spy(frame.contentWindow, 'postMessage');

        ctrl.doRefresh(frame as any as HTMLIFrameElement);
        assert.isTrue(spy.notCalled);
        assert.equal(ctrl.inputURL, "");
        assert.equal(frame.onload, null);
    });

    it('postTimeRange: parameter error', () => {
        const ctrl = new IframePanelCtrl($scope, $injector, TimeSrv, TemplateSrv, $sce)
        const timeRange = createTimeRange();
        const targetOrigin = "http://test.example.com/api";
        const frame = createFrame();
        const spy = sinon.spy(frame.contentWindow, 'postMessage');

        ctrl.postTimeRange(null, targetOrigin, frame.contentWindow as Window);
        ctrl.postTimeRange(timeRange, null, frame.contentWindow as Window);
        ctrl.postTimeRange(timeRange, targetOrigin, null as Window);

        assert.isTrue(spy.notCalled);
    });
});
