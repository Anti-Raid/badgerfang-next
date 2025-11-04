'use client';
import { Primary, Secondary } from "@/components/ui/Buttons";
import { useFFlags } from "@/components/ui/FFlagProvider";
import { DEFAULT_FLAG_LIST, FFlag } from "@/lib/fflags/fflags";

export const FFlagEditor = () => {
    const { fflags, setFlag, isLoaded } = useFFlags();

    if (!isLoaded) {
        return <p>Loading flags...</p>;
    }

    const handleToggle = (flag: FFlag, enabled: boolean) => {
        setFlag(flag, enabled);
    };

    return (
        <>
            <div className="space-y-4">
                {(Object.keys(DEFAULT_FLAG_LIST) as FFlag[]).map((flag) => (
                    <div key={flag} className="flex items-center justify-between p-3 rounded-md">
                        <p className="font-medium">{flag} ({fflags.has(flag) ? "ENABLED" : "DISABLED"})</p>
                        {!fflags.has(flag) ? (
                            <>
                                <Primary 
                                    Title="Enable"
                                    onClick={() => handleToggle(flag, true)}
                                />
                            </>
                        ) : (
                            <>
                                <Secondary 
                                    Title="Disable"
                                    onClick={() => handleToggle(flag, false)}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};