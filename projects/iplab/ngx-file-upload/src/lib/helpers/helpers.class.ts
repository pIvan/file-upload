

export function IsNullOrEmpty<T extends any>(value: T | null | undefined): value is null | undefined;
export function IsNullOrEmpty(value: string | null | undefined): value is '';
export function IsNullOrEmpty(value: number | null | undefined): value is number;
export function IsNullOrEmpty(value: any[] | null | undefined): value is [];
export function IsNullOrEmpty(value: any): boolean {
    if (value == null) return true;
    if (typeof value === 'number') return false;
    return value.length === 0;
}
