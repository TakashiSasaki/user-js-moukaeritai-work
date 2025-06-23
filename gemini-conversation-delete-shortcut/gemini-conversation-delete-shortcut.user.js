// ==UserScript==
// @name         Gemini 会話削除ショートカット
// @name:en      Gemini Conversation Delete Shortcut
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Deletes the current Gemini conversation on Gemini with Ctrl+Shift+Backspace. Includes layout check and robust button finding.
// @description:en Deletes the current Gemini conversation on Gemini with Ctrl+Shift+Backspace using a single shortcut. Includes layout check and robust finding of dialog elements.
// @author       Takashi Sasaki
// @license      MIT
// @homepageURL  https://x.com/TakashiSasaki
// @match        https://gemini.google.com/app/*
// @grant        none
// @downloadURL none
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定 ---

    // ショートカットキー設定 (Ctrl + Shift + Backspace)
    const SHORTCUT_KEY_CODE = 'Backspace'; // event.code を使用
    const USE_CTRL_KEY = true;
    const USE_SHIFT_KEY = true;
    const USE_ALT_KEY = false;
    const USE_META_KEY = false; // Meta キー (Windowsキー, Commandキー)

    // 操作対象の要素セレクタ
    const SELECTOR_MENU_BUTTON = '[data-test-id="conversation-actions-button"]'; // 会話メニューを開くボタン
    const SELECTOR_DELETE_BUTTON_IN_MENU = '[data-test-id="delete-button"]'; // メニュー内の「削除」ボタン
    // 削除確認ダイアログ内の「確認」ボタンのセレクタ
    // data-test-id が最も安定していると想定されるが、見つからない場合は他のセレクタも検討
    const SELECTOR_CONFIRM_BUTTON_IN_DIALOG = '[data-test-id="confirm-button"]';

    // ステップ間の待機時間 (ミリ秒) - これはクリック後の「最初の」短い待機として残す
    const WAIT_AFTER_MENU_CLICK = 100;
    const WAIT_AFTER_DELETE_CLICK = 100; // この待機後、ポーリングで要素を待つ

    // 要素探索のポーリング設定
    const POLLING_INTERVAL = 50; // 要素が見つかるかチェックする間隔 (ms)
    const MAX_POLLING_TIME = 3000; // 要素を見つけるまで試行する最大時間 (ms)

    // レイアウトチェックのための最大ウィンドウ幅 (変更なし)
    const MAX_WIDTH_FOR_AUTOMATION = 960; // 例: 960px

    // --- スクリプト本体 ---

    // 指定したミリ秒だけ待機する非同期関数 (変更なし)
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 指定したセレクタの要素が出現するまでポーリングで待つ関数
    async function pollForElement(selector, maxTime, interval) {
        const startTime = Date.now();
        let element = null;

        while (Date.now() - startTime < maxTime) {
            element = document.querySelector(selector);
            if (element) {
                console.log(`Element "${selector}" found after ${Date.now() - startTime}ms.`);
                return element; // 要素が見つかったらそれを返す
            }
            await sleep(interval); // 見つからなければ指定間隔待つ
        }

        console.warn(`Element "${selector}" not found within ${maxTime}ms.`);
        return null; // 最大時間を超えても見つからなければ null を返す
    }


    // 自動化シーケンスの実行関数
    async function performAutomationSequence() {
        // レイアウトの確認
        const currentWidth = window.innerWidth;
        console.log(`Automation triggered. Current window width: ${currentWidth}px. Max width for automation: ${MAX_WIDTH_FOR_AUTOMATION}px.`);

        if (currentWidth > MAX_WIDTH_FOR_AUTOMATION) {
            console.warn(`Automation skipped: Window width (${currentWidth}px) is too wide for the intended layout.`);
            return; // 幅が広すぎるため処理を中断
        }

        console.log('Starting automation sequence...');

        try {
            console.log('Attempting to find and click menu button...');
            // 1. 会話メニューを開くボタンをクリック
            // このボタンは通常ページロード時に存在するため、ポーリングは不要と想定
            const menuButton = document.querySelector(SELECTOR_MENU_BUTTON);
            if (!menuButton) {
                console.error('Automation failed: Menu button not found:', SELECTOR_MENU_BUTTON);
                throw new Error('Menu button not found');
            }
            menuButton.click();
            console.log('Menu button clicked.');

            await sleep(WAIT_AFTER_MENU_CLICK);
            console.log(`Initial wait ${WAIT_AFTER_MENU_CLICK}ms. Attempting to find and click delete button in menu...`);

            // メニュー内のボタンも、出現に時間差がある可能性があるためポーリングを導入
            const deleteButtonInMenu = await pollForElement(SELECTOR_DELETE_BUTTON_IN_MENU, MAX_POLLING_TIME, POLLING_INTERVAL);
            if (!deleteButtonInMenu) {
                 console.error('Automation failed: Delete button in menu not found:', SELECTOR_DELETE_BUTTON_IN_MENU);
                 throw new Error('Delete button in menu not found');
            }
            deleteButtonInMenu.click();
            console.log('Delete button in menu clicked.');

            await sleep(WAIT_AFTER_DELETE_CLICK);
            console.log(`Initial wait ${WAIT_AFTER_DELETE_CLICK}ms. Attempting to find and click confirm button in dialog (polling)...`);

            // 確認ボタンが出現するまでポーリングで待つ
            const confirmButtonInDialog = await pollForElement(SELECTOR_CONFIRM_BUTTON_IN_DIALOG, MAX_POLLING_TIME, POLLING_INTERVAL);

            if (!confirmButtonInDialog) {
                 console.error('Automation failed: Confirm button in dialog not found:', SELECTOR_CONFIRM_BUTTON_IN_DIALOG);
                 throw new Error('Confirm button in dialog not found');
            }
            confirmButtonInDialog.click();
            console.log('Confirm button in dialog clicked. Sequence complete.');

            // 成功時の処理
            console.log('Automation sequence completed successfully.');

        } catch (error) {
            console.error('An error occurred during the automation sequence:', error);
        }
    }

    // 指定したミリ秒だけ待機する非同期関数 (変更なし)
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- ショートカットキーイベントリスナー --- (変更なし)

     document.addEventListener('keydown', function(event) {
        // 設定したショートカットキーか判定
        if (event.code === SHORTCUT_KEY_CODE &&
            event.ctrlKey === USE_CTRL_KEY &&
            event.shiftKey === USE_SHIFT_KEY &&
            event.altKey === USE_ALT_KEY &&
            event.metaKey === USE_META_KEY)
        {
            event.preventDefault();
            event.stopPropagation();

            console.log('Shortcut key (Ctrl+Shift+Backspace) detected.');

            performAutomationSequence();
        }
    }, true); // キャプチャフェーズでイベントを捕捉


})();