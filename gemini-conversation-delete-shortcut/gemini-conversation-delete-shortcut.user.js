// ==UserScript==
// @name             Gemini Conversation Delete Shortcut
// @namespace        https://x.com/TakashiSasaki/greasyfork/533285
// @version          1.6.7
// @description      Deletes the current Gemini conversation with a keyboard shortcut or button, provides a Tampermonkey menu command and a Ctrl+Shift+? shortcut to show script status, and a Ctrl+Shift+S shortcut to click the final action button.
// @author           Takashi Sasasaki
// @license          MIT
// @homepageURL      https://x.com/TakashiSasaki
// @match            https://gemini.google.com/app/*
// @match            https://gemini.google.com/app
// @icon             https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png
// @grant            GM_registerMenuCommand
// @downloadURL none
// ==/UserScript==

(function() {
    'use strict';

    // --- Utility to check if an element is visible ---
    function isElementVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none') return false;
        if (style.visibility === 'hidden') return false;
        if (style.opacity === '0') return false;
        return el.offsetParent !== null;
    }

    // --- Function to show status (for menu command and shortcut) ---
    function showStatusDialog() {
        const headers = document.querySelectorAll('div.response-container-header');
        const currentUrl = window.location.href;
        const menuButtonElement = document.querySelector(SELECTOR_MENU_BUTTON);
        const menuButtonIsDomPresent = !!menuButtonElement;
        const menuButtonIsCurrentlyVisible = isElementVisible(menuButtonElement);
        alert(
            `Gemini Conversation Delete Shortcut is active (version 1.6.7).\n` + // バージョンを更新
            `URL: ${currentUrl}\n` +
            `Found ${headers.length} elements matching div.response-container-header.\n` +
            `Conversation actions menu button (${SELECTOR_MENU_BUTTON}):\n` +
            `  - In DOM: ${menuButtonIsDomPresent}\n` +
            `  - Visible: ${menuButtonIsCurrentlyVisible}`
        );
        console.log(`Delete Shortcut Status: URL=${currentUrl}, Found ${headers.length} headers. Menu button DOM present: ${menuButtonIsDomPresent}, Visible: ${menuButtonIsCurrentlyVisible}`);
    }

    // --- Register Tampermonkey menu command for status ---
    GM_registerMenuCommand('Show delete shortcut status', showStatusDialog);

    // --- Configuration ---
    const SHORTCUT_KEY_CODE = 'Backspace'; // For delete action
    const USE_CTRL_KEY = true;
    const USE_SHIFT_KEY = true;
    const USE_ALT_KEY = false;
    const USE_META_KEY = false;

    const SELECTOR_MENU_BUTTON = '[data-test-id="conversation-actions-button"]';
    const SELECTOR_DELETE_BUTTON_IN_MENU = '[data-test-id="delete-button"]';
    const SELECTOR_CONFIRM_BUTTON_IN_DIALOG = '[data-test-id="confirm-button"]';
    const SELECTOR_FINAL_BUTTON = '#app-root > main > div > button'; // This selector is now primarily for Ctrl+Shift+S

    const WAIT_AFTER_MENU_CLICK = 100;
    const WAIT_AFTER_DELETE_CLICK = 100;
    // const WAIT_AFTER_CONFIRM_FOCUS = 200; // No longer needed as sequence ends after confirmBtn focus/highlight
    const POLLING_INTERVAL = 50;
    const MAX_POLLING_TIME = 3000;
    const MAX_WIDTH_FOR_AUTOMATION = 960;

    // --- Utility functions ---
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function pollForElement(selector, maxTime, interval) {
        const startTime = Date.now();
        while (Date.now() - startTime < maxTime) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
            await sleep(interval);
        }
        return null;
    }

    // --- Main automation sequence (for deleting conversation up to confirm button) ---
    async function performAutomationSequence() {
        if (window.innerWidth > MAX_WIDTH_FOR_AUTOMATION) {
            console.warn(`Automation sequence aborted: window width (${window.innerWidth}px) exceeds MAX_WIDTH_FOR_AUTOMATION (${MAX_WIDTH_FOR_AUTOMATION}px). This function is intended for narrower (mobile-like) views.`);
            return;
        }
        try {
            const menuButton = document.querySelector(SELECTOR_MENU_BUTTON);
            if (!menuButton || !isElementVisible(menuButton)) {
                console.error(`Menu button (${SELECTOR_MENU_BUTTON}) not found or not visible. Automation sequence cannot proceed.`);
                alert('会話アクションメニューが見つからないか非表示のため、削除処理を実行できません。');
                throw new Error('Menu button not found or not visible');
            }
            menuButton.click();
            await sleep(WAIT_AFTER_MENU_CLICK);

            const deleteBtn = await pollForElement(SELECTOR_DELETE_BUTTON_IN_MENU, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (!deleteBtn || !isElementVisible(deleteBtn)) throw new Error('Delete button not found in menu or not visible');
            deleteBtn.click();
            await sleep(WAIT_AFTER_DELETE_CLICK);

            const confirmBtn = await pollForElement(SELECTOR_CONFIRM_BUTTON_IN_DIALOG, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (!confirmBtn || !isElementVisible(confirmBtn)) throw new Error('Confirm button not found in dialog or not visible');

            console.log(`Confirm button (${SELECTOR_CONFIRM_BUTTON_IN_DIALOG}) found. Focusing and highlighting.`);
            confirmBtn.focus({ preventScroll: false });
            confirmBtn.style.backgroundColor = 'lightgreen';
            confirmBtn.style.border = '3px solid green';
            confirmBtn.style.color = 'black';
            confirmBtn.style.outline = '2px dashed darkgreen';

            console.log('The confirmation button is now highlighted. Please press Enter or click it to confirm deletion. Use Ctrl+Shift+S to click any subsequent final button.');
            // The automation sequence now ends here, awaiting user action on the confirm button.
            // Any action on a "final button" is now handled by a separate shortcut (Ctrl+Shift+S).

        } catch (err) {
            console.error('Automation error:', err.message);
        }
    }

    // --- Keyboard shortcut listener ---
    document.addEventListener('keydown', event => {
        // Conversation Delete Shortcut (Ctrl+Shift+Backspace)
        if (event.code === SHORTCUT_KEY_CODE &&
            event.ctrlKey === USE_CTRL_KEY &&
            event.shiftKey === USE_SHIFT_KEY &&
            event.altKey === USE_ALT_KEY &&
            event.metaKey === USE_META_KEY) {
            event.preventDefault();
            event.stopPropagation();
            const menuButtonElement = document.querySelector(SELECTOR_MENU_BUTTON);
            if (!isElementVisible(menuButtonElement)) {
                console.log(`Shortcut activated for delete, but menu button (${SELECTOR_MENU_BUTTON}) is not visible or not present. Aborting.`);
                alert('会話アクションメニュー（︙）が見つからないか、現在表示されていません。\nそのため、ショートカットキーによる削除処理は実行できません。');
                return;
            }
            performAutomationSequence();
        }
        // Show Status Dialog Shortcut (Ctrl+Shift+?)
        else if (event.ctrlKey && event.shiftKey && event.key === '?') {
            event.preventDefault();
            event.stopPropagation();
            console.log('Shortcut activated for status dialog (Ctrl+Shift+?).');
            showStatusDialog();
        }
        // Click Final Button Shortcut (Ctrl+Shift+S)
        else if (event.ctrlKey && event.shiftKey && (event.key === 'S' || event.key === 's')) {
            event.preventDefault();
            event.stopPropagation();
            console.log(`Shortcut activated for clicking final button (Ctrl+Shift+S).`);
            const finalButton = document.querySelector(SELECTOR_FINAL_BUTTON);
            if (finalButton && isElementVisible(finalButton)) {
                console.log(`Final button (${SELECTOR_FINAL_BUTTON}) found and visible. Clicking.`);
                finalButton.click();
            } else {
                console.warn(`Final button (${SELECTOR_FINAL_BUTTON}) not found or not visible for Ctrl+Shift+S shortcut.`);
                alert(`最終処理ボタン（${SELECTOR_FINAL_BUTTON} で指定されるボタン）が見つからないか、現在表示されていません。`);
            }
        }
    }, true);

    // --- Manual trigger button insertion with tracing ---
    function insertManualTriggerButton() {
        const menuButtonElement = document.querySelector(SELECTOR_MENU_BUTTON);
        const isMenuButtonCurrentlyVisible = isElementVisible(menuButtonElement);
        const existingShortcutButtons = document.querySelectorAll('.delete-shortcut-button');

        if (isMenuButtonCurrentlyVisible) {
            console.log(`Menu button (${SELECTOR_MENU_BUTTON}) found and is visible. Checking for delete shortcut button.`);
            const wrapperSelector = 'div.menu-button-wrapper';
            const wrappers = document.querySelectorAll(wrapperSelector);

            if (wrappers.length === 0) {
                console.log('No suitable wrapper found to insert the delete button near the menu button.');
                existingShortcutButtons.forEach(btn => {
                    console.log('  Removing orphaned delete shortcut button as no suitable wrapper was found.');
                    btn.remove();
                });
                return;
            }

            wrappers.forEach((wrapper, index) => {
                let isRelevantWrapper = false;
                if (menuButtonElement && wrapper.contains(menuButtonElement)) {
                    isRelevantWrapper = true;
                } else if (menuButtonElement && menuButtonElement.parentElement && wrapper.contains(menuButtonElement.parentElement)) {
                     isRelevantWrapper = true;
                } else if (menuButtonElement && wrapper.parentElement && wrapper.parentElement.contains(menuButtonElement)){
                     isRelevantWrapper = true;
                }

                if (!wrapper.nextElementSibling || !wrapper.nextElementSibling.classList.contains('delete-shortcut-button')) {
                    let parent = menuButtonElement.parentElement;
                    let menuButtonIsNearWrapper = false;
                    while(parent) {
                        if (parent === wrapper.parentElement) {
                            menuButtonIsNearWrapper = true;
                            break;
                        }
                        if (parent === wrapper) {
                            menuButtonIsNearWrapper = true;
                            break;
                        }
                        parent = parent.parentElement;
                    }

                    if (menuButtonIsNearWrapper || wrappers.length === 1) {
                        console.log(`  Wrapper ${index + 1} is relevant. Inserting delete button.`);
                        const btn = document.createElement('button');
                        btn.className = 'delete-shortcut-button';
                        btn.title = 'Delete conversation (Ctrl+Shift+Backspace)';
                        btn.textContent = '🗑️';
                        btn.style.marginLeft = '8px';
                        btn.style.padding = '4px';
                        btn.style.border = '1px solid red';
                        btn.style.background = 'yellow';
                        btn.style.cursor = 'pointer';
                        btn.style.zIndex = '9999';
                        btn.addEventListener('click', event => {
                            event.preventDefault();
                            performAutomationSequence();
                        });
                        wrapper.parentNode.insertBefore(btn, wrapper.nextSibling);
                        console.log('  Inserted delete button next to wrapper:', wrapper);
                    } else {
                        console.log(`  Wrapper ${index + 1} is not directly related to the visible menu button. Skipping insertion.`);
                    }
                } else {
                    console.log(`  Skipping insertion for wrapper ${index + 1}: delete-shortcut-button already exists next to it.`);
                }
            });
        } else {
            console.log(`Menu button (${SELECTOR_MENU_BUTTON}) not found or not visible. Removing any existing delete shortcut buttons.`);
            if (existingShortcutButtons.length > 0) {
                existingShortcutButtons.forEach(button => {
                    button.remove();
                    console.log('  Removed an existing delete shortcut button.');
                });
            }
        }
    }

    const observer = new MutationObserver(mutationsList => {
        insertManualTriggerButton();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('Window resized, updating delete button status.');
            insertManualTriggerButton();
        }, 250);
    });

    insertManualTriggerButton();

})();