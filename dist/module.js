System.register(["./iframe_ctrl"], function (exports_1, context_1) {
    "use strict";
    var iframe_ctrl_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (iframe_ctrl_1_1) {
                iframe_ctrl_1 = iframe_ctrl_1_1;
            }
        ],
        execute: function () {
            exports_1("PanelCtrl", iframe_ctrl_1.IframePanelCtrl);
        }
    };
});
