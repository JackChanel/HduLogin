## 杭电校园网自动登录服务

<!-- 作者信息 -->

Author: [JackChanel](https://github.com/JackChanel)

Website: [https://www.jackchanel.top](https://www.jackchanel.top)


### ✨功能介绍

- [x] 自动登录杭电校园网
- [x] 自动断线重连
- [x] 注册为系统服务，开机自启动
  
### 👏使用方法

1. 安装 node.js >= 18.0.0

2. 安装依赖
```shell
npm install
```
3. 修改配置文件：将 `default.config.js` 文件重命名为 `config.js` ，并修改其中的 `username` 和 `password` 为你的校园网账号和密码

4. 注册为系统服务。期间需要多次确认授权，按照提示操作即可
```shell
npm run install
```






