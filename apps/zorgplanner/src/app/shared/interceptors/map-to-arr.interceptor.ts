import { HttpInterceptorFn } from '@angular/common/http';

export const mapToArrInterceptor: HttpInterceptorFn = (req, next) => {
  let clonedRequest = req.clone();

  // Check if the body exists
  if (clonedRequest.body) {
    // Convert any Maps in the body to arrays of key-value pairs
    const convertedBody = convertMapsInObject(clonedRequest.body);

    // Update the cloned request body
    clonedRequest = clonedRequest.clone({ body: convertedBody });
  }
  return next(clonedRequest);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function convertMapsInObject(obj: any): any {
    // Iterate over each property in the object
    for (const key of Object.keys(obj)) {
      if (obj[key] instanceof Map) {
        // Convert Map to an array of key-value pairs
        obj[key] = Array.from(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively convert Maps in nested objects
        convertMapsInObject(obj[key]);
      }
    }
    return obj;
  }
};
