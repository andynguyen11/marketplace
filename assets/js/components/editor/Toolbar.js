import React from 'react'
export default function Toolbar({id}){
    return (
        <div id={id} className="toolbar" dangerouslySetInnerHTML={{__html: `
            <!--<span class="ql-formats">-->
                <!--<select class="ql-header">-->
                    <!--<option value="1">Heading</option>-->
                    <!--<option value="2">Subheading</option>-->
                    <!--<option selected>Normal</option>-->
                <!--</select>-->
                <!--<select class="ql-font">-->
                    <!--<option selected>Sans Serif</option>-->
                    <!--<option value="serif">Serif</option>-->
                    <!--<option value="monospace">Monospace</option>-->
                <!--</select>-->
            <!--</span>-->
            <span class="ql-formats">
                <button class="ql-bold"></button>
                <button class="ql-italic"></button>
                <button class="ql-underline"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-list" value="ordered"></button>
                <button class="ql-list" value="bullet"></button>
                <!--<select class="ql-align">-->
                    <!--<option selected></option>-->
                    <!--<option value="center"></option>-->
                    <!--<option value="right"></option>-->
                    <!--<option value="justify"></option>-->
                <!--</select>-->
            </span>
            <span class="ql-formats">
                <!--<button class="ql-link"></button>-->
                <button class="ql-image"></button>
                <!-- button class="ql-video"></button -->
            </span>
            <!--span class="ql-formats">
                <button class="ql-formula"></button>
                <button class="ql-code-block"></button>
            </span-->
            <!--<span class="ql-formats">-->
                <!--<button class="ql-clean"></button>-->
            <!--</span>-->
        `}}/>
    )
}
