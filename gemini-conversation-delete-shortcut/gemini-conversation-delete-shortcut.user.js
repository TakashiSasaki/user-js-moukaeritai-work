// ==UserScript==
// @name         Gemini Conversation Delete Shortcut
// @namespace    https://x.com/TakashiSasaki/greasyfork/533285
// @version      1.5.1
// @description  Deletes the current Gemini conversation on Gemini with Ctrl+Shift+Backspace or via manual button click. After deletion, emulates a click on the final button. Includes layout check and robust element polling with necessary waits.
// @author       Takashi Sasaki
// @license      MIT
// @homepageURL  https://x.com/TakashiSasaki
// @match        https://gemini.google.com/app/*
// @grant        none
// @downloadURL none
// ==/UserScript==

(function() {
    'use strict';

    // --- Configuration ---
    const SHORTCUT_KEY_CODE = 'Backspace';  // event.code to detect Backspace key
    const USE_CTRL_KEY = true;
    const USE_SHIFT_KEY = true;
    const USE_ALT_KEY = false;
    const USE_META_KEY = false;

    const SELECTOR_MENU_BUTTON = '[data-test-id="conversation-actions-button"]';
    const SELECTOR_DELETE_BUTTON_IN_MENU = '[data-test-id="delete-button"]';
    const SELECTOR_CONFIRM_BUTTON_IN_DIALOG = '[data-test-id="confirm-button"]';
    const SELECTOR_FINAL_BUTTON = '#app-root > main > div > button';

    const WAIT_AFTER_MENU_CLICK = 100;
    const WAIT_AFTER_DELETE_CLICK = 100;
    const WAIT_AFTER_CONFIRM_CLICK = 100;  // wait before final button click
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

    // --- Main automation sequence ---
    async function performAutomationSequence() {
        const currentWidth = window.innerWidth;
        if (currentWidth > MAX_WIDTH_FOR_AUTOMATION) return;

        try {
            // 1. Open conversation menu
            const menuButton = document.querySelector(SELECTOR_MENU_BUTTON);
            if (!menuButton) throw new Error('Menu button not found');
            menuButton.click();
            await sleep(WAIT_AFTER_MENU_CLICK);

            // 2. Click "Delete" in menu
            const deleteBtn = await pollForElement(SELECTOR_DELETE_BUTTON_IN_MENU, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (!deleteBtn) throw new Error('Delete button not found');
            deleteBtn.click();
            await sleep(WAIT_AFTER_DELETE_CLICK);

            // 3. Confirm deletion
            const confirmBtn = await pollForElement(SELECTOR_CONFIRM_BUTTON_IN_DIALOG, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (!confirmBtn) throw new Error('Confirm button not found');
            confirmBtn.click();

            // Wait before final button click to ensure UI update
            await sleep(WAIT_AFTER_CONFIRM_CLICK);

            // 4. Emulate click on final button
            const finalBtn = await pollForElement(SELECTOR_FINAL_BUTTON, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (finalBtn) {
                finalBtn.click();
            } else {
                console.warn('Final button not found:', SELECTOR_FINAL_BUTTON);
            }

        } catch (err) {
            console.error('Automation error:', err);
        }
    }

    // --- Keyboard shortcut listener ---
    document.addEventListener('keydown', function(event) {
        if (event.code === SHORTCUT_KEY_CODE && event.ctrlKey === USE_CTRL_KEY && event.shiftKey === USE_SHIFT_KEY && event.altKey === USE_ALT_KEY && event.metaKey === USE_META_KEY) {
            event.preventDefault();
            event.stopPropagation();
            performAutomationSequence();
        }
    }, true);

    // --- Manual trigger button insertion ---
    function insertManualTriggerButton() {
        const headers = document.querySelectorAll('div.response-container-header');
        headers.forEach(header => {
            if (header.querySelector('.delete-shortcut-button')) return;
            const moreBtn = header.querySelector('button[data-test-id="more-menu-button"]');
            if (!moreBtn) return;
            const wrapper = moreBtn.closest('div.menu-button-wrapper');
            if (!wrapper) return;
            const btn = document.createElement('button');
            btn.className = 'delete-shortcut-button';
            btn.title = 'Delete conversation (Ctrl+Shift+Backspace)';
            btn.textContent = '🗑️';
            btn.style.marginLeft = '8px';
            btn.style.padding = '4px';
            btn.style.border = 'none';
            btn.style.background = 'transparent';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', event => {
                event.preventDefault();
                performAutomationSequence();
            });
            wrapper.parentNode.insertBefore(btn, wrapper.nextSibling);
        });
    }

    // Observe DOM changes to insert button dynamically
    const observer = new MutationObserver(insertManualTriggerButton);
    observer.observe(document.body, { childList: true, subtree: true });
    insertManualTriggerButton();

})();
