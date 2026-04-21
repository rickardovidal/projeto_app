declare module 'html-docx-js' {
  export function asBlob(
    html: string,
    options?: {
      orientation?: 'portrait' | 'landscape';
      margins?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
        header?: number;
        footer?: number;
        gutter?: number;
      };
    },
  ): Blob;
}
