'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

export interface HPane {
    expanded: string;
    title?: string; // Optional title for the modal
}

export interface FlowHPane {
    hpane: HPane | null;
    htmlRef: HTMLDivElement | null;
    setHPane: (hpane: HPane | null) => void;
    setHtmlRef: (node: HTMLDivElement | null) => void;
}

export const FlowHPaneContext = createContext<FlowHPane | null>(null);

export const FlowHPaneProvider = ({ children }: { children: ReactNode }) => {
    const [hpane, setHPane] = useState<HPane | null>(null);
    const [htmlRef, setHtmlRef] = useState<HTMLDivElement | null>(null)

    const value = { hpane, htmlRef, setHPane, setHtmlRef };

    return (
        <FlowHPaneContext.Provider value={value}>
            {children}
        </FlowHPaneContext.Provider>
    );
}

export const useFlowHPane = (): FlowHPane => {
    const context = useContext(FlowHPaneContext);
    if (!context) {
        throw new Error('useFlowHPane must be used within a FlowHPaneProvider');
    }
    return context;
}