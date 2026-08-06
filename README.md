# JUST HENRY & BEATS

## 上传方式：全部平铺在仓库根目录，不要建文件夹

分 4 批上传，每批传完点开检查大小对不对再传下一批。
一次拖太多文件，GitHub 网页上传器会串内容（我们已经踩过一次）。

| 批次 | 文件 | 应有大小 |
|---|---|---|
| 1 | index.html | 约 37 KB |
| 2 | manifest.json / chronos.json / corrupted.json | 0.3 KB / 17 KB / 17 KB |
| 3 | chronos.m4a | 约 2.1 MB |
| 4 | corrupted.m4a / app.webmanifest / icon-192.png / icon-512.png | 2.0 MB / 0.4 KB / 0.8 KB / 2.1 KB |

**检查要点**：`index.html` 和三个 `.json` 点开后应该能看到彩色文本内容。
如果 GitHub 只显示 "View raw" 空白页，说明该文件上传损坏，单独重传一次。

## 开启网站

Settings → Pages → Source 选 `Deploy from a branch` → Branch `main` + `/ (root)` → Save
等 1-2 分钟，网址：`https://<用户名>.github.io/henry-beats/`

iPad 上用 Safari 打开 → 分享 → 添加到主屏幕，会变成全屏图标。

## 以后加歌（2 分钟）

1. Add file → Upload files，传 `新歌.m4a` 和 `新歌.json` 到根目录
2. 点开 manifest.json → 铅笔图标 → 在 songs 数组里加一段：

```json
  {
   "id": "newsong",
   "title": "歌名",
   "artist": "艺术家",
   "chart": "newsong.json"
  }
```

3. Commit，刷新游戏页面就有了。

**index.html 永远不用动。** 封面由程序按歌曲 id 自动生成，不需要图片。

## 注意

- 存档（Beat Fragment）绑定网址，换网址会清零。
- GitHub Pages 的站是公开可访问的，已加 noindex 防搜索引擎收录。
- 
