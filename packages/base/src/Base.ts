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

import { LitElement, property, UpdatingElement } from 'lit-element';
type ThemeRoot = HTMLElement & {
    startManagingDescendent: (el: HTMLElement) => void;
    stopManagingDescendent: (el: HTMLElement) => void;
};

type Constructor<T = Record<string, unknown>> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
    prototype: T;
};

export interface SpectrumInterface {
    shadowRoot: ShadowRoot;
    isLTR: boolean;
    dir: 'ltr' | 'rtl';
}

const observedForElements: Set<HTMLElement> = new Set();

const updateFromScopeRoot = (): void => {
    const dir =
        document.documentElement.dir === 'rtl'
            ? document.documentElement.dir
            : 'ltr';
    const lang = document.documentElement.lang || navigator.language;
    observedForElements.forEach((el) => {
        el.setAttribute('dir', dir);
        el.setAttribute('lang', lang);
    });
};

const rtlObserver = new MutationObserver(updateFromScopeRoot);

rtlObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dir', 'lang'],
});

type ContentDirectionManager = HTMLElement & {
    startManagingDescendent?(): void;
};

const canManageContentDirection = (el: ContentDirectionManager): boolean =>
    typeof el.startManagingDescendent !== 'undefined' ||
    el.tagName === 'SP-THEME';

export function SpectrumMixin<T extends Constructor<UpdatingElement>>(
    constructor: T
): T & Constructor<SpectrumInterface> {
    class SlotTextObservingElement extends constructor {
        /**
         * @private
         */
        public shadowRoot!: ShadowRoot;
        private _scopeRoot?: HTMLElement;

        /**
         * @private
         */
        @property({ reflect: true })
        public dir: 'ltr' | 'rtl' = 'ltr';

        /**
         * @private
         */
        @property({ reflect: true })
        public lang = '';

        /**
         * @private
         */
        public get isLTR(): boolean {
            return this.dir === 'ltr';
        }

        public connectedCallback(): void {
            if (!this.hasAttribute('dir')) {
                let scopeRoot = ((this as HTMLElement).assignedSlot ||
                    this.parentNode) as HTMLElement;
                while (
                    scopeRoot !== document.documentElement &&
                    !canManageContentDirection(
                        scopeRoot as ContentDirectionManager
                    )
                ) {
                    scopeRoot = ((scopeRoot as HTMLElement).assignedSlot || // step into the shadow DOM of the parent of a slotted node
                        scopeRoot.parentNode || // DOM Element detected
                        ((scopeRoot as unknown) as ShadowRoot)
                            .host) as HTMLElement;
                }
                this.dir =
                    scopeRoot.dir === 'rtl' ? scopeRoot.dir : this.dir || 'ltr';
                this.lang =
                    scopeRoot.lang ||
                    document.documentElement.lang ||
                    navigator.language;
                if (scopeRoot === document.documentElement) {
                    observedForElements.add(this);
                } else {
                    const { localName } = scopeRoot;
                    if (
                        localName.search('-') > -1 &&
                        !customElements.get(localName)
                    ) {
                        customElements.whenDefined(localName).then(() => {
                            (scopeRoot as ThemeRoot).startManagingDescendent(
                                this
                            );
                        });
                    } else {
                        (scopeRoot as ThemeRoot).startManagingDescendent(this);
                    }
                }
                this._scopeRoot = scopeRoot as HTMLElement;
            }
            super.connectedCallback();
        }

        public disconnectedCallback(): void {
            super.disconnectedCallback();
            if (this._scopeRoot) {
                if (this._scopeRoot === document.documentElement) {
                    observedForElements.delete(this);
                } else {
                    (this._scopeRoot as ThemeRoot).stopManagingDescendent(this);
                }
                this.removeAttribute('dir');
                this.removeAttribute('lang');
            }
        }
    }
    return SlotTextObservingElement;
}

export class SpectrumElement extends SpectrumMixin(LitElement) {}
