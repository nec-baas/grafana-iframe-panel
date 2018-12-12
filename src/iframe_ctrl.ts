/// <reference path="./grafana-sdk.d.ts" />

import _ from 'lodash';
import { PanelCtrl, TimeSrv, TemplateSrv, TimeRange } from 'app/plugins/sdk';

namespace VARIABLE {
    export const FROM: string = '{{from}}';
    export const TO: string = '{{to}}';
}

namespace SYNC_TYPE {
    export const POST: string = 'window.postMessage';
    export const QUERY: string = 'Query Parameter';
}

/**
 * Iframe Panel Ctrl
 */
export class IframePanelCtrl extends PanelCtrl {
    static templateUrl = `partials/module.html`;

    timeRange: TimeRange;
    inputURL: string;

    syncTypeItems = [SYNC_TYPE.POST, SYNC_TYPE.QUERY];

    panelDefaults = {
        url: '',
        syncType: SYNC_TYPE.POST
    };

    private log(msg: string) {
        // console.log("IframePanelCtrl: " + msg);
    }

    /**
     * Creates an instance of IframePanelCtrl.
     * @param {*} $scope
     * @param {*} $injector
     * @param {TimeSrv} timeSrv
     * @param {TemplateSrv} templateSrv
     * @param {*} $sce
     * @ngInject
     */
    constructor($scope: any, $injector: any, private timeSrv: TimeSrv, private templateSrv: TemplateSrv, private $sce: any) {
        super($scope, $injector);
        this.log("constructor");

        _.defaults(this.panel, this.panelDefaults);

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));

        this.timeRange = { from: null, to: null, raw: null };
        this.inputURL = '';
    }

    /**
     * Initialize edit mode
     */
    onInitEditMode() {
        this.addEditorTab('Options', 'public/plugins/nec-baas-iframe-panel/partials/editor.html', 1);
        this.editorTabIndex = 1;
    }

    /**
     * "Time Range Sync Type" changed
     */
    onSyncTypeChanged() {
        this.log("onSyncTypeChanged");
        this.inputURL = '';
        this.refresh();
    }

    /**
     * Update time range
     */
    updateTimeRange() {
        this.timeRange = this.timeSrv.timeRange();
    }

    /**
     * Replace all
     * @param {string} str Input string
     * @param {string} before Target
     * @param {string} after Replacement
     * @returns {string} Replaced string
     */
    replaceAll(str: string, before: string, after: string): string {
        return str.split(before).join(after);
    }

    /**
     * Post timerange by postMessage
     * @param {TimeRange} timeRange Timerange of Dashboard
     * @param {string} targetOrigin TargetOrigin of iframe
     * @param {Window} frame Window of iframe
     */
    postTimeRange(timeRange: TimeRange, targetOrigin: string, frame: Window) {
        if (!timeRange || !targetOrigin || !frame) {
            this.log("postTimeRange parameter error");
            return;
        }
        this.log("postMessage message: " + JSON.stringify(timeRange));
        this.log("postMessage to: " + targetOrigin);
        frame.postMessage(JSON.stringify(timeRange), targetOrigin);
    }

    /**
     * Refresh panel and sync timerange
     * @param {HTMLIFrameElement} frameElement iframe
     */
    doRefresh(frameElement: HTMLIFrameElement) {
        this.log("doRefresh input url: " + this.panel.url);

        if (!this.panel.url) {
            frameElement.onload = null;
            this.inputURL = '';
            return;
        }

        // replace grafana variables
        let reqURL: string = this.templateSrv.replace(this.panel.url, this.panel.scopedVars);

        if (this.panel.syncType === SYNC_TYPE.POST) {
            if (this.$sce.getTrustedResourceUrl(this.inputURL) === reqURL) {
                // only post
                this.postTimeRange(this.timeRange, reqURL, frameElement.contentWindow);
            } else {
                // update and post
                frameElement.onload = () => {
                    this.postTimeRange(this.timeRange, reqURL, frameElement.contentWindow);
                };
                this.inputURL = this.$sce.trustAsResourceUrl(reqURL);
            }
        } else {
            //replace local variables
            reqURL = this.replaceAll(reqURL, VARIABLE.FROM, this.timeRange.from.toISOString());
            reqURL = this.replaceAll(reqURL, VARIABLE.TO, this.timeRange.to.toISOString());

            frameElement.onload = null;
            if (this.$sce.getTrustedResourceUrl(this.inputURL) != reqURL) {
                // update
                this.inputURL = this.$sce.trustAsResourceUrl(reqURL);
            }
        }
        this.log("doRefresh replaced url: " + reqURL);
    }

    /**
     * Link method of AngularJS
     * @param {*} scope
     * @param {*} elem
     */
    link(scope: any, elem: any) {
        const frameElement: HTMLIFrameElement = elem.find('.iframe-panel')[0];

        this.events.on('refresh', () => {
            this.updateTimeRange();
            this.doRefresh(frameElement);
        });
    }
}
