// Curated set of common open-source licenses, full text bundled at build time.
// Source: SPDX license list (https://spdx.org/licenses/) — only the popular ones.

export interface LicenseInfo {
  id: string
  name: string
  spdx: string
  description: string
  permissive: boolean
  copyleft: boolean
  needsAuthor: boolean
  needsYear: boolean
  text: string
}

const MIT = `MIT License

Copyright (c) {{year}} {{author}}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const ISC = `ISC License

Copyright (c) {{year}} {{author}}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
`;

const APACHE_2 = `                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   Copyright {{year}} {{author}}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   For the full Apache 2.0 license text (terms and conditions for use,
   reproduction, and distribution) see https://www.apache.org/licenses/LICENSE-2.0
`;

const BSD_2 = `BSD 2-Clause License

Copyright (c) {{year}}, {{author}}

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
`;

const BSD_3 = `BSD 3-Clause License

Copyright (c) {{year}}, {{author}}

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
`;

const GPL_3 = `                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) {{year}} {{author}}
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details.

You should have received a copy of the GNU General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.

For the full GPLv3 text and terms of use, see
https://www.gnu.org/licenses/gpl-3.0.txt
`;

const AGPL_3 = `                    GNU AFFERO GENERAL PUBLIC LICENSE
                       Version 3, 19 November 2007

 Copyright (C) {{year}} {{author}}
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

If you modify this Program and run it as a network service, you must offer
the corresponding source code to its users.

For the full AGPLv3 text, see https://www.gnu.org/licenses/agpl-3.0.txt
`;

const LGPL_3 = `                    GNU LESSER GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) {{year}} {{author}}
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

This library is free software; you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 3 of the License, or (at your
option) any later version.

This library is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public
License for more details.

For the full LGPLv3 text, see https://www.gnu.org/licenses/lgpl-3.0.txt
`;

const MPL_2 = `Mozilla Public License Version 2.0

Copyright (c) {{year}} {{author}}

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this file,
You can obtain one at https://mozilla.org/MPL/2.0/.

For the full MPL 2.0 text, see https://www.mozilla.org/en-US/MPL/2.0/
`;

const UNLICENSE = `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute
this software, either in source code form or as a compiled binary, for any
purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors of
this software dedicate any and all copyright interest in the software to
the public domain. We make this dedication for the benefit of the public
at large and to the detriment of our heirs and successors. We intend this
dedication to be an overt act of relinquishment in perpetuity of all
present and future rights to this software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>
`;

const CC0 = `CC0 1.0 Universal

The person who associated a work with this deed has dedicated the work to
the public domain by waiving all of his or her rights to the work
worldwide under copyright law, including all related and neighboring
rights, to the extent allowed by law.

You can copy, modify, distribute and perform the work, even for commercial
purposes, all without asking permission.

For the full CC0 1.0 text, see
https://creativecommons.org/publicdomain/zero/1.0/legalcode
`;

const WTFPL = `        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) {{year}} {{author}}

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
`;

export const LICENSES: LicenseInfo[] = [
  { id: 'mit', name: 'MIT License', spdx: 'MIT', description: 'Short, permissive. Most popular for libraries.', permissive: true, copyleft: false, needsAuthor: true, needsYear: true, text: MIT },
  { id: 'apache-2.0', name: 'Apache License 2.0', spdx: 'Apache-2.0', description: 'Permissive with explicit patent grant. Common for larger projects.', permissive: true, copyleft: false, needsAuthor: true, needsYear: true, text: APACHE_2 },
  { id: 'bsd-3-clause', name: 'BSD 3-Clause "New" License', spdx: 'BSD-3-Clause', description: 'Permissive, with no-endorsement clause.', permissive: true, copyleft: false, needsAuthor: true, needsYear: true, text: BSD_3 },
  { id: 'bsd-2-clause', name: 'BSD 2-Clause "Simplified" License', spdx: 'BSD-2-Clause', description: 'Permissive, very short.', permissive: true, copyleft: false, needsAuthor: true, needsYear: true, text: BSD_2 },
  { id: 'isc', name: 'ISC License', spdx: 'ISC', description: 'Permissive, MIT-equivalent. Default for npm.', permissive: true, copyleft: false, needsAuthor: true, needsYear: true, text: ISC },
  { id: 'mpl-2.0', name: 'Mozilla Public License 2.0', spdx: 'MPL-2.0', description: 'Weak copyleft per file. Modifications to MPL files must be open.', permissive: false, copyleft: true, needsAuthor: true, needsYear: true, text: MPL_2 },
  { id: 'lgpl-3.0', name: 'GNU Lesser GPL v3.0', spdx: 'LGPL-3.0-or-later', description: 'Weak copyleft for libraries. Linking from non-LGPL code allowed.', permissive: false, copyleft: true, needsAuthor: true, needsYear: true, text: LGPL_3 },
  { id: 'gpl-3.0', name: 'GNU GPL v3.0', spdx: 'GPL-3.0-or-later', description: 'Strong copyleft. Derivative works must also be GPL.', permissive: false, copyleft: true, needsAuthor: true, needsYear: true, text: GPL_3 },
  { id: 'agpl-3.0', name: 'GNU Affero GPL v3.0', spdx: 'AGPL-3.0-or-later', description: 'Strong copyleft including network use (SaaS).', permissive: false, copyleft: true, needsAuthor: true, needsYear: true, text: AGPL_3 },
  { id: 'unlicense', name: 'The Unlicense', spdx: 'Unlicense', description: 'Public-domain dedication.', permissive: true, copyleft: false, needsAuthor: false, needsYear: false, text: UNLICENSE },
  { id: 'cc0-1.0', name: 'Creative Commons CC0 1.0', spdx: 'CC0-1.0', description: 'Public-domain dedication; popular for non-software work.', permissive: true, copyleft: false, needsAuthor: false, needsYear: false, text: CC0 },
  { id: 'wtfpl', name: 'WTFPL', spdx: 'WTFPL', description: 'Do What The F*** You Want To Public License.', permissive: true, copyleft: false, needsAuthor: true, needsYear: true, text: WTFPL },
];

export function getLicense(id: string): LicenseInfo | undefined {
  return LICENSES.find(l => l.id === id);
}

export function renderLicense(id: string, opts: { author: string; year: string }): string {
  const lic = getLicense(id);
  if (!lic) {
    return '';
  }
  return lic.text
    .replace(/\{\{author\}\}/g, opts.author || '<author>')
    .replace(/\{\{year\}\}/g, opts.year || String(new Date().getFullYear()));
}
