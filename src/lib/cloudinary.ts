export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url; // secure_url provides the HTTPS version of the image
};

/**
 * Apply Cloudinary URL transformations to ensure consistent display sizes.
 * Inserts transformation parameters into the Cloudinary URL path.
 */
const applyTransformation = (url: string, transformation: string): string => {
    // Cloudinary URLs have the pattern: .../upload/v1234/filename.jpg
    // We insert transformations between /upload/ and /v1234/
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url; // Not a Cloudinary URL, return as-is
    const before = url.substring(0, uploadIndex + '/upload/'.length);
    const after = url.substring(uploadIndex + '/upload/'.length);
    return `${before}${transformation}/${after}`;
};

/**
 * Upload a logo image — returns a URL with 400x400 square crop transformation.
 */
export const uploadLogoToCloudinary = async (file: File): Promise<string> => {
    const rawUrl = await uploadImageToCloudinary(file);
    return applyTransformation(rawUrl, 'c_fill,w_400,h_400,g_face,q_auto,f_auto');
};

/**
 * Upload a gallery image — returns a URL with 800x600 crop transformation.
 */
export const uploadGalleryToCloudinary = async (file: File): Promise<string> => {
    const rawUrl = await uploadImageToCloudinary(file);
    return applyTransformation(rawUrl, 'c_fill,w_800,h_600,g_auto,q_auto,f_auto');
};

/**
 * Upload a banner image — returns a URL with 800x1000 portrait crop transformation (4:5 ratio matching catalogue cards).
 */
export const uploadBannerToCloudinary = async (file: File): Promise<string> => {
    const rawUrl = await uploadImageToCloudinary(file);
    return applyTransformation(rawUrl, 'c_fill,w_800,h_1000,g_auto,q_auto,f_auto');
};
