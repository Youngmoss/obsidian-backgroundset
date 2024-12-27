const { PluginSettingTab, Setting, Plugin} = require('obsidian');

// 设置默认值
const DEFAULT_SETTINGS = {
  imageAdressList: [], // 用于存储图片的绝对路径
  defaultFolder: 'images', // 默认文件夹
  fadeOutTime: 1000,
};

// 设置面板
class MySettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Background Settings' });

    // 设置删除按钮
    new Setting(containerEl)
      .setName('Delete Background')
      .setDesc('Remove the current background with a fade-out effect')
      .addButton((button) =>
        button
          .setButtonText('Delete Background')
          .setCta() // 可选：如果需要突出显示按钮（通常会使按钮有强调效果））
          .onClick(() => {
            this.plugin.deleteBackground();
          })
      );

    // 显示图片编号（以网格形式排列）
    const imageListContainer = containerEl.createEl('div', { cls: 'image-grid' });

    this.plugin.settings.imageAdressList.forEach((imagePath, index) => {
      const imgContainer = imageListContainer.createDiv({ cls: 'image-item' });
    
      // 添加缩略图
      const thumbnail = imgContainer.createEl('img');
      thumbnail.src = imagePath; // 使用图片路径
      thumbnail.style.maxWidth = '100px';  // 控制缩略图最大宽度
      thumbnail.style.maxHeight = '100px'; // 控制缩略图最大高度
      thumbnail.style.objectFit = 'cover'; // 保持图片比例裁剪
    
      // 设置背景按钮
      const setBackgroundButton = imgContainer.createEl('button', { text: 'Set as Background' });
      setBackgroundButton.style.marginTop = '5px';
      setBackgroundButton.addEventListener('click', () => {
        this.plugin.setBackground(index);
      });
    });
    
  }
}

// 主插件类
module.exports = class MyPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
	this.app.workspace.onLayoutReady(() => {
    	this.updateImageList();
		this.addSettingTab(new MySettingTab(this.app, this));
		this.setRandomBackground();
	});
  }

  onunload() {
    this.deleteBackground();
	this.saveSettings();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	console.log("loadsettings success");
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // 更新图片列表，扫描 images 文件夹并获取所有图片的路径
  async updateImageList() {
    const folder = this.app.vault.getFolderByPath(this.settings.defaultFolder);

    // 检查文件夹是否存在
    if (!folder) {
      console.warn('Folder not found:', this.settings.defaultFolder);
      return;
    }

    // 扫描文件夹并更新图片列表
	this.settings.imageAdressList = folder.children
	.filter((file) => file.extension === 'png' || file.extension === 'jpg' || file.extension === 'jpeg')
	.map((file) => this.app.vault.getResourcePath(file));	
  }

  async deleteBackground() {
    const styleElement = document.getElementById('dynamic-background-style');
    const body = document.body;
    if (styleElement && body.classList.contains('active')) {
      // 触发淡出效果
      body.classList.remove('active');

      // 等待淡出完成后，移除样式
      body.addEventListener('transitionend', () => {
        styleElement.remove();
      });
    }
  }

  async setBackground(index) {
    const imageUrl = this.settings.imageAdressList[index];
    let styleElement = document.getElementById('dynamic-background-style');

    if (!styleElement) {
      // 创建样式元素
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-background-style';
      styleElement.textContent = `
        body {
          transition: opacity 1s;
          background-size: cover;
          background-position: center;
        }
        body.active {
          opacity: 0.9;
          background-image: url("${imageUrl}");
        }
      `;
      document.head.appendChild(styleElement);

      // 添加 active 类以淡入背景
      document.body.classList.add('active');
    } else {
      // 触发背景切换
      const body = document.body;

      if (body.classList.contains('active')) {
        // 已有背景时，先淡出当前背景
        body.classList.remove('active');

        // 等待淡出完成后切换背景
        body.addEventListener('transitionend', () => {
          body.style.backgroundImage = `url("${imageUrl}")`;
          body.classList.add('active');
        });
      } else {
        // 如果没有背景，直接淡入新背景
        body.style.backgroundImage = `url("${imageUrl}")`;
        body.classList.add('active');
      }
    }
  }

  async setRandomBackground() {
    if (this.settings.imageAdressList.length === 0) {
      console.warn('No images available in the URL list.');
      return;
    }

    // 随机选择一个图片
    const randomIndex = Math.floor(
      Math.random() * this.settings.imageAdressList.length
    );

    // 动态创建样式表
    this.setBackground(randomIndex);
  }
};
