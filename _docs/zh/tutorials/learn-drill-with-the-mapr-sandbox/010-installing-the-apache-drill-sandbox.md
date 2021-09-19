---
title: "安装 Apache Drill SandBox"
slug: "Installing the Apache Drill Sandbox"
parent: "搭配 MapR Sandbox 学习 Drill"
lang: "zh"
---
## 准备开始

集成 Apache Drill 的 MapR Sandbox 可以在 VMware Player 和 VirtualBox 上运行，这些免费虚拟机可以在 Windows、Mac 或 Linux 上运行。
在安装集成 Apache Drill 的 MapR Sandbox 之前，请验证主机是否满足以下条件：

  * 已经安装 VMware Player 或 VirtualBox。
  * 至少有 20 GB 硬盘空间、4 个物理内核和 8 GB 内存。可用的内存和硬盘空间越多，性能越好。
  * 使用以下 64 位 x86 架构之一：
    * 1.3 GHz 或更快的 AMD CPU，在 long mode 下支持 segment-limit。
    * 1.3 GHz 或更快的 Intel CPU，支持 VT-x
  * 如果使用支持 VT-x 的 Intel CPU，请确认在主机系统 BIOS 中启用了 VT-x 支持。BIOS 启用 VT-x 支持的设置因系统不同而异。请参考 VMware 的知识库文章，网址为 <http://kb.vmware.com/kb/1003944> 来获得更多有关如何确定是否启用了 VT-x 支持的信息。

### 下载 VM Player

对于 Linux、Mac 或 Windows，可以下载免费的 [VMware Player](https://my.vmware.com/web/vmware/free#desktop_end_user_computing/vmware_player/6_0 "VMwarePlayer") 或
[VirtualBox](https://www.virtualbox.org/wiki/Downloads)。或者，也可以为 MacOS
购买 [VMware Fusion](http://www.vmware.com/products/fusion/)。

### 安装 VM Player

虚拟机安装指南：

  * 安装 VMware Player, 请参考 [VMware 文档](http://www.vmware.com/support/pubs/player_pubs.html)。 使用 VMware Player 受 VMware Player 用户许可条款的约束。同时，VMware 不提供对 VMware Player 的支持。学习资源请参考 [VMware Player FAQ](http://www.vmware.com/products/player/faqs.html)。
  * 安装 VirtualBox, 请参考 [Oracle VM VirtualBox 用户手册](http://dlc.sun.com.edgesuite.net/virtualbox/4.3.4/UserManual.pdf)。下载 VirtualBox，即表示你同意相应的授权许可和条款。

## 在 VMware Player/VMware Fusion 上安装集成 Apache Drill 的 MapR Sandbox。

通过下列步骤在 VMware Player 或 VMware Fusion 上安装集成 Apache Drill 的 MapR Sandbox：

1. 将集成 Drill 的 MapR Sandbox 安装包下载到本地：  
   <https://www.mapr.com/products/mapr-sandbox-hadoop/download-sandbox-drill>
2. 启动 VMware Player/VMware Fusion，然后选择**Open a Virtual Machine**选项。  
  
    **VMware Fusion 小贴士**  

    如果你运行的是 VMware Fusion，请选择**Import**。  

    ![drill query flow]({{ site.baseurl }}/images/docs/vmWelcome.png)
3. 切换到保存集成 Apache Drill 的 MapR Sandbox 安装包的目录，并选择 `MapR-Sandbox-For-Apache-Drill-<version>-vmware.ova`。  
   会出现导入虚拟机的对话框。
4. 点击 **Import**，将 MapR Sandbox 导入到虚拟机。  
5. 选择 `MapR-Sandbox-For-Apache-Drill-<version>_VM`， 并点击 **Play virtual machine**。MapR 服务需要几分钟来启动。在 MapR 服务启动并安装完成后，屏幕会提示以下消息：

              MapR-Sandbox-For-Apache-Drill-<version> installation finished successfully.
              Please go to http://127.0.0.1:8047 to begin your experience.
              Open a browser on your host machine and enter the URL in the browser's address field.
              You can access the host via SSH by ssh mapr@localhost -p 2222
              Log in to this virtual machine: Linux/Windows <Alt+F2>, Mac OS X <Options+F5>  

       **Note:** The URL provided corresponds to the Web UI in Apache Drill.  
     
6. 确认是否在主机上为虚拟机添加了 DNS 解析。如果没有，请创建对应解析。
    * 对于 Linux 和 Mac，在 `/etc/hosts` 文件中添加 DNS 解析。  
    * 对于 Windows，在 `%WINDIR%\system32\drivers\etc\hosts` 文件中添加 DNS 解析。  
     
           如: `127.0.1.1 <vm_hostname>`

7. 切换至 [localhost:8047](http://localhost:8047) 来体验 Drill Web UI，或者通过命令行登录 MapR Sandbox。  

   * 使用 ssh 登录 MapR，请参考 ["了解 Drill Sandbox"]({{site.baseurl}}/docs/getting-to-know-the-drill-sandbox)。出现登录提示时，输入“mapr”作为登录名和密码。  
   * 也可以通过虚拟机上的命令行工具访问：在 Windows 上按 Alt+F2 或在 Mac 上按 Option+F5 以启动命令行。  

### 了解更多

下载并安装沙箱后，再继续以下教程
[了解 Drill Sandbox]({{ site.baseurl }}/docs/getting-to-know-the-drill-sandbox/)。

## 在 VirtualBox 上安装集成 Apache Drill 的 MapR Sandbox

VirtualBox 上集成 Apache Drill 的 MapR Sandbox 具有 NAT 端口转发
的功能，允许使用 localhost 作为主机名访问沙箱。

通过以下步骤在 VirtualBox 上安装集成 Apache Drill 的 MapR Sandbox ：

1. 将集成 Apache Drill 的 MapR Sandbox 安装文件下载到本地目录中：   
<https://www.mapr.com/products/mapr-sandbox-hadoop/download-sandbox-drill>
2. 启动 virtual machine player。
3. 选择 **File > Import Appliance**。弹出导入虚拟设备对话框。

     ![drill query flow]({{ site.baseurl }}/images/docs/1_vbImport.png)
4. 切换到保存集成 Apache Drill 的 MapR Sandbox 安装包的目录，选择 `MapR-Sandbox-For-Apache-Drill-<version>.ova`，并点击 **Next**。弹出导入窗口。

     ![drill query flow]({{ site.baseurl }}/images/docs/vbApplSettings.png)
5. 选中屏幕底部的复选框：**Reinitialize the MAC address of all network cards**，并点击 **Import**。以导入沙箱。
6. 当导入完成，选择 **Settings**。弹出 The VirtualBox 设置对话框。

     ![drill query flow]({{ site.baseurl }}/images/docs/3_vbNetwork.png)
7. 选择 **Network**.  

   确认适配器 1 是否已连接到 **NAT**。此选项应该适用于大多数情况。但如果使用的是有线以太网连接，可以选择 **NAT Network**。如果在远程主机上使用 ODBC 或 JDBC，选择 **Bridged Adapter**。

     ![drill query flow]({{ site.baseurl }}/images/docs/4_vbMaprSetting.png)
8. 点击 **OK** 以继续。

9. 点击 **Start**。MapR 服务需要几分钟来启动。当 MapR 服务启动并安装完成后，屏幕会提示以下消息：  

              MapR-Sandbox-For-Apache-Drill-<version> installation finished successfully.
              Please go to http://127.0.0.1:8047 to begin your experience.
              Open a browser on your host machine and enter the URL in the browser's address field.
              You can access the host via SSH by ssh mapr@localhost -p 2222
              Log in to this virtual machine: Linux/Windows <Alt+F2>, Mac OS X <Options+F5>  

       **Note:** The URL provided corresponds to the Web UI in Apache Drill.      

10. 切换到 [localhost:8047](http://localhost:8047) 来体验 Drill web UI，或者通过命令行登录 MapR Sandbox。  
      * 使用 ssh 登录 MapR，请参考 ["了解 Drill Sandbox"]({{site.baseurl}}/docs/getting-to-know-the-drill-sandbox)。出现登录提示时，输入“mapr”作为登录名和密码。 
      * 也可以通过虚拟机上的命令行工具访问：在 Windows 上按 Alt+F2 或在 Mac 上按 Option+F5 以启动命令行。   

### 了解更多

下载并安装沙箱后，再继续以下教程
[了解 Drill Sandbox]({{ site.baseurl }}/docs/getting-to-know-the-drill-sandbox/)。
