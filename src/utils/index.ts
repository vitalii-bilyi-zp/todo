export function setSessionStorageObject(key: string, value: unknown) {
    try {
        const strValue: string = JSON.stringify(value);
        sessionStorage.setItem(key, strValue);
    } catch {
        //
    }
}

export function getSessionStorageObject(key: string) {
    try {
        const strValue: string | null = sessionStorage.getItem(key);

        if (strValue) {
            return JSON.parse(strValue);
        }

        return null;
    } catch {
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function debounce<T extends Function>(func: T, wait = 100) {
    let timeout: number;
    const callable = (...args: any) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };

    return <T>(<any>callable);
}
