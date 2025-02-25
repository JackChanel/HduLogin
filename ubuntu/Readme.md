要在Ubuntu中设置你的Node.js程序随系统启动而启动，可以通过以下步骤实现。我们将使用`systemd`来管理这个服务，这是Ubuntu推荐的方式。

---

### 1. 创建一个Systemd服务文件

在 `/etc/systemd/system/` 目录下创建一个新的服务文件。例如，命名为 `hdu-auto-login.service`：

```bash
sudo nano /etc/systemd/system/hdu-auto-login.service
```

将以下内容粘贴到文件中（根据你的实际情况修改路径和参数）：

```ini
[Unit]
Description=HDu Auto Login Service
After=network.target

[Service]
# 你的Node.js程序的路径
ExecStart=/usr/bin/node /path/to/your/script.js
# 工作目录（通常是你的脚本所在的目录）
WorkingDirectory=/path/to/your/project
# 运行服务的用户（推荐使用当前用户）
User=your-username
# 自动重启配置
Restart=always
RestartSec=3
# 环境变量（如果需要）
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**重要参数说明：**
- `ExecStart`：Node.js程序的启动命令，确保路径正确。
- `WorkingDirectory`：你的项目根目录，确保日志和配置文件路径正确。
- `User`：运行服务的用户，建议使用你的当前用户。
- `Restart`：设置为`always`，确保程序崩溃后自动重启。

保存并退出编辑器（`Ctrl + X`，然后按 `Y` 确认）。

---

### 2. 重新加载Systemd配置

让systemd加载新的服务文件：

```bash
sudo systemctl daemon-reload
```

---

### 3. 启动服务并设置为开机自启

启动服务：

```bash
sudo systemctl start hdu-auto-login.service
```

设置开机自启：

```bash
sudo systemctl enable hdu-auto-login.service
```

---

### 4. 检查服务状态

查看服务是否正常运行：

```bash
sudo systemctl status hdu-auto-login.service
```

如果一切正常，你会看到类似以下的输出：

```
● hdu-auto-login.service - HDu Auto Login Service
     Loaded: loaded (/etc/systemd/system/hdu-auto-login.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

---

### 5. 其他常用命令

- **停止服务**：
  ```bash
  sudo systemctl stop hdu-auto-login.service
  ```

- **禁用开机自启**：
  ```bash
  sudo systemctl disable hdu-auto-login.service
  ```

- **查看日志**：
  ```bash
  sudo journalctl -u hdu-auto-login.service
  ```

---

### 6. 注意事项

1. **路径问题**：
   - 确保`ExecStart`和`WorkingDirectory`中的路径正确。
   - 如果你的脚本依赖其他文件（如`config.json`），确保路径是绝对路径或相对于`WorkingDirectory`的路径。

2. **环境变量**：
   - 如果你的程序依赖环境变量，可以在`[Service]`部分添加`Environment`行，例如：
     ```ini
     Environment=MY_VAR=my_value
     ```

3. **权限问题**：
   - 如果你的程序需要访问特定文件或目录，确保运行服务的用户有足够的权限。

4. **日志文件**：
   - 确保你的程序生成的日志文件路径是可写的，或者将日志输出到`journalctl`（通过`console.log`或`logger`）。

---

通过以上步骤，你的Node.js程序将会在Ubuntu系统启动时自动运行，并且可以通过`systemctl`命令方便地管理。