import { sortPages } from '../src/report';
import { test, expect } from '@jest/globals';

test('sortPages 3 pages', () => {
    const input = {
        'https://wagslane.dev/path-1': 1,
        'https://wagslane.dev/': 5,
        'https://wagslane.dev/path-2': 3
    };
    const actual = sortPages(input);
    const expected = [
        ['https://wagslane.dev/', 5],
        ['https://wagslane.dev/path-2', 3],
        ['https://wagslane.dev/path-1', 1]
    ];
    expect(actual).toEqual(expected);
});

test('sortPages 6 pages', () => {
    const input = {
        'https://wagslane.dev/': 5,
        'https://wagslane.dev/path-1': 1,
        'https://wagslane.dev/path-2': 3,
        'https://wagslane.dev/path-3': 8,
        'https://wagslane.dev/path-4': 4,
        'https://wagslane.dev/path-5': 7
    };
    const actual = sortPages(input);
    const expected = [
        ['https://wagslane.dev/path-3', 8],
        ['https://wagslane.dev/path-5', 7],
        ['https://wagslane.dev/', 5],
        ['https://wagslane.dev/path-4', 4],
        ['https://wagslane.dev/path-2', 3],
        ['https://wagslane.dev/path-1', 1]
    ];
    expect(actual).toEqual(expected);
});