const { PluginSettingTab, Setting, Plugin, debounce } = require('obsidian');
// 设置默认值
const DEFAULT_SETTINGS = {
	defaultFolder: '',//default folder
	transTime: 1000,//fade out-in time
	changeTime: 120000,//change time default 20 min
	opacity: 0.9,
	whetherrandom: false,
};

// 设置面板
class BackgroundSettingTab extends PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		// set defaultFolder
		new Setting(containerEl)
			.setName('Background defaultFolder')
			.setDesc("Use relative path starting from your vault(not.obsidian).")
			.addText(
				(text) => text
					.setPlaceholder("Example: images/backgrounds")
					.setValue(this.plugin.settings.defaultFolder)
					.onChange(debounce(async (value) => {
						this.plugin.settings.defaultFolder = value;
						await this.plugin.saveSettings();
						this.plugin.updateImageList();
					}, 500))
			);

		// whether random
		new Setting(containerEl)
			.setName("Random play")
			.addToggle(
				(toggle) => toggle
					.setValue(this.plugin.settings.whetherrandom) // 根据当前设置初始化开关状态
					.onChange(async (value) => {
						this.plugin.settings.whetherrandom = value ? 1 : 0; // 更新设置值
						await this.plugin.saveSettings(); // 保存设置
					})
			);


		// set changeTime
		new Setting(containerEl)
			.setName('Change time(min)')
			.addText(
				(text) => text
					.setPlaceholder('Change time(min)')
					.setValue((this.plugin.settings.changeTime / 60000.0).toString())
					.onChange(debounce(async (value) => {
						this.plugin.settings.changeTime = value * 60000;
						await this.plugin.saveSettings();
					}, 500)
					) // 设置防抖延迟时间为 500 毫秒
			);

		// set opacity
		new Setting(containerEl)
			.setName('Opacity')
			.addText(
				(text) => text
					.setPlaceholder('0.1 - 1')
					.setValue(this.plugin.settings.opacity.toString())
					.onChange(debounce(async (value) => {
						if (value < 0.1 || value > 1) return;
						this.plugin.settings.opacity = value;
						const body = document.body;
						if (body.classList.contains('active')) {
							body.style.opacity = value; // 动态更新 body 的透明度
						}
					}, 500)
					)
			);

		// set transTime
		new Setting(containerEl)
			.setName('Fade out-in time(ms)')
			.addText(
				(text) => text
					.setPlaceholder('Fade out-in time(ms)')
					.setValue(this.plugin.settings.transTime.toString())
					.onChange(debounce(async (value) => {
						this.plugin.settings.transTime = value;
						await this.plugin.saveSettings();
					}, 300, true))
			);

		// random background
		new Setting(containerEl)
			.setName('Apply random background')
			.addButton(
				(button) => button
					.setButtonText('Apply background')
					.onClick(() => {
						this.plugin.setRandomBackground();
					})
			);

		// 设置删除按钮
		new Setting(containerEl)
			.setName('Delete background')
			.addButton(
				(button) => button
					.setButtonText('Delete background')
					.onClick(() => {
						this.plugin.deleteBackground();
					})
			);

		// 显示图片编号（以网格形式排列）
		const imageListContainer = containerEl.createEl('div', { cls: 'image-grid' });

		this.plugin.imageAdressList.forEach((imagePath, index) => {
			const imgContainer = imageListContainer.createDiv({ cls: 'image-item' });

			// 添加缩略图
			const thumbnail = imgContainer.createEl('img');
			thumbnail.src = imagePath; // 使用图片路径
			thumbnail.style.maxWidth = '100px';  // 控制缩略图最大宽度
			thumbnail.style.maxHeight = '100px'; // 控制缩略图最大高度
			thumbnail.style.objectFit = 'cover'; // 保持图片比例裁剪

			// 设置背景按钮
			const setBackgroundButton = imgContainer.createEl('button', { text: 'Set as background' });
			setBackgroundButton.style.marginTop = '5px';
			setBackgroundButton.addEventListener('click', () => {
				this.plugin.setOrderedBackground(index);
			});
		});

	}
}

// 主插件类
module.exports = class BackgroundSet extends Plugin {
	
	async onload() {
		this.imageAdressList = [];
		await this.loadSettings();
		this.app.workspace.onLayoutReady(() => {
			this.addSettingTab(new BackgroundSettingTab(this.app, this));
			this.setRandomBackground();
		});
	}

	onunload() {
		this.deleteBackground();
		delete this.imageAdressList;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
		this.imageAdressList = folder.children
			.filter((file) => file.extension === 'png' || file.extension === 'jpg' || file.extension === 'jpeg')
			.map((file) => this.app.vault.getResourcePath(file));
	}

	async deleteBackground() {
		const styleElement = document.getElementById('background-style');
		const body = document.body;
		if (styleElement) {
			// 触发淡出效果
			if (body.classList.contains('active'))
				body.classList.remove('active');
			// 等待淡出完成后，移除样式
			body.addEventListener('transitionend', () => {
				styleElement.remove();
				document.body.style.backgroundImage = 'none';
			}, { once: true });
		}
		// 清除定时器
		if (this.backgroundChangeInterval) {
			clearInterval(this.backgroundChangeInterval);
		}
	}

	async setBackground(index) {
		const imageUrl = this.imageAdressList[index];
		let styleElement = document.getElementById('background-style');

		if (!styleElement) {
			// 创建样式元素
			styleElement = document.createElement('style');
			styleElement.id = 'background-style';
			styleElement.textContent = `
				body {
					transition: opacity ${this.settings.transTime / 1000}s;
					background-size: cover;
					background-position: center;
				}
				body.active {
					opacity: ${this.settings.opacity};
				}
			`;
			document.head.appendChild(styleElement);

			// 添加 active 类以淡入背景
			document.body.style.backgroundImage = `url("${imageUrl}")`;
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
		this.updateImageList();
		let len = this.imageAdressList.length;
		if (len === 0) {
			console.warn('No images available in the URL list.');
			return;
		}

		const apply = async () => {//sb,funtion is diff form =>
			const randomIndex = Math.floor(Math.random() * len);
			await this.setBackground(randomIndex);
		};
		apply();
		// 如果 `changeTime` 已设定，定时更换背景
		if (this.settings.changeTime > 0) {
			// 清除旧的定时器
			if (this.backgroundChangeInterval) 
				clearInterval(this.backgroundChange)
			// 设置新的定时器
			this.backgroundChangeInterval = setInterval((() => {
				apply();
			}), this.settings.changeTime);
			// use IIFE to immediate invoke the function
		}
	}

	async setOrderedBackground(index) {
		this.updateImageList();
		let len = this.imageAdressList.length;
		if (len === 0) {
			console.warn('No images available in the URL list.');
			return;
		}
		const apply = async () => {//sb,funtion is diff form =>
			await this.setBackground(index++ % len);
		}; apply();
		// 如果 `changeTime` 已设定，定时更换背景
		if (this.settings.changeTime > 0) {
			// 清除旧的定时器
			if (this.backgroundChangeInterval) 
				clearInterval(this.backgroundChange)
			// 设置新的定时器
			this.backgroundChangeInterval = setInterval(() => {
				apply();
			}, this.settings.changeTime);
		}
	}
};
