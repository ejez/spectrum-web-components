/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import postHTMLSpectrumTypeography from './posthtml-spectrum-typography.js';

// Add a few doc-specific transforms for code examples

export default postHTMLSpectrumTypeography({
    customTransforms: [
        {
            selector: 'pre',
            fn: (node) => {
                const code = node.content[0];
                if (code && code.tag === 'code') {
                    return {
                        tag: 'code-example',
                        content: code.content,
                        attrs: code.attrs,
                    };
                }
                return node;
            },
        },
    ],
});
