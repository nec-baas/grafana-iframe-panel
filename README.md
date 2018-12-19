Iframe Panel plugin for Grafana
======================================

概要
----

Grafana から 外部Webアプリケーションを表示するための  Panel plugin です。
Grafanaで設定した時間範囲を外部Webアプリケーションに連携することが可能です。

インストール
------------

/var/lib/grafana/plugins ディレクトリ、または data/plugins ディレクトリ (Grafana 本体からの相対ディレクトリ)
に "nec-baas-iframe-panel" ディレクトリを作成し、
本ディレクトリ以下の全ファイルを前記ディレクトリにインストールしてください。

Options 設定
------------

### Time Range Sync Type

外部Webアプリケーションへの時間範囲の通知方法を指定してください。

* **window.postMessage**: 時間範囲を window.postMessage で通知します。メッセージは、以下のように JSON フォーマットで通知されます。"from", "to" には時間範囲が ISO 8601 形式で設定されます。"row" には Dashboard の時間範囲設定の "Custom range" の値が設定されます。

```JSON
    {
      "from": "2018-11-29T15:00:00.000Z",
      "to": "2018-11-30T14:59:59.999Z",
      "raw": {
        "from": "now/d",
        "to": "now/d"
      }
    }
```

* **Query Parameter**: クエリパラメータに時間範囲を設定します。URLには時間範囲を示す変数(`{{from}}`, `{{to}}`)を指定してください。


[設定例]

    https://some-web-app.example.com?start={{from}}&end={{to}}

[置換後]

    https://some-web-app.example.com?start=2018-11-29T15:00:00.000Z&end=2018-11-30T14:59:59.999Z


### URL

外部Webアプリケーションの URL を指定してください。
URLには、Variables を利用することができます。
