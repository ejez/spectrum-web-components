/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/dialog/sp-dialog.js';
import { Dialog } from '@spectrum-web-components/dialog';
import '@spectrum-web-components/popover/sp-popover.js';
import { Popover } from '@spectrum-web-components/popover';
import { Overlay, Placement } from '../';

import { waitForPredicate, isVisible } from '../../../test/testing-helpers.js';
import {
    fixture,
    html,
    expect,
    elementUpdated,
    waitUntil,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';

describe('Overlays', () => {
    let testDiv!: HTMLDivElement;
    let openOverlays: (() => void)[] = [];

    beforeEach(async () => {
        testDiv = await fixture<HTMLDivElement>(
            html`
                <div id="top">
                    <style>
                        body {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }

                        #top {
                            margin: 100px;
                        }

                        sp-button {
                            flex: none;
                        }

                        #overlay-content {
                            display: none;
                        }
                    </style>
                    <sp-button
                        id="first-button"
                        variant="primary"
                        slot="trigger"
                    >
                        Show Popover
                    </sp-button>
                    <div id="overlay-content">
                        <sp-popover
                            id="outer-popover"
                            dialog
                            slot="click-content"
                            direction="bottom"
                            tip
                            open
                        >
                            <div class="options-popover-content">
                                A popover message
                            </div>
                        </sp-popover>
                        <div id="hover-1" class="hover-content">
                            Hover message
                        </div>
                        <div id="hover-2" class="hover-content">
                            Other hover message
                        </div>
                    </div>
                </div>
            `
        );
        await elementUpdated(testDiv);
    });

    afterEach(() => {
        openOverlays.map((close) => close());
        openOverlays = [];
    });

    [
        'bottom',
        'bottom-start',
        'bottom-end',
        'top',
        'top-start',
        'top-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
        'none',
    ].map((direction) => {
        const placement = direction as Placement;
        it(`opens a popover - ${placement}`, async () => {
            const button = testDiv.querySelector(
                '#first-button'
            ) as HTMLElement;
            const outerPopover = testDiv.querySelector(
                '#outer-popover'
            ) as Popover;

            expect(outerPopover.parentElement).to.exist;
            if (outerPopover.parentElement) {
                expect(outerPopover.parentElement.id).to.equal(
                    'overlay-content'
                );
            }

            expect(isVisible(outerPopover)).to.be.false;

            expect(button).to.exist;

            openOverlays.push(
                await Overlay.open(button, 'click', outerPopover, {
                    delayed: false,
                    placement,
                    offset: 10,
                })
            );

            // Wait for the DOM node to be stolen and reparented into the overlay
            await waitForPredicate(
                () =>
                    !!(
                        outerPopover.parentElement &&
                        outerPopover.parentElement.id !== 'overlay-content'
                    )
            );

            expect(outerPopover.parentElement).to.exist;
            if (outerPopover.parentElement) {
                expect(outerPopover.parentElement.id).not.to.equal(
                    'overlay-content'
                );
            }
            expect(isVisible(outerPopover)).to.be.true;
        });
    });

    it(`updates a popover`, async () => {
        const button = testDiv.querySelector('#first-button') as HTMLElement;
        const outerPopover = testDiv.querySelector('#outer-popover') as Popover;

        expect(outerPopover.parentElement).to.exist;
        if (outerPopover.parentElement) {
            expect(outerPopover.parentElement.id).to.equal('overlay-content');
        }

        expect(isVisible(outerPopover)).to.be.false;

        expect(button).to.exist;

        openOverlays.push(
            await Overlay.open(button, 'click', outerPopover, {
                delayed: false,
                offset: 10,
            })
        );

        // Wait for the DOM node to be stolen and reparented into the overlay
        await waitForPredicate(
            () =>
                !!(
                    outerPopover.parentElement &&
                    outerPopover.parentElement.id !== 'overlay-content'
                )
        );

        expect(isVisible(outerPopover)).to.be.true;

        Overlay.update();

        expect(isVisible(outerPopover)).to.be.true;
    });

    it(`opens a popover w/ delay`, async () => {
        const button = testDiv.querySelector('#first-button') as HTMLElement;
        const outerPopover = testDiv.querySelector('#outer-popover') as Popover;

        expect(outerPopover.parentElement).to.exist;
        if (outerPopover.parentElement) {
            expect(outerPopover.parentElement.id).to.equal('overlay-content');
        }

        expect(isVisible(outerPopover)).to.be.false;

        expect(button).to.exist;

        openOverlays.push(
            await Overlay.open(button, 'click', outerPopover, {
                delayed: true,
                offset: 10,
            })
        );

        // Wait for the DOM node to be stolen and reparented into the overlay
        await waitUntil(
            () =>
                !!(
                    outerPopover.parentElement &&
                    outerPopover.parentElement.id !== 'overlay-content'
                ),
            'overlay opened'
        );

        expect(outerPopover.parentElement).to.exist;
        if (outerPopover.parentElement) {
            expect(outerPopover.parentElement.id).not.to.equal(
                'overlay-content'
            );
        }
        expect(isVisible(outerPopover)).to.be.true;
    });

    it('opens hover overlay', async () => {
        const button = testDiv.querySelector('#first-button') as HTMLElement;
        const hoverOverlay = testDiv.querySelector('#hover-1') as HTMLElement;
        const clickOverlay = testDiv.querySelector(
            '#outer-popover'
        ) as HTMLElement;

        expect(button).to.exist;
        expect(hoverOverlay).to.exist;

        expect(isVisible(hoverOverlay)).to.be.false;
        expect(isVisible(clickOverlay)).to.be.false;

        openOverlays.push(
            await Overlay.open(button, 'hover', hoverOverlay, {
                delayed: false,
                placement: 'top',
                offset: 10,
            })
        );

        // Wait for the DOM node to be stolen and reparented into the overlay
        await waitForPredicate(
            () =>
                !!(
                    hoverOverlay.parentElement &&
                    hoverOverlay.parentElement.id !== 'overlay-content'
                )
        );

        expect(hoverOverlay.parentElement).to.exist;
        if (hoverOverlay.parentElement) {
            expect(hoverOverlay.parentElement.id).not.to.equal(
                'overlay-content'
            );
        }
        expect(isVisible(hoverOverlay)).to.be.true;

        // Opening click overlay should close the hover overlay
        openOverlays.push(
            await Overlay.open(button, 'click', clickOverlay, {
                delayed: false,
                placement: 'bottom',
                offset: 10,
            })
        );

        // Wait for the DOM node to be stolen and reparented into the overlay
        await waitForPredicate(
            () =>
                !!(
                    clickOverlay.parentElement &&
                    clickOverlay.parentElement.id !== 'overlay-content' &&
                    hoverOverlay.parentElement &&
                    hoverOverlay.parentElement.id === 'overlay-content'
                )
        );

        if (hoverOverlay.parentElement) {
            expect(hoverOverlay.parentElement.id).to.equal('overlay-content');
        }

        expect(isVisible(hoverOverlay)).to.be.false;
        expect(isVisible(clickOverlay)).to.be.true;
    });

    it('opens custom overlay', async () => {
        const button = testDiv.querySelector('#first-button') as HTMLElement;
        const customOverlay = testDiv.querySelector('#hover-1') as HTMLElement;
        const clickOverlay = testDiv.querySelector(
            '#outer-popover'
        ) as HTMLElement;

        expect(button).to.exist;
        expect(customOverlay).to.exist;

        expect(isVisible(customOverlay)).to.be.false;
        expect(isVisible(clickOverlay)).to.be.false;

        openOverlays.push(
            await Overlay.open(button, 'custom', customOverlay, {
                delayed: false,
                placement: 'top',
                offset: 10,
            })
        );

        // Wait for the DOM node to be stolen and reparented into the overlay
        await waitForPredicate(
            () =>
                !!(
                    customOverlay.parentElement &&
                    customOverlay.parentElement.id !== 'overlay-content'
                )
        );

        expect(customOverlay.parentElement).to.exist;
        if (customOverlay.parentElement) {
            expect(customOverlay.parentElement.id).not.to.equal(
                'overlay-content'
            );
        }
        expect(isVisible(customOverlay)).to.be.true;

        // Opening click overlay should close the hover overlay
        openOverlays.push(
            await Overlay.open(button, 'click', clickOverlay, {
                delayed: false,
                placement: 'bottom',
                offset: 10,
            })
        );

        // Wait for the DOM node to be stolen and reparented into the overlay
        await waitForPredicate(
            () =>
                !!(
                    clickOverlay.parentElement &&
                    clickOverlay.parentElement.id !== 'overlay-content'
                )
        );

        expect(isVisible(customOverlay)).to.be.true;
        expect(isVisible(clickOverlay)).to.be.true;
    });

    it('closes via events', async () => {
        const el = await fixture<HTMLDivElement>(html`
            <div id="root">
                <sp-dialog dismissable></sp-dialog>
            </div>
        `);

        const dialog = el.querySelector('sp-dialog') as Dialog;

        openOverlays.push(
            await Overlay.open(el, 'click', dialog, {
                delayed: false,
                placement: 'bottom',
                offset: 10,
            })
        );

        await waitUntil(
            () =>
                !!dialog.parentElement &&
                dialog.parentElement.tagName === 'ACTIVE-OVERLAY',
            'content is stolen'
        );

        dialog.close();

        await waitUntil(
            () =>
                !!dialog.parentElement &&
                dialog.parentElement.tagName !== 'ACTIVE-OVERLAY',
            'content is returned'
        );
    });

    it('closes an inline overlay when tabbing past the content', async () => {
        const el = await fixture<HTMLDivElement>(html`
            <div>
                <button class="trigger">Trigger</button>
                <div class="content">
                    <input />
                </div>
                <a href="#">After</a>
            </div>
        `);

        const trigger = el.querySelector('.trigger') as HTMLElement;
        const content = el.querySelector('.content') as HTMLElement;
        const input = el.querySelector('input') as HTMLInputElement;
        const after = el.querySelector('a') as HTMLAnchorElement;

        openOverlays.push(await Overlay.open(trigger, 'inline', content, {}));

        trigger.focus();
        await sendKeys({
            press: 'Tab',
        });

        expect(document.activeElement === input);
        expect(input.closest('active-overlay') !== null);

        await sendKeys({
            press: 'Shift+Tab',
        });

        expect(document.activeElement === trigger);

        await sendKeys({
            press: 'Tab',
        });

        expect(document.activeElement === input);

        await sendKeys({
            press: 'Tab',
        });

        expect(document.activeElement === after);
        await waitUntil(
            () => document.querySelector('active-element') === null
        );
    });

    it('closes an inline overlay when tabbing before the trigger', async () => {
        const el = await fixture<HTMLDivElement>(html`
            <div>
                <a href="#">Before</a>
                <button class="trigger">Trigger</button>
                <div class="content">
                    <label>
                        Content in an inline overlay.
                        <input />
                    </label>
                </div>
            </div>
        `);

        const trigger = el.querySelector('.trigger') as HTMLElement;
        const content = el.querySelector('.content') as HTMLElement;
        const input = el.querySelector('input') as HTMLInputElement;
        const before = el.querySelector('a') as HTMLAnchorElement;

        openOverlays.push(await Overlay.open(trigger, 'inline', content, {}));

        trigger.focus();
        await sendKeys({
            press: 'Tab',
        });

        expect(document.activeElement === input);
        expect(input.closest('active-overlay') !== null);

        await sendKeys({
            press: 'Shift+Tab',
        });

        expect(document.activeElement === trigger);

        await sendKeys({
            press: 'Shift+Tab',
        });

        expect(document.activeElement === before);
        await waitUntil(
            () => document.querySelector('active-element') === null
        );
    });
});
