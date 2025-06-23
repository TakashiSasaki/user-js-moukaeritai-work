// ==UserScript==
// @name         ChatGPT Auto Prompt Sender
// @namespace    https://userscript.moukaeritai.work/
// @version      0.9.2.20230818
// @description  Automates sending of next pre-filled prompt in ChatGPT after current response completion.
// @author       Takashi SASAKI (https://twitter.com/TakashiSasaki)
// @match        https://chat.openai.com/c/*
// @match        https://chat.openai.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @supportURL   https://greasyfork.org/ja/scripts/472713
// @license      MIT
// @downloadURL none
// ==/UserScript==

setTimeout(function() {
    'use strict';

    const observer = new MutationObserver((mutationList, observer)=>{
        for(let mutation of mutationList){
            if(mutation.target.tagName ==="BUTTON"){
                console.log(mutation.target.children[0]);
                const child = mutation.target.children[0];
                if(child.tagName === "SPAN") {
                    if(!mutation.target.getAttribute("disabled")) {
                        observer.disconnect();
                        setTimeout(()=>mutation.target.click(),100);
                        return;
                    } //if
                }//if
            }//if
        }//for
    });

    let button;

    GM_registerMenuCommand("Schedule Next Prompt After Ongoing Response", ()=>{
        const selector20230809 = "#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div > main > div > form > div > div > button";
        const selector20230816 = "#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div > main > div > div.absolute > form > div > div.flex.flex-col.w-full.flex-grow > button";

        const button = document.querySelector(selector20230816);
        button.style.background = "red";
        observer.observe(button, {attributes: true,
                                  childList: true,
                                  subtree: true
                                 });
    });

    /*
    GM_registerMenuCommand("Open this user script in Github Gist", () => {
        GM_openInTab('https://gist.github.com/TakashiSasaki/730f930806ec1a6460ab350f7498d622/', { active: true });
    });

    GM_registerMenuCommand("Open this user script in Greasy Fork", () => {
        GM_openInTab('https://greasyfork.org/ja/scripts/472713', { active: true });
    });
    */

    // Your code here...
}, 1000);