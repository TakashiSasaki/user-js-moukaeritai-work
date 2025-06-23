// ==UserScript==
// @name         Gemini Conversation Delete Shortcut
// @namespace    https://x.com/TakashiSasaki/greasyfork/533285
// @version      1.5.8
// @description  Deletes the current Gemini conversation with a keyboard shortcut or button, and provides a Tampermonkey menu command to show script status, including header detection count and insertion logs.
// @author       Takashi Sasasaki
// @license      MIT
// @homepageURL  https://x.com/TakashiSasaki
// @match        https://gemini.google.com/app/*
// @grant        GM_registerMenuCommand
// @downloadURL none
// ==/UserScript==

(function() {
    'use strict';

    // --- Register Tampermonkey menu command for status ---
    GM_registerMenuCommand('Show delete shortcut status', () => {
        const headers = document.querySelectorAll('div.response-container-header');
        const currentUrl = window.location.href;
        alert(
            `Gemini Conversation Delete Shortcut is active (version 1.5.8).\n` +
            `URL: ${currentUrl}\n` +
            `Found ${headers.length} elements matching div.response-container-header.`
        );
        console.log(`Delete Shortcut Status: URL=${currentUrl}, Found ${headers.length} headers.`);
    });

    // --- Configuration ---
    const SHORTCUT_KEY_CODE = 'Backspace';
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
    const WAIT_AFTER_CONFIRM_CLICK = 100;
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
        if (window.innerWidth > MAX_WIDTH_FOR_AUTOMATION) return;
        try {
            const menuButton = document.querySelector(SELECTOR_MENU_BUTTON);
            if (!menuButton) throw new Error('Menu button not found');
            menuButton.click();
            await sleep(WAIT_AFTER_MENU_CLICK);

            const deleteBtn = await pollForElement(SELECTOR_DELETE_BUTTON_IN_MENU, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (!deleteBtn) throw new Error('Delete button not found');
            deleteBtn.click();
            await sleep(WAIT_AFTER_DELETE_CLICK);

            const confirmBtn = await pollForElement(SELECTOR_CONFIRM_BUTTON_IN_DIALOG, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (!confirmBtn) throw new Error('Confirm button not found');
            confirmBtn.click();
            await sleep(WAIT_AFTER_CONFIRM_CLICK);

            const finalBtn = await pollForElement(SELECTOR_FINAL_BUTTON, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (finalBtn) finalBtn.click();
            else console.warn('Final button not found:', SELECTOR_FINAL_BUTTON);
        } catch (err) {
            console.error('Automation error:', err);
        }
    }

    // --- Keyboard shortcut listener ---
    document.addEventListener('keydown', event => {
        if (event.code === SHORTCUT_KEY_CODE &&
            event.ctrlKey === USE_CTRL_KEY &&
            event.shiftKey === USE_SHIFT_KEY &&
            event.altKey === USE_ALT_KEY &&
            event.metaKey === USE_META_KEY) {
            event.preventDefault();
            event.stopPropagation();
            performAutomationSequence();
        }
    }, true);

    // --- Manual trigger button insertion with tracing ---
    function insertManualTriggerButton() {
        // Select generic menu-button-wrapper only
        const wrapperSelector = 'div.menu-button-wrapper';
        const wrappers = document.querySelectorAll(wrapperSelector);
        console.log(`insertManualTriggerButton called: found ${wrappers.length} wrappers.`);
        wrappers.forEach((wrapper, index) => {
            console.log(`Processing wrapper ${index + 1}/${wrappers.length}:`, wrapper);
            if (wrapper.parentNode.querySelector('.delete-shortcut-button')) {
                console.log('  Skipping: delete-shortcut-button already exists near this wrapper');
                return;
            }
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
            console.log('  Inserted delete button');
        });
    }

    const observer = new MutationObserver(insertManualTriggerButton);
    observer.observe(document.body, { childList: true, subtree: true });
    insertManualTriggerButton();

})();
