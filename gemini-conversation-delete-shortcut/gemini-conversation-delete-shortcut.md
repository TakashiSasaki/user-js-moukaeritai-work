# Gemini Conversation Delete Shortcut 🚀🚀🚀

Version: 1.7.7 🎉🎉🎉

A Tampermonkey userscript that adds a keyboard shortcut and button to delete the current Google Gemini conversation. Supports both mobile and desktop layouts, focuses and highlights the confirmation button (instead of auto-clicking), and, on desktop, toggles the side navigation when its content width is 72px or less. ✨✨✨

## Features ✨✨✨

* **Keyboard Shortcut**: `Ctrl + Shift + Backspace` opens the conversation actions menu, clicks “Delete,” and focuses/highlights the “Confirm” button (mobile or desktop).
* **Final Action Shortcut**: `Ctrl + Shift + S` clicks the final action button (e.g., “New Chat”).
* **Script Status**: `Ctrl + Shift + ?` displays an alert with the current URL and whether mobile/desktop menu buttons are present and visible.
* **Manual Delete Button (Mobile Only)**: Inserts a 🗑️ button next to the “More” menu on mobile layout to trigger deletion sequence with a single click.
* **Desktop-Side-Nav Toggle**: On desktop, after the user clicks the confirmation button, waits briefly and checks `<bard-sidenav>` width. If the inner content width is ≤ 72px, automatically clicks the side-nav toggle button (`button[data-test-id="side-nav-menu-button"]`).
* **Focus & Highlight**: Instead of auto-clicking the “Confirm” button, it receives focus and a green highlight to let the user confirm manually by pressing Enter or clicking.
* **Scoped Confirm Selector**: Only selects `message-dialog button[data-test-id="confirm-button"]` to avoid conflicts with other confirm buttons (e.g., “Start Research”).
* **Efficient Polling**: Polls for required elements at 100 ms intervals, with a max wait of 1 second per element.
* **Angular Animation Handling**: Waits 150 ms after dialog opens to ensure the Angular Material animation completes before focusing/highlighting.
* **Duplicate Listener Prevention**: Adds the side-nav toggle listener only once per dialog instance, resetting it when the dialog closes. 🎉🎉🎉

## Installation 🚀🚀🚀

1. Install the Tampermonkey extension in your browser.
2. Go to the Greasy Fork page for this script (currently version 1.7.7).
3. Click “Install this script” to add it to Tampermonkey. ✨✨✨

## Usage 🎉🎉🎉

1. Open Google Gemini at `https://gemini.google.com/app`.
2. Navigate to any conversation.
3. Press `Ctrl + Shift + Backspace`:

   * On **mobile layout**, the script will:

     1. Click the “More” menu button.
     2. Click “Delete.”
     3. Focus and highlight the “Confirm” button under `<message-dialog>`. The user must press Enter or click manually.
   * On **desktop layout**, the script will:

     1. Click the selected conversation’s menu button (`conversations-list div.selected button`).
     2. Click “Delete” from the pop-up menu.
     3. Focus and highlight the “Confirm” button under `<message-dialog>`.
     4. After the user clicks “Confirm,” wait 200 ms, then check `<bard-sidenav>` inner content width (clientWidth minus padding). If ≤ 72px, click `button[data-test-id="side-nav-menu-button"]` to open the side navigation.
4. Optionally press `Ctrl + Shift + S` to click any final action button (e.g., “New Chat”).
5. Press `Ctrl + Shift + ?` to view script status. 🚀🚀🚀

### Mobile Manual Delete Button ✨✨✨

* On narrow/mobile layouts (window width ≤ 960 px), a yellow “🗑️” button appears next to the “More” menu.
* Clicking that button initiates the same deletion sequence. 🎉🎉🎉

## Configuration 🚀🚀🚀

No additional configuration is required. All selectors and timing constants are defined in the script:

* `POLLING_INTERVAL`: 100 ms between element checks.
* `MAX_POLLING_TIME`: 1000 ms maximum wait per element.
* `POST_CONFIRM_DELAY`: 200 ms wait after confirm click before toggling side nav on desktop.
* Focus/highlight styles use `!important` to override Angular Material CSS. ✨✨✨

## Changelog 🎉🎉🎉

### 1.7.7

* Changed confirm-button selector to `message-dialog button[data-test-id="confirm-button"]` to avoid selecting other confirm buttons (e.g., “Start Research”). 🚀🚀🚀

### 1.7.6

* Added dataset-based guard (`dataset.sideNavListenerAdded`) to prevent duplicate side-nav listeners.
* Cleared `dataset.sideNavListenerAdded` when dialog closes.
* Wrapped side-nav toggle listener with `{ once: true }`. ✨✨✨

### 1.7.5

* Added desktop-only side-nav toggle after confirm if `<bard-sidenav>` inner width ≤ 72px.
* Updated version to 1.7.5. 🎉🎉🎉

### 1.7.4

* Disabled automatic click of confirm button on desktop; now focuses and highlights (matches mobile) instead.
* Updated version to 1.7.4. 🚀🚀🚀

### 1.7.3

* Simplified polling interval to 100 ms and max wait to 1000 ms.
* Removed fixed `sleep(100)` waits; immediately poll for next element.
* Removed console logs for poll timing.
* Retained minimal mobile-only visibility checks.
* Kept MutationObserver debounce for mobile delete button.
* Updated version to 1.7.3. ✨✨✨

### 1.7.2

* Focus and highlight confirm button on desktop as well (no auto-click).
* Updated version to 1.7.2. 🎉🎉🎉

### 1.7.1

* Added `@run-at document-idle` to ensure script runs after DOM is ready.
* Switched to polling for element presence instead of single `querySelector` call.
* Removed rigid window width checks; rely solely on element visibility.
* Updated version to 1.7.1. 🚀🚀🚀

### 1.7.0

* Initial support for desktop layout alongside mobile.
* Desktop flow: click `conversations-list div.selected button`, then “Delete,” then “Confirm.”
* Mobile flow unchanged.
* Updated version to 1.7.0. ✨✨✨

### 1.6.9 (Greasy Fork baseline)

* Original features: mobile layout deletion shortcut, manual delete button injection, status/help menu commands, efficient polling. 🎉🎉🎉

## License 🚀🚀🚀

MIT License. See [LICENSE](https://github.com/TakashiSasaki/outlook-category/blob/master/LICENSE) for full text.

#### 👨‍💻 Developer 🎉🎉🎉

Takashi Sasasaki

#### 🌐 Homepage 🚀🚀🚀

[https://x.com/TakashiSasaki](https://x.com/TakashiSasaki)