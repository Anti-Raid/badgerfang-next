export enum FFlag {
    // Should the forum be visible on the header (mostly for internal testing)
    Header_ForumVisible = 'Header_ForumVisible',
    // Should the script shop be visible on the header (mostly for internal testing)
    Header_ScriptShopVisible = 'Header_ScriptShopVisible',
    // Should flow be enabled
    Flow_IsEnabled = 'Flow_IsEnabled',
    // Use horizontal pane instead of modal for editing node properties in flow
    Flow_NodeEditor_HorizontalPane = 'Flow_NodeEditor_HorizontalPane',
}

export const stringToFFlag = (flag: string): FFlag | null => {
    switch (flag) {
        case 'Header_ForumVisible':
            return FFlag.Header_ForumVisible;
        case 'Header_ScriptShopVisible':
            return FFlag.Header_ScriptShopVisible;
        case 'Flow_IsEnabled':
            return FFlag.Flow_IsEnabled;
        case 'Flow_NodeEditor_HorizontalPane':
            return FFlag.Flow_NodeEditor_HorizontalPane;
        default:
            return null;
    }
}

export const fflagToString = (flag: FFlag): string => {
    switch (flag) {
        case FFlag.Header_ForumVisible:
            return 'Header_ForumVisible';
        case FFlag.Header_ScriptShopVisible:
            return 'Header_ScriptShopVisible';
        case FFlag.Flow_NodeEditor_HorizontalPane:
            return 'Flow_NodeEditor_HorizontalPane';
        case FFlag.Flow_IsEnabled:
            return 'Flow_IsEnabled';
    }
}

export class FFlags {
    flags: Record<FFlag, boolean>;

    constructor(flags: Record<FFlag, boolean>) {
        this.flags = flags;
    }

    /**
     * Retrieves whether a feature flag is enabled or disabled.
     * @param flag The flag
     * @returns the flag
     */
    has(flag: FFlag): boolean {
        return this.flags[flag];
    }

    /**
     * Sets a feature flag to enabled or disabled. Also updates localStorage in the browser.
     * @param flag The flag
     * @param enabled Whether the flag is enabled or not
     */
    set(flag: FFlag, enabled: boolean) {
        this.flags[flag] = enabled;
        this.setOnBrowser();
    }

    private setOnBrowser() {
        if (typeof window === 'undefined') {
            return;
        }

        let flagObj: Record<string, boolean> = {};
        for (const [flag, enabled] of Object.entries(this.flags)) {
            flagObj[fflagToString(flag as FFlag)] = enabled;
        }

        localStorage.setItem('badger_fflags', JSON.stringify(flagObj));
    }

    static initFromBrowser(): FFlags {
        if (typeof window === 'undefined') {
            return DEFAULT_FFLAGS;
        }

        let fflagList = localStorage.getItem('badger_fflags');
        if (!fflagList) {
            return DEFAULT_FFLAGS;
        }
        let parsedObj: Record<string, boolean>;
        try {
            parsedObj = JSON.parse(fflagList);
        } catch (e) {
            return DEFAULT_FFLAGS;
        }

        // Start with default flags, then override with any stored flags
        let flagObj: Record<FFlag, boolean> = { ...DEFAULT_FLAG_LIST };
        for (const [flag, enabled] of Object.entries(parsedObj)) {
            const fflag = stringToFFlag(flag);
            if (fflag) {
                flagObj[fflag] = enabled;
            }
        }

        return new FFlags(flagObj);
    }
}

export const DEFAULT_FLAG_LIST: Record<FFlag, boolean> = {
    [FFlag.Header_ForumVisible]: true,
    [FFlag.Header_ScriptShopVisible]: true,
    [FFlag.Flow_NodeEditor_HorizontalPane]: false,
    [FFlag.Flow_IsEnabled]: true,
}

export const DEFAULT_FFLAGS = new FFlags(DEFAULT_FLAG_LIST);