/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Post {
  id: number;
  content: string;
  tags: string[];
  isPublished: boolean;
  isAmateur?: boolean;
  isTeaching?: boolean;
  platform?: string;
  attrName?: string;
  attrLink?: string;
  attrHow?: string;
  attrWhy?: string;
  attrResonate?: string;
  date: string;
  media?: {
    type: 'image' | 'audio' | 'text';
    url: string;
    name?: string;
    content?: string;
  }[];
  aiPolished?: boolean;
  rehberType?: string;
  guideType?: string;
  sourceTag?: string;
}

export interface AppState {
  posts: Post[];
  chain: string;
  stars: number[];
  revisits: Record<number, string>;
}
