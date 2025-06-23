// ==UserScript==
// @name         Gemini Conversation Delete Shortcut
// @name:en      Gemini Conversation Delete Shortcut
// @namespace    http://tampermonkey.net/
// @version      0.10
// @description:en  Deletes the current Gemini conversation on Gemini with Ctrl+Shift+Backspace. Includes layout check.
// @author       Takashi Sasaki
// @license      MIT
// @homepageURL  https://x.com/TakashiSasaki
// @match        https://gemini.google.com/app/*
// @grant        none
// @description Deletes the current Gemini conversation on Gemini with Ctrl+Shift+Backspace. Includes layout check.
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
    const SELECTOR_CONFIRM_BUTTON_IN_DIALOG = '[data-test-id="confirm-button"]'; // 削除確認ダイアログ内の「削除」/「確認」ボタン

    // ステップ間の待機時間 (ミリ秒)
    const WAIT_AFTER_MENU_CLICK = 100;
    const WAIT_AFTER_DELETE_CLICK = 100;

    // レイアウトチェックのための最大ウィンドウ幅
    // この幅よりもウィンドウが**広い**場合、要素が見つからないと想定して実行を中断します。
    // この値を適切に調整してください。
    const MAX_WIDTH_FOR_AUTOMATION = 960; // 例: 960px

    // --- スクリプト本体 ---

    // 自動化シーケンスの実行関数
    async function performAutomationSequence() {
        // レイアウトの確認
        const currentWidth = window.innerWidth;
        console.log(`Automation triggered. Current window width: ${currentWidth}px. Max width for automation: ${MAX_WIDTH_FOR_AUTOMATION}px.`);

        // 幅が広すぎる場合は処理中断
        if (currentWidth > MAX_WIDTH_FOR_AUTOMATION) {
            console.warn(`Automation skipped: Window width (${currentWidth}px) is too wide for the intended layout.`);
            return; // 幅が広すぎるため処理を中断
        }

        // 幅が適切なので処理続行
        console.log('Starting automation sequence...');

        try {
            console.log('Attempting to find and click menu button...');
            // 1. 会話メニューを開くボタンをクリック
            const menuButton = document.querySelector(SELECTOR_MENU_BUTTON);
            if (!menuButton) {
                console.error('Automation failed: Menu button not found:', SELECTOR_MENU_BUTTON);
                throw new Error('Menu button not found'); // エラーを投げてcatchブロックへ
            }
            menuButton.click();
            console.log('Menu button clicked.');

            await sleep(WAIT_AFTER_MENU_CLICK);
            console.log(`Waiting ${WAIT_AFTER_MENU_CLICK}ms and attempting to find and click delete button in menu...`);

            // 2. メニューが表示されるのを待機し、メニュー内の削除ボタンをクリック
            const deleteButtonInMenu = document.querySelector(SELECTOR_DELETE_BUTTON_IN_MENU);
            if (!deleteButtonInMenu) {
                 console.error('Automation failed: Delete button in menu not found:', SELECTOR_DELETE_BUTTON_IN_MENU);
                 throw new Error('Delete button in menu not found');
            }
            deleteButtonInMenu.click();
            console.log('Delete button in menu clicked.');

            await sleep(WAIT_AFTER_DELETE_CLICK);
            console.log(`Waiting ${WAIT_AFTER_DELETE_CLICK}ms and attempting to find and click confirm button in dialog...`);

            // 3. 削除確認ダイアログが表示されるのを待機し、ダイアログ内の確認ボタンをクリック
            const confirmButtonInDialog = document.querySelector(SELECTOR_CONFIRM_BUTTON_IN_DIALOG);
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

    // --- ショートカットキーイベントリスナー ---

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