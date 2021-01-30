import { SanityClient } from '@sanity/client';
import { CropMode, FitMode } from '@sanity/image-url/lib/types/types';
export interface shortCodeConfig {
    /**
     * SanityClient
     */
    client: SanityClient;
}
export interface Options {
    srcs: string;
    sizes: string;
    classList: string;
    crop?: CropMode;
    fit: FitMode;
    aspectRatio?: '1/1';
}
