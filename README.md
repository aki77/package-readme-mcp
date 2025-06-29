Package README MCP Server 仕様書
サーバ基本情報

サーバ名: package-readme-mcp
説明: npmパッケージやRuby gemの最新版READMEファイルを取得するMCPサーバ
プロトコル: MCP (Model Context Protocol)

提供ツール
1. get_npm_readme

目的: npmパッケージの最新版READMEを取得
パラメータ:

package_name (string, required): パッケージ名


レスポンス:

成功時: README内容（Markdown形式）
エラー時: エラーメッセージ（パッケージ不存在、ネットワークエラーなど）



2. get_gem_readme

目的: Ruby gemの最新版READMEを取得
パラメータ:

gem_name (string, required): gem名


レスポンス:

成功時: README内容（Markdown形式）
エラー時: エラーメッセージ（gem不存在、ネットワークエラーなど）


エラーハンドリング
エラーケース

パッケージが存在しない
READMEファイルが存在しない
ネットワーク接続エラー
レート制限に達した場合
不正なパラメータ

エラーレスポンス形式
json{
  "error": "error_code",
  "message": "人間が読める形式のエラーメッセージ",
  "details": {
    "package_name": "対象パッケージ名"
  }
}

データソース

ローカル

セキュリティ考慮事項
入力検証

パッケージ名の形式チェック（英数字、ハイフン、アンダースコア、スラッシュのみ許可）
最大文字数制限（パッケージ名: 256文字）
