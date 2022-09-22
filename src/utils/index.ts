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

export function exportData(content: string, fileName: string, contentType: string): void {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export function moveInArray(arr: Array<any>, oldIndex: number, newIndex: number): void {
    if (newIndex >= arr.length) {
        let k = newIndex - arr.length + 1;
        while (k--) {
            arr.push(null);
        }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
}

export function insertToArray(arr: Array<any>, index: number, item: any): void {
    if (index < arr.length) {
        arr.splice(index, 0, item);
        return;
    }

    let k = index - arr.length + 1;
    while (k--) {
        arr.push(null);
    }
    arr[index] = item;
}
