/// <reference path="grafana-sdk.d.ts" />
import { PanelCtrl, TimeSrv, TemplateSrv, TimeRange } from 'app/plugins/sdk';
/**
 * Iframe Panel Ctrl
 */
export declare class IframePanelCtrl extends PanelCtrl {
    private timeSrv;
    private templateSrv;
    private $sce;
    static templateUrl: string;
    timeRange: TimeRange;
    inputURL: string;
    syncTypeItems: string[];
    panelDefaults: {
        url: string;
        syncType: string;
    };
    private log;
    /**
     * Creates an instance of IframePanelCtrl.
     * @param {*} $scope
     * @param {*} $injector
     * @param {TimeSrv} timeSrv
     * @param {TemplateSrv} templateSrv
     * @param {*} $sce
     * @ngInject
     */
    constructor($scope: any, $injector: any, timeSrv: TimeSrv, templateSrv: TemplateSrv, $sce: any);
    /**
     * Initialize edit mode
     */
    onInitEditMode(): void;
    /**
     * "Time Range Sync Type" changed
     */
    onSyncTypeChanged(): void;
    /**
     * Update time range
     */
    updateTimeRange(): void;
    /**
     * Replace all
     * @param {string} str Input string
     * @param {string} before Target
     * @param {string} after Replacement
     * @returns {string} Replaced string
     */
    replaceAll(str: string, before: string, after: string): string;
    /**
     * Post timerange by postMessage
     * @param {TimeRange} timeRange Timerange of Dashboard
     * @param {string} targetOrigin TargetOrigin of iframe
     * @param {Window} frame Window of iframe
     */
    postTimeRange(timeRange: TimeRange, targetOrigin: string, frame: Window): void;
    /**
     * Refresh panel and sync timerange
     * @param {HTMLIFrameElement} frameElement iframe
     */
    doRefresh(frameElement: HTMLIFrameElement): void;
    /**
     * Link method of AngularJS
     * @param {*} scope
     * @param {*} elem
     */
    link(scope: any, elem: any): void;
}
