const timeMap = {
    [1]: 'ms',
    [1000]: 's',
    [60 * 1000]: 'm',
    [60 * 60 * 1000]: 'h',
    [24 * 60 * 60 * 1000]: 'd',
}

export const humanTime = (timeMs: number): string => {
    return (Object.keys(timeMap) as never as number[])
        .sort((a, b) => b - a)
        .reduce((acc, t) => ({ timeLeftMs: acc.timeLeftMs % t, result: Math.floor(acc.timeLeftMs / t) > 0 ? `${acc.result}${Math.floor(acc.timeLeftMs / t)}${timeMap[t]}` : acc.result }), { timeLeftMs: timeMs, result: '' }).result;
}