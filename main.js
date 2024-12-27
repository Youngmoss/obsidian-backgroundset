const { PluginSettingTab, Setting, Plugin } = require('obsidian');
// 设置默认值

const DEFAULT_SETTINGS = {
	imageAdressList: [], // 用于存储图片的file://
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
				.setCta() // 可选：如果需要突出显示按钮（通常会使按钮有强调效果）
				.onClick(() => {
					this.plugin.deleteBackground();
				})
		);

		// 文件选择器
		new Setting(containerEl)
			.setName('Add Image')
			.setDesc('Select an image to add to the list')
			.addButton((button) =>
				button
					.setButtonText('Choose Image')
					.onClick(() => {
						const input = document.createElement('input');
						input.type = 'file';
						input.accept = 'image/*';
						input.addEventListener('change', async (event) => {
							const file = event.target.files[0];
							if (file) {
								const imageUrl = URL.createObjectURL(file);

								this.plugin.settings.imageAdressList.push(imageUrl);

								await this.plugin.saveSettings();
								this.display(); // 重新渲染面板
							}
						});
						input.click();
					})
			);

		// 文件夹选择器
		new Setting(containerEl)
			.setName('Add Folder')
			.setDesc('Select a folder to add all images inside it')
			.addButton((button) =>
				button
					.setButtonText('Choose Folder')
					.onClick(() => {
						const input = document.createElement('input');
						input.type = 'file';
						input.webkitdirectory = true; // 允许选择文件夹
						input.addEventListener('change', async (event) => {
							const files = event.target.files;
							for (const file of files) {
								if (file.type.startsWith('image/')) {
									const imageUrl = URL.createObjectURL(file);
									this.plugin.settings.imageAdressList.push(imageUrl);
								}
							}

							await this.plugin.saveSettings();
							this.display(); // 重新渲染面板
						});
						input.click();
					})
			);

		// 显示图片编号（以网格形式排列）
		const imageListContainer = containerEl.createEl('div', { cls: 'image-grid' });
		this.plugin.settings.imageAdressList.forEach((_, index) => {
			const imgContainer = imageListContainer.createDiv({ cls: 'image-item' });

			// 显示图片编号
			const imageNumber = imgContainer.createEl('p', { text: `Image ${index + 1}` });
			imageNumber.style.margin = '5px';

			// 设置背景按钮
			const setBackgroundButton = imgContainer.createEl('button', { text: 'Set as Background' });
			setBackgroundButton.style.marginTop = '5px';
			setBackgroundButton.addEventListener('click', () => {
				this.plugin.setBackground(index);
			});

			// 删除按钮
			const removeButton = imgContainer.createEl('button', { text: 'Remove' });
			removeButton.style.marginTop = '5px';
			removeButton.addEventListener('click', async () => {
				this.plugin.settings.imageAdressList.splice(index, 1);
				await this.plugin.saveSettings();
				this.display(); // 重新渲染面板
			});
		});
	}
}

// 主插件类
module.exports = class MyPlugin extends Plugin {
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MySettingTab(this.app, this));
		this.setRandomBackground();
	}
  
	onunload() {
	  this.deleteBackground();
	}
  
	async loadSettings() {
	  this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
  
	async saveSettings() {
	  await this.saveData(this.settings);
	}
	deleteBackground() {
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

	setBackground(index) {
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

	setRandomBackground() {
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
