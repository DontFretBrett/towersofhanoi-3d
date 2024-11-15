export class ErrorHandler {
  static handle(error, context = '') {
    console.error(`[${context}] Error:`, error);

    if (error instanceof TypeError) {
      console.warn(`Type error in ${context}:`, error.message);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.trace(error);
    }
  }

  static async wrapAsync(promise, context = '') {
    try {
      return await promise;
    } catch (error) {
      this.handle(error, context);
      throw error;
    }
  }
} 