/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * Recursively transforms _id keys to id in an object and its nested objects
 * @param obj The object to transform
 * @returns A new object with _id keys changed to id
 */
export const transformIdKey = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Normalize Mongoose Documents to plain objects
  if (typeof obj.toObject === 'function') {
    try {
      // toObject() yields a plain JS object without Mongoose prototypes
      // This makes transformation consistent for both lean and non-lean results
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      obj = obj.toObject();
    } catch {
      // If toObject fails for some reason, fall back to original obj
    }
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformIdKey(item));
  }

  const transformed: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === '_id') {
      transformed.id = String(value);
    } else {
      transformed[key] = transformIdKey(value);
    }
  }

  return transformed;
};
