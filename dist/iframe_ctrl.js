/// <reference path="./grafana-sdk.d.ts" />
System.register(["lodash", "app/plugins/sdk"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var lodash_1, sdk_1, VARIABLE, SYNC_TYPE, IframePanelCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            }
        ],
        execute: function () {/// <reference path="./grafana-sdk.d.ts" />
            (function (VARIABLE) {
                VARIABLE.FROM = '{{from}}';
                VARIABLE.TO = '{{to}}';
            })(VARIABLE || (VARIABLE = {}));
            (function (SYNC_TYPE) {
                SYNC_TYPE.POST = 'window.postMessage';
                SYNC_TYPE.QUERY = 'Query Parameter';
            })(SYNC_TYPE || (SYNC_TYPE = {}));
            IframePanelCtrl = /** @class */ (function (_super) {
                __extends(IframePanelCtrl, _super);
                /**
                 * Creates an instance of IframePanelCtrl.
                 * @param {*} $scope
                 * @param {*} $injector
                 * @param {TimeSrv} timeSrv
                 * @param {TemplateSrv} templateSrv
                 * @param {*} $sce
                 * @ngInject
                 */
                function IframePanelCtrl($scope, $injector, timeSrv, templateSrv, $sce) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    _this.timeSrv = timeSrv;
                    _this.templateSrv = templateSrv;
                    _this.$sce = $sce;
                    _this.syncTypeItems = [SYNC_TYPE.POST, SYNC_TYPE.QUERY];
                    _this.panelDefaults = {
                        url: '',
                        syncType: SYNC_TYPE.POST
                    };
                    _this.log("constructor");
                    lodash_1.default.defaults(_this.panel, _this.panelDefaults);
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.timeRange = { from: null, to: null, raw: null };
                    _this.inputURL = '';
                    return _this;
                }
                IframePanelCtrl.prototype.log = function (msg) {
                    // console.log("IframePanelCtrl: " + msg);
                };
                /**
                 * Initialize edit mode
                 */
                IframePanelCtrl.prototype.onInitEditMode = function () {
                    this.addEditorTab('Options', 'public/plugins/nec-baas-iframe-panel/partials/editor.html', 1);
                    this.editorTabIndex = 1;
                };
                /**
                 * "Time Range Sync Type" changed
                 */
                IframePanelCtrl.prototype.onSyncTypeChanged = function () {
                    this.log("onSyncTypeChanged");
                    this.inputURL = '';
                    this.refresh();
                };
                /**
                 * Update time range
                 */
                IframePanelCtrl.prototype.updateTimeRange = function () {
                    this.timeRange = this.timeSrv.timeRange();
                };
                /**
                 * Replace all
                 * @param {string} str Input string
                 * @param {string} before Target
                 * @param {string} after Replacement
                 * @returns {string} Replaced string
                 */
                IframePanelCtrl.prototype.replaceAll = function (str, before, after) {
                    return str.split(before).join(after);
                };
                /**
                 * Post timerange by postMessage
                 * @param {TimeRange} timeRange Timerange of Dashboard
                 * @param {string} targetOrigin TargetOrigin of iframe
                 * @param {Window} frame Window of iframe
                 */
                IframePanelCtrl.prototype.postTimeRange = function (timeRange, targetOrigin, frame) {
                    if (!timeRange || !targetOrigin || !frame) {
                        this.log("postTimeRange parameter error");
                        return;
                    }
                    this.log("postMessage message: " + JSON.stringify(timeRange));
                    this.log("postMessage to: " + targetOrigin);
                    frame.postMessage(JSON.stringify(timeRange), targetOrigin);
                };
                /**
                 * Refresh panel and sync timerange
                 * @param {HTMLIFrameElement} frameElement iframe
                 */
                IframePanelCtrl.prototype.doRefresh = function (frameElement) {
                    var _this = this;
                    this.log("doRefresh input url: " + this.panel.url);
                    if (!this.panel.url) {
                        frameElement.onload = null;
                        this.inputURL = this.$sce.trustAsResourceUrl("about:blank");
                        return;
                    }
                    // replace grafana variables
                    var reqURL = this.templateSrv.replace(this.panel.url, this.panel.scopedVars);
                    if (this.panel.syncType === SYNC_TYPE.POST) {
                        if (this.$sce.getTrustedResourceUrl(this.inputURL) === reqURL) {
                            // only post
                            this.postTimeRange(this.timeRange, reqURL, frameElement.contentWindow);
                        }
                        else {
                            // update and post
                            frameElement.onload = function () {
                                _this.postTimeRange(_this.timeRange, reqURL, frameElement.contentWindow);
                            };
                            this.inputURL = this.$sce.trustAsResourceUrl(reqURL);
                        }
                    }
                    else {
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
                };
                /**
                 * Link method of AngularJS
                 * @param {*} scope
                 * @param {*} elem
                 */
                IframePanelCtrl.prototype.link = function (scope, elem) {
                    var _this = this;
                    var frameElement = elem.find('.iframe-panel')[0];
                    this.events.on('refresh', function () {
                        _this.updateTimeRange();
                        _this.doRefresh(frameElement);
                    });
                };
                IframePanelCtrl.templateUrl = "partials/module.html";
                return IframePanelCtrl;
            }(sdk_1.PanelCtrl));
            exports_1("IframePanelCtrl", IframePanelCtrl);
        }
    };
});
