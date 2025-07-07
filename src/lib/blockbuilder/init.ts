import * as Blockly from "blockly"
import { LuaGenerator, luaGenerator } from "./luaugen/luau";
import toolbox from "./toolbox";

// Main block builder class
const DEFAULT_WIDTH = "70vw";
const DEFAULT_HEIGHT = "50vh";
export class BlockBuilder { 
    workspace: Blockly.WorkspaceSvg;
    luauGenerator: LuaGenerator;
    element: HTMLElement;
    constructor(div: HTMLElement) {
        if(!div) {
            throw new Error("BlockBuilder requires a valid HTML element to inject into.");
        }
        console.log("Initializing BlockBuilder with element:", div);
        div.style.width = DEFAULT_WIDTH
        div.style.height = DEFAULT_HEIGHT;
        this.element = div;

        const theme = Blockly.Theme.defineTheme('arblock', {
            name: 'arblock',
            base: Blockly.Themes.Classic,
            blockStyles: {},
            componentStyles: {
                workspaceBackgroundColour: "#1e1e1e",
                toolboxBackgroundColour: "#333",
                flyoutBackgroundColour: "#1e1e1e",
                
            }
        })

        this.workspace = Blockly.inject(div, {
            scrollbars: true,
            trashcan: true,
            zoom: {
                controls: true,
            },
            toolbox,
            theme
        });

        this.luauGenerator = luaGenerator;

        console.log(this.luauGenerator.workspaceToCode(this.workspace));
    }

    toCode(): string {
        return this.luauGenerator.workspaceToCode(this.workspace);
    }

    close() {
        this.workspace.clear(); // Clear the workspace
        this.workspace.dispose();
    }
}