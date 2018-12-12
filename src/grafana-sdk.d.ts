// grafana sdk type decl (mock)

declare module 'app/plugins/sdk' {
    export class Emitter {
        on(name, handler, scope?);
    }

    export class PanelCtrl {
        panel: any;
        error: any;
        dashboard: any;
        editorTabIndex: number;
        pluginName: string;
        pluginId: string;
        editorTabs: any;
        $scope: any;
        $injector: any;
        $location: any;
        $timeout: any;
        inspector: any;
        editModeInitiated: boolean;
        height: any;
        containerHeight: any;
        events: Emitter;
        timing: any;
        loading: boolean;

        constructor($scope: any, $injector: any);
        refresh(payload?);
        addEditorTab(title, directiveFn, index?, icon?);
    }

    // app/features/templating/template_srv.ts
    export class TemplateSrv {
        replace(target: string, scopedVars?: any, format?: any): string;
    }

    // app/features/dashboard/time_srv.ts
    export class TimeSrv {
        timeRange(): TimeRange;
    }

    // app/types/series.ts
    export interface RawTimeRange {
        from: any;
        to: any;
    }

    // app/types/series.ts
    export interface TimeRange {
        from: any;
        to: any;
        raw: RawTimeRange;
    }
}
