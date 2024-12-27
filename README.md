# Obsidian Background Manager Plugin

This is a plugin for [Obsidian](https://obsidian.md/) that allows users to manage and customize their workspace background. With this plugin, users can add images, set them as backgrounds, and even apply fade-in and fade-out effects for smooth transitions.

---

## Features

- **readme edit by gpt**
- **Add Background Images**: Add individual images or entire folders of images to the background list.
- **Set Background**: Choose any image from the list and set it as the background.
- **Random Background**: Automatically set a random background from the list.
- **Delete Background**: Remove the current background with a fade-out effect.
- **Fade Effects**: Smooth fade-in and fade-out transitions for background changes.
- **Drag-and-Drop Support**: Drag and drop images directly into the settings panel to add them to the background list.

---

## Installation

1. Download or clone this repository.
2. Place the plugin folder in your Obsidian plugins directory:
   - On Windows: `%APPDATA%/Obsidian/plugins`
   - On macOS: `~/Library/Application Support/Obsidian/plugins`
   - On Linux: `~/.config/Obsidian/plugins`
3. Enable the plugin in Obsidian:
   - Open **Settings** → **Community Plugins** → **Installed Plugins**.
   - Find "Background Manager" and toggle it on.

---

## Usage

### 1. **Add Images**
- Open the plugin settings panel under **Settings → Background Settings**.
- Use the following options to add images:
  - **Add Image**: Select a single image file to add to the background list.
  - **Add Folder**: Select a folder to add all images inside it to the background list.
  - **Drag-and-Drop**: Drag images directly into the settings panel to add them.

### 2. **Set Background**
- In the settings panel, you will see a list of added images.
- Click the **Set as Background** button next to an image to apply it as the background.

### 3. **Random Background**
- The plugin automatically sets a random background from the list when loaded.

### 4. **Delete Background**
- Use the **Delete Background** button in the settings panel to remove the current background with a fade-out effect.

### 5. **Fade Effects**
- Background transitions include smooth fade-in and fade-out animations for a polished user experience.

---

## Settings

### Default Settings
The plugin uses the following default settings:
```javascript
const DEFAULT_SETTINGS = {
  imageAdressList: [], // Stores the list of background images in Base64 format
  fadeOutTime: 1000,   // Duration of fade-out effect in milliseconds
};
```

### Customization
You can customize the fade-out duration by modifying the `fadeOutTime` value in the plugin code.

---

## Development

### Code Structure
- **`MyPlugin` Class**: Main plugin logic.
- **`MySettingTab` Class**: Handles the settings panel UI.
- **Key Methods**:
  - `setBackground(index)`: Sets a specific image as the background with fade effects.
  - `setRandomBackground()`: Chooses a random image from the list and sets it as the background.
  - `deleteBackground()`: Removes the current background with a fade-out effect.
  - `fadeOutBackground(styleElement)`: Handles the fade-out animation for background removal.

### Adding New Features
To extend the plugin, you can modify the `MyPlugin` or `MySettingTab` classes. For example:
- Add support for additional image formats.
- Implement scheduled background changes.

---

## Known Issues

- **Temporary URLs**: Images added via `URL.createObjectURL` are temporary and only valid during the current session. To persist images, consider converting them to Base64 or saving them in a local file system.
- **Performance**: Large image lists or high-resolution images may impact performance.

---

## Future Improvements

- **Scheduled Background Changes**: Add an option to automatically change the background at regular intervals.
- **Persistent Storage**: Save images in a more permanent format (e.g., Base64 or local file paths).
- **Preview Images**: Display thumbnails of added images in the settings panel.

---

## License

This plugin is released under the [MIT License](https://opensource.org/licenses/MIT).

---

## Acknowledgments

- [Obsidian](https://obsidian.md/) for providing an amazing platform for productivity and customization.
- The JavaScript and Node.js communities for their excellent libraries and tools.

---

If you encounter any issues or have feature requests, feel free to open an issue or submit a pull request!
