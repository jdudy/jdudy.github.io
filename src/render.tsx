import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { basename, dirname, extname, join, relative, resolve } from 'path';
import { JSXInternal } from 'preact/src/jsx';
import render from 'preact-render-to-string';

import { Html } from './layouts/Html';

const SOURCE_DIR = resolve(process.cwd(), 'src/pages');
const DEST_DIR = resolve(process.cwd(), 'docs');

getFiles(SOURCE_DIR).forEach(async (file) => {

    const destination = destinationPath(file);

    if (basename(file) === 'index.tsx') {
        const module = await import(file);
        if (module.default && typeof module.default === 'function') {
            const page = renderPage(module.default);
            mkdirSync(dirname(destination), { recursive: true });
            writeFileSync(destination, page);
        }
    } else if (basename(file)[0] !== '_') {
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(file, destination);
    }

});

function getFiles(directory: string): string[] {
    const dirEntries = readdirSync(directory, { withFileTypes: true });
    const files = dirEntries.map((dirEntry) => {
        const path = resolve(directory, dirEntry.name);
        return dirEntry.isDirectory() ? getFiles(path) : path;
    });
    return Array.prototype.concat(...files);
}

function renderPage(Component: () => JSXInternal.Element) {
    const Page = () => (
        <Html title="jdudy">
            <Component />
        </Html>
    );
    return '<!DOCTYPE html>\n' + render(<Page />, {}, { pretty: '  ' });
}

function destinationPath(file: string) {
    let fileName: string;

    if (extname(file) === '.tsx') {
        fileName = basename(file, '.tsx').toLowerCase() + '.html';
    } else {
        fileName = basename(file);
    }

    return join(DEST_DIR, dirname(relative(SOURCE_DIR, file)), fileName);
}
