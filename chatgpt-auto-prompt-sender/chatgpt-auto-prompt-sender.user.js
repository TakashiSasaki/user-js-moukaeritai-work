// ==UserScript==
// @name         ChatGPT Auto Prompt Sender
// @namespace    https://userscript.moukaeritai.work/
// @version      0.9.6.20230829
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
        const selector20230823 = "#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div > main > div > div.absolute > form > div > div.flex > div > button";
        const selector20230826 = "#__next > div > div > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div > main > div > div.absolute > form > div > div.flex > div > button";
        const selector20230829 = "#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div > main > div > div.absolute > form > div > div.flex > div > button";

        const button = document.querySelector(selector20230829);
        if(!button) {
            alert("The submit button could not be found. The structure of the ChatGPT webpage seems to have changed. Please wait for updates to the ChatGPT Auto Prompt Sender.");
        }
        button.style.background = "red";
        observer.observe(button, {attributes: true,
                                  childList: true,
                                  subtree: true
                                 });
    });

    // Your code here...
}, 1000);
