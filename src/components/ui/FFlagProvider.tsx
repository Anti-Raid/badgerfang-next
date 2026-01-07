'use client';

import { DEFAULT_FFLAGS, FFlag, FFlags } from '@/lib/fflags/fflags';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface IFFlagContext {
	fflags: FFlags;
	isLoaded: boolean;
	setFlag: (flag: FFlag, enabled: boolean) => void;
}

export const FFlagContext = createContext<IFFlagContext | null>(null);

export const FFlagProvider = ({ children }: { children: ReactNode }) => {
	const [fflags, setFflags] = useState<FFlags>(DEFAULT_FFLAGS);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const flagsFromBrowser = FFlags.initFromBrowser();
		setFflags(flagsFromBrowser);
		setIsLoaded(true);
	}, []);

	const setFlag = (flag: FFlag, enabled: boolean) => {
		fflags._set(flag, enabled);
		const newFflagsInstance = new FFlags({ ...fflags.flags });
		setFflags(newFflagsInstance);
	};

	const value = { fflags, setFlag, isLoaded };

	return <FFlagContext.Provider value={value}>{children}</FFlagContext.Provider>;
};

/**
 * This hook provides access to the feature flags (fflags) within the FFlagProvider context.
 * @returns The fflags that are currently set
 */
export const useFFlags = (): IFFlagContext => {
	const context = useContext(FFlagContext);
	if (!context) {
		throw new Error('useFFlags must be used within a FFlagProvider');
	}
	return context;
};
