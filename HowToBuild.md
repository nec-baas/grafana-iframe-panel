ビルド手順
==========

準備
-----

    $ npm install -g gulp yarn
    $ yarn config set strict-ssl false     # for nec proxy only
    $ yarn install

ビルド
------

    $ gulp

dist 以下にビルドされたファイルが格納される。

注意事項
--------

dist 以下のファイルは master ブランチにのみコミットすること。
dist 以下のファイルはビルドの度に変更されるので、コミットしていると扱いが面倒である。

また、master から develop へのマージは決して行わないこと。

